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

  // Fetch Payment Type (PT001 / P001) and Payment Through (PTH001) lookup values strictly for the user's Business Unit
  useEffect(() => {
    let active = true
    const buId = values.BU_ID ? String(values.BU_ID).trim() : ''

    if (!buId) {
      return () => {
        active = false
      }
    }

    Promise.all([
      afmLookupApi.list({ buId }).catch(() => null),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, buId, 1)
        .catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_THROUGH_LOOKUP_CODE, buId, 1)
        .catch(() => []),
    ]).then(async ([lookupTypes, pTypes, pThroughs]) => {
      if (!active) return

      // Filter lookup types strictly to the logged-in user's Business Unit
      const hasLookupTypesList = Array.isArray(lookupTypes)
      const buLookupTypes = hasLookupTypesList
        ? lookupTypes.filter(
            (t) =>
              String(t.buId ?? t.BU_ID ?? '') === buId &&
              String(t.status ?? t.STATUS ?? 1) === '1',
          )
        : []

      const allowedTypeIds = new Set(
        buLookupTypes.map((t) => String(t.id ?? t.ID ?? '')).filter(Boolean),
      )
      const allowedValueIds = new Set()
      buLookupTypes.forEach((t) => {
        ;(t.lookupValues || []).forEach((v) => {
          if (v?.id != null) allowedValueIds.add(String(v.id))
        })
      })

      const filterByBusinessUnit = (items = []) =>
        (items || []).filter((item) => {
          if (String(item?.status ?? item?.STATUS ?? 1) !== '1') return false
          const itemBuId = item?.buId ?? item?.BU_ID ?? item?.bu_id
          if (itemBuId != null && String(itemBuId) !== '') {
            return String(itemBuId) === buId
          }
          if (hasLookupTypesList) {
            const itemTypeId =
              item?.typeNameId ??
              item?.TYPE_NAME_ID ??
              item?.typeId ??
              item?.TYPE_ID
            if (itemTypeId != null && String(itemTypeId) !== '') {
              return allowedTypeIds.has(String(itemTypeId))
            }
            if (item?.id != null) {
              return allowedValueIds.has(String(item.id))
            }
            return false
          }
          return true
        })

      const extractFromBuLookupTypes = (targetCode) => {
        const normalizedCode = String(targetCode).trim().toUpperCase()
        return buLookupTypes
          .filter(
            (t) =>
              String(t.typeCode ?? t.TYPE_CODE ?? '').trim().toUpperCase() ===
              normalizedCode,
          )
          .flatMap((t) =>
            (t.lookupValues || [])
              .filter((v) => String(v.status ?? v.STATUS ?? 1) === '1')
              .map((v) => ({
                ...v,
                buId: t.buId ?? t.BU_ID,
                typeCode: t.typeCode ?? t.TYPE_CODE,
              })),
          )
      }

      let finalPTypes = filterByBusinessUnit(pTypes)
      if (finalPTypes.length === 0 && hasLookupTypesList) {
        finalPTypes = extractFromBuLookupTypes(PAYMENT_TYPE_LOOKUP_CODE)
      }

      let finalPThroughs = filterByBusinessUnit(pThroughs)
      if (finalPThroughs.length === 0 && hasLookupTypesList) {
        finalPThroughs = extractFromBuLookupTypes(PAYMENT_THROUGH_LOOKUP_CODE)
      }

      // If PT001 returned empty for this Business Unit, check P001 for the same Business Unit only
      if (finalPTypes.length === 0) {
        const p001Results = await afmLookupApi
          .getValuesByTypeCode(PAYMENT_TYPE_FALLBACK_CODE, buId, 1)
          .catch(() => [])
        if (!active) return
        finalPTypes = filterByBusinessUnit(p001Results)
        if (finalPTypes.length === 0 && hasLookupTypesList) {
          finalPTypes = extractFromBuLookupTypes(PAYMENT_TYPE_FALLBACK_CODE)
        }
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

  const currentBuId = values.BU_ID ? String(values.BU_ID).trim() : ''
  const lookupsAreCurrent = loadedLookups.buId === currentBuId
  const lookupsLoading = Boolean(currentBuId && !lookupsAreCurrent)

  const paymentTypeOptions = useMemo(
    () =>
      (lookupsAreCurrent ? loadedLookups.pTypes : []).map((val) => ({
        value: String(val.id),
        label: val.value,
        code: val.valueCode,
        typeCode: val.typeCode,
      })),
    [loadedLookups.pTypes, lookupsAreCurrent],
  )

  const paymentThroughOptions = useMemo(
    () =>
      (lookupsAreCurrent ? loadedLookups.pThroughs : []).map((val) => ({
        value: String(val.id),
        label: val.value,
        code: val.valueCode,
        typeCode: val.typeCode,
      })),
    [loadedLookups.pThroughs, lookupsAreCurrent],
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

  const validate = (existingMappings = [], currentId = null, overrides = {}) => {
    const result = validatePaymentTypeMapping(
      { ...values, ...overrides },
      existingMappings,
      currentId,
    )
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
