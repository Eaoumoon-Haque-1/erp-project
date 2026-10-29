/**
 * @file Voucher and Payment Type Mapping Create page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { voucherTypeMappingApi } from '../api/voucherTypeMappingApi'
import VoucherTypeMappingForm from '../components/VoucherTypeMappingForm'
import { mapVoucherMappingToApi } from '../data/voucherTypeMappingApiMapper'
import useVoucherTypeMappingForm from '../data/useVoucherTypeMappingForm'
import {
  AFM_V_TYPE_P_TYPE_MAP_TABLE,
  initialVoucherMappingValues,
} from '../validation/voucherTypeMappingValidation'

const listPath = '/accounts/voucher-setup/voucher-type-mapping'

function VoucherTypeMappingCreate() {
  const navigate = useNavigate()
  const voucherTypeRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingMappings, setExistingMappings] = useState([])
  const form = useVoucherTypeMappingForm(initialVoucherMappingValues)
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
    voucherTypeMappingApi
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
      await voucherTypeMappingApi.create(mapVoucherMappingToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Voucher Type Mapping.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset({
      ...initialVoucherMappingValues,
      BG_ID: groupOptions[0]?.value || '',
      BU_ID: businessUnitOptions[0]?.value || '',
    })
    requestAnimationFrame(() => voucherTypeRef.current?.focus())
  }

  return (
    <FormPage
      title={'Voucher and Payment Type Mapping'}
      listTo={listPath}
      tableName={AFM_V_TYPE_P_TYPE_MAP_TABLE}
      submitLabel={'Submit'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={() => form.validate(existingMappings, null).isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <VoucherTypeMappingForm
        values={form.values}
        errors={form.errors}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        voucherTypeOptions={form.voucherTypeOptions}
        paymentTypeOptions={form.paymentTypeOptions}
        lookupsLoading={form.lookupsLoading}
        submitLabel={'Submit'}
        submitting={submitting}
        voucherTypeRef={voucherTypeRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default VoucherTypeMappingCreate
