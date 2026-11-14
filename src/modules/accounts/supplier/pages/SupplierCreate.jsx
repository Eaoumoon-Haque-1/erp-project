/**
 * @file Supplier Create page.
 * Creates a new AFM_SUPPLIER_INFO record.
 * Group Name and Business Unit are retrieved from session and not shown in form.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { afmLookupApi } from '../../../../api/afmLookup'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { afmLookupData } from '../../../../config/afmLookupData'
import { supplierApi } from '../api/supplierApi'
import SupplierForm from '../components/SupplierForm'
import { mapSupplierToApi } from '../data/supplierApiMapper'
import { initialSupplierValues, validateSupplier } from '../validation/supplierValidation'

function SupplierCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/accounts/voucher-setup/supplier')
    ? '/accounts/voucher-setup/supplier'
    : '/accounts/supplier'
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState({
    ...initialSupplierValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
  })
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Fetch Payment Terms lookup values using centralized afmLookupData.paymentTerms
  useEffect(() => {
    let active = true
    const typeCode = afmLookupData.paymentTerms
    if (!typeCode) return undefined
    const targetBuId = sessionBuId || undefined

    const fetchPaymentTerms = async () => {
      try {
        let res = await afmLookupApi
          .getValuesByTypeCode(typeCode, targetBuId, 1)
          .catch(() => afmLookupApi.getValuesByCode(typeCode, targetBuId, 1))

        if ((!res || res.length === 0) && targetBuId) {
          res = await afmLookupApi
            .getValuesByTypeCode(typeCode, undefined, 1)
            .catch(() => afmLookupApi.getValuesByCode(typeCode, undefined, 1))
        }

        if (!active) return
        const opts = (res || [])
          .filter((item) => item.status === undefined || item.status === null || Number(item.status) === 1)
          .map((item) => ({
            value: item.value || item.valueCode || String(item.id),
            label: item.value || item.valueCode || String(item.id),
            code: item.valueCode,
          }))
        setPaymentTermsOptions(opts)
      } catch {
        // proceed
      }
    }

    fetchPaymentTerms()
    return () => {
      active = false
    }
  }, [sessionBuId])

  // Auto-fetch next supplier code
  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    supplierApi
      .getNextCode(sessionBuId)
      .then((res) => {
        if (!active) return
        if (res?.supplierCode) {
          setValues((prev) => ({
            ...prev,
            SUPPLIER_CODE: prev.SUPPLIER_CODE || res.supplierCode,
          }))
        }
      })
      .catch(() => {
        // Fallback default
      })

    return () => {
      active = false
    }
  }, [sessionBuId])

  // Update session IDs
  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    }))
  }, [sessionGroupId, sessionBuId])

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async () => {
    const validationErrors = validateSupplier(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showError('Please correct the highlighted errors before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const payload = mapSupplierToApi(values)
      await supplierApi.create(payload)
      showSuccess('Supplier created successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create Supplier')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'Create Supplier'}
      backTo={listPath}
      backLabel={'Back to Supplier List'}
      hideActions
    >
      <SupplierForm
        values={values}
        paymentTermsOptions={paymentTermsOptions}
        errors={errors}
        isEdit={false}
        readOnly={false}
        submitting={submitting}
        submitLabel={'Save Supplier'}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default SupplierCreate

