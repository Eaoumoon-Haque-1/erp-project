/**
 * @file Custom hook managing form state, lookup options, and validations for Payment Type Mapping.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import { showError } from '../../../../components/shared/actionAlerts'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import {
  initialMappingValues,
  validatePaymentTypeMapping,
} from '../validation/paymentTypeMappingValidation'

export const PAYMENT_TYPE_LOOKUP_CODE = 'PT001'
export const PAYMENT_TYPE_FALLBACK_CODE = 'P001'
export const PAYMENT_THROUGH_LOOKUP_CODE = 'PTH001'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function usePaymentTypeMappingForm(
  initialFormValues = initialMappingValues,
) {
  const [values, setValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [loadedLookups, setLoadedLookups] = useState({
    buId: '',
    pTypes: [],
    pThroughs: [],
  })

  // Fetch Payment Type (PT001 / P001) and Payment Through (PTH001) lookup values using the endpoint
  useEffect(() => {
    let active = true
    const buId = values.BU_ID ? String(values.BU_ID) : ''

    Promise.all([
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, buId || undefined, 1)
        .catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_THROUGH_LOOKUP_CODE, buId || undefined, 1)
        .catch(() => []),
    ]).then(async ([pTypes, pThroughs]) => {
      if (!active) return

      let finalPTypes = pTypes || []
      let finalPThroughs = pThroughs || []

      // If PT001 returned empty, check P001 fallback
      if (finalPTypes.length === 0) {
        const p001Results = await afmLookupApi
          .getValuesByTypeCode(PAYMENT_TYPE_FALLBACK_CODE, buId || undefined, 1)
          .catch(() => [])
        if (active && p001Results?.length) finalPTypes = p001Results
      }

      // Fallback: If BU-filtered query returned empty, try fallback to all active for that typeCode
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
      if (buId && finalPThroughs.length === 0) {
        const fallback = await afmLookupApi
          .getValuesByTypeCode(PAYMENT_THROUGH_LOOKUP_CODE, undefined, 1)
          .catch(() => [])
        if (active && fallback?.length) finalPThroughs = fallback
      }

      if (!active) return
      setLoadedLookups({
        buId,
        pTypes: finalPTypes,
        pThroughs: finalPThroughs,
      })
    })

    return () => {
      active = false
    }
  }, [values.BU_ID])

  const lookupsAreCurrent = loadedLookups.buId === String(values.BU_ID || '')
  const lookupsLoading = Boolean(values.BU_ID && !lookupsAreCurrent)

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

  const paymentThroughOptions = useMemo(
    () =>
      loadedLookups.pThroughs.map((val) => ({
        value: String(val.id),
        label: val.value,
        code: val.valueCode,
        typeCode: val.typeCode,
      })),
    [loadedLookups.pThroughs],
  )

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BG_ID') {
        next.BU_ID = ''
        next.PAYMENT_TYPE_ID = ''
        next.PAYMENT_THROUGH_ID = ''
      }
      if (name === 'BU_ID') {
        next.PAYMENT_TYPE_ID = ''
        next.PAYMENT_THROUGH_ID = ''
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = (existingMappings = [], currentId = null) => {
    const result = validatePaymentTypeMapping(values, existingMappings, currentId)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  const reset = useCallback((nextValues) => {
    setValues(nextValues || initialMappingValues)
    setErrors({})
  }, [])

  const failWithApiError = async (error, fallbackMessage) => {
    const normalized = normalizeApiError(error, fallbackMessage, {
      bgId: 'BG_ID',
      buId: 'BU_ID',
      paymentTypeId: 'PAYMENT_TYPE_ID',
      paymentThroughId: 'PAYMENT_THROUGH_ID',
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
      nextErrors.PAYMENT_THROUGH_ID = message
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
    paymentTypeOptions,
    paymentThroughOptions,
    lookupsLoading,
    handleChange,
    validate,
    reset,
    failWithApiError,
  }
}
