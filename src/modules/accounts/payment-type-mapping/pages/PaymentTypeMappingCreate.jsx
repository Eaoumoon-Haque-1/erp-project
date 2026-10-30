/**
 * @file Payment Type and Payment Through Mapping Create page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
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
  const paymentTypeRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingMappings, setExistingMappings] = useState([])
  const form = usePaymentTypeMappingForm(initialMappingValues)
  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } =
    useBusinessOptions(form.values.BG_ID, { loadUnits: true })

  // Auto-select first Business Group and Business Unit when available if not already selected
  useEffect(() => {
    if (!form.values.BG_ID && groupOptions.length > 0) {
      form.setValues((current) => ({
        ...current,
        BG_ID: groupOptions[0].value,
      }))
    }
  }, [form, groupOptions])

  useEffect(() => {
    if (form.values.BG_ID && !form.values.BU_ID && businessUnitOptions.length > 0) {
      form.setValues((current) => ({
        ...current,
        BU_ID: businessUnitOptions[0].value,
      }))
    }
  }, [form, businessUnitOptions])

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
    const result = form.validate(existingMappings, null)
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
      BG_ID: groupOptions[0]?.value || '',
      BU_ID: businessUnitOptions[0]?.value || '',
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
      onValidate={() => form.validate(existingMappings, null).isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <PaymentTypeMappingForm
        values={form.values}
        errors={form.errors}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
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
