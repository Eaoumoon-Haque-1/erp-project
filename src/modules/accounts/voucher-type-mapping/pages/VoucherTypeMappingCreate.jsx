/**
 * @file Voucher and Payment Type Mapping Create page.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
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
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const voucherTypeRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingMappings, setExistingMappings] = useState([])
  const form = useVoucherTypeMappingForm({
    ...initialVoucherMappingValues,
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
    const result = form.validate(existingMappings, null, {
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
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
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
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
      onValidate={() =>
        form.validate(existingMappings, null, {
          BG_ID: sessionGroupId,
          BU_ID: sessionBusinessUnitId,
        }).isValid
      }
      onReset={handleReset}
      submitting={submitting}
    >
      <VoucherTypeMappingForm
        values={form.values}
        errors={form.errors}
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
