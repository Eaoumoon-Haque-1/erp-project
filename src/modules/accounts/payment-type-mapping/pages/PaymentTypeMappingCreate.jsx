/**
 * @file Payment Type and Payment Through Mapping Create page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { paymentTypeMappingApi } from '../api/paymentTypeMappingApi'
import PaymentTypeMappingForm from '../components/PaymentTypeMappingForm'
import { mapMappingToApi } from '../data/paymentTypeMappingApiMapper'
import usePaymentTypeMappingForm from '../data/usePaymentTypeMappingForm'
import {
  AFM_P_TYPE_P_THROUGH_MAP_TABLE,
  initialMappingValues,
} from '../validation/paymentTypeMappingValidation'

const listPath = '/accounts/voucher-setup/payment-type-mapping'

function PaymentTypeMappingCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const paymentTypeRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingMappings, setExistingMappings] = useState([])
  const form = usePaymentTypeMappingForm({
    ...initialMappingValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })
  const { setValues } = form

  // Sync Group Name (BG_ID) and Business Unit (BU_ID) from logged-in session
  useEffect(() => {
    setValues((current) => {
      const nextBgId = sessionGroupId || current.BG_ID
      const nextBuId = sessionBusinessUnitId || current.BU_ID
      if (current.BG_ID === nextBgId && current.BU_ID === nextBuId) {
        return current
      }
      return {
        ...current,
        BG_ID: nextBgId,
        BU_ID: nextBuId,
      }
    })
  }, [sessionBusinessUnitId, sessionGroupId, setValues])

  // Cache existing mappings for duplicate check
  useEffect(() => {
    let active = true
    paymentTypeMappingApi
      .list()
      .then((records) => {
        if (!active) return
        setExistingMappings(records || [])
      })
      .catch(() => {
        if (!active) return
        setExistingMappings([])
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate(existingMappings, null, {
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await paymentTypeMappingApi.create(mapMappingToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Payment Type Mapping.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset({
      ...initialMappingValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    requestAnimationFrame(() => paymentTypeRef.current?.focus())
  }

  return (
    <FormPage
      title={'Payment Type and Payment Through Mapping'}
      listTo={listPath}
      tableName={AFM_P_TYPE_P_THROUGH_MAP_TABLE}
      submitLabel={'Submit'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={() =>
        form.validate(existingMappings, null, {
          BG_ID: sessionGroupId,
          BU_ID: sessionBusinessUnitId,
        }).isValid
      }
      onReset={handleReset}
      submitting={submitting}
    >
      <PaymentTypeMappingForm
        values={form.values}
        errors={form.errors}
        paymentTypeOptions={form.paymentTypeOptions}
        paymentThroughOptions={form.paymentThroughOptions}
        lookupsLoading={form.lookupsLoading}
        submitLabel={'Submit'}
        submitting={submitting}
        paymentTypeRef={paymentTypeRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default PaymentTypeMappingCreate
