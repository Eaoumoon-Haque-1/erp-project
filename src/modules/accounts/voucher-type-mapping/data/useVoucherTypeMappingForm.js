/**
 * @file Custom hook managing form state, lookup options, and validations for Voucher and Payment Type Mapping.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import { showError } from '../../../../components/shared/actionAlerts'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import {
  initialVoucherMappingValues,
  validateVoucherTypeMapping,
} from '../validation/voucherTypeMappingValidation'

export const VOUCHER_TYPE_LOOKUP_CODE = 'VT001'
export const PAYMENT_TYPE_LOOKUP_CODE = 'PT001'
export const PAYMENT_TYPE_FALLBACK_CODE = 'P001'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function useVoucherTypeMappingForm(
  initialFormValues = initialVoucherMappingValues,
) {
  const [values, setValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [loadedLookups, setLoadedLookups] = useState({
    buId: '',
    vTypes: [],
    pTypes: [],
  })

  // Fetch Voucher Type (VT001) and Payment Type (PT001 / P001) lookup values using the endpoint
  useEffect(() => {
    let active = true
    const buId = values.BU_ID ? String(values.BU_ID) : ''

    Promise.all([
      afmLookupApi
        .getValuesByTypeCode(VOUCHER_TYPE_LOOKUP_CODE, buId || undefined, 1)
        .catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, buId || undefined, 1)
        .catch(() => []),
    ]).then(async ([vTypes, pTypes]) => {
      if (!active) return

      let finalVTypes = vTypes || []
      let finalPTypes = pTypes || []

      // If PT001 returned empty, check P001 fallback
      if (finalPTypes.length === 0) {
        const p001Results = await afmLookupApi
          .getValuesByTypeCode(PAYMENT_TYPE_FALLBACK_CODE, buId || undefined, 1)
          .catch(() => [])
        if (active && p001Results?.length) finalPTypes = p001Results
      }

      // Fallback: If BU-filtered query returned empty, query globally for active records
      if (buId && finalVTypes.length === 0) {
        const fallback = await afmLookupApi
          .getValuesByTypeCode(VOUCHER_TYPE_LOOKUP_CODE, undefined, 1)
          .catch(() => [])
        if (active && fallback?.length) finalVTypes = fallback
      }
      if (buId && finalPTypes.length === 0) {
        const fallback = await afmLookupApi
          .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, undefined, 1)
          .catch(() => [])
        if (active && fallback?.length) finalPTypes = fallback
        else {
          const fallback2 = await afmLookupApi
            .getValuesByTypeCode(PAYMENT_TYPE_FALLBACK_CODE, undefined, 1)
            .catch(() => [])
          if (active && fallback2?.length) finalPTypes = fallback2
        }
      }

      if (!active) return
      setLoadedLookups({
        buId,
        vTypes: finalVTypes,
        pTypes: finalPTypes,
      })
    })

    return () => {
      active = false
    }
  }, [values.BU_ID])

  const lookupsAreCurrent = loadedLookups.buId === String(values.BU_ID || '')
  const lookupsLoading = Boolean(values.BU_ID && !lookupsAreCurrent)

  const voucherTypeOptions = useMemo(
    () =>
      loadedLookups.vTypes.map((val) => ({
        value: String(val.id),
        label: val.value,
        code: val.valueCode,
        typeCode: val.typeCode,
      })),
    [loadedLookups.vTypes],
  )

  const paymentTypeOptions = useMemo(
    () =>
      loadedLookups.pTypes.map((val) => ({
        value: String(val.id),
        label: val.value,
        code: val.valueCode,
        typeCode: val.typeCode,
      })),
    [loadedLookups.pTypes],
  )

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BG_ID') {
        next.BU_ID = ''
        next.VOUCHER_TYPE_ID = ''
        next.PAYMENT_TYPE_ID = ''
      }
      if (name === 'BU_ID') {
        next.VOUCHER_TYPE_ID = ''
        next.PAYMENT_TYPE_ID = ''
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = (existingMappings = [], currentId = null) => {
    const result = validateVoucherTypeMapping(values, existingMappings, currentId)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  const reset = useCallback((nextValues) => {
    setValues(nextValues || initialVoucherMappingValues)
    setErrors({})
  }, [])

  const failWithApiError = async (error, fallbackMessage) => {
    const normalized = normalizeApiError(error, fallbackMessage, {
      bgId: 'BG_ID',
      buId: 'BU_ID',
      voucherTypeId: 'VOUCHER_TYPE_ID',
      paymentTypeId: 'PAYMENT_TYPE_ID',
      status: 'STATUS',
    })

    const message = normalized.message
    const lower = String(message).toLowerCase()
    const nextErrors = { ...normalized.fieldErrors }

    if (
      lower.includes('already exists') ||
      lower.includes('duplicate') ||
      lower.includes('mapping already exists')
    ) {
      nextErrors.PAYMENT_TYPE_ID = message
    }

    setErrors((current) => ({ ...current, ...nextErrors }))
    await showError(message)
    getApiErrorMessage(error, fallbackMessage)
  }

  return {
    values,
    setValues,
    errors,
    setErrors,
    voucherTypeOptions,
    paymentTypeOptions,
    lookupsLoading,
    handleChange,
    validate,
    reset,
    failWithApiError,
  }
}
