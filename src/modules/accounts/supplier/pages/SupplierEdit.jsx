/**
 * @file Supplier Edit page.
 * Edits an existing AFM_SUPPLIER_INFO record.
 * Displays Audit Log block matching standard system style.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { supplierApi } from '../api/supplierApi'
import SupplierForm from '../components/SupplierForm'
import { mapSupplierFromApi, mapSupplierToApi } from '../data/supplierApiMapper'
import { initialSupplierValues, validateSupplier } from '../validation/supplierValidation'

const listPath = '/accounts/supplier'

function SupplierEdit() {
  const { supplierId } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialSupplierValues)
  const [auditLog, setAuditLog] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supplierId) return
    let active = true

    supplierApi
      .get(supplierId)
      .then((data) => {
        if (!active) return
        const mapped = mapSupplierFromApi(data)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG || mapped)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load supplier details.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [supplierId])

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
      await supplierApi.update(supplierId, payload)
      showSuccess('Supplier updated successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update Supplier')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPage
        title={'Edit Supplier Information'}
        backTo={listPath}
        backLabel={'Back to Supplier List'}
        hideActions
      >
        <div className={'p-8 text-center text-xs text-gray-500'}>
          Loading supplier details...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Supplier Information: ${values.SUPPLIER_NAME || values.SUPPLIER_CODE || ''}`}
      backTo={listPath}
      backLabel={'Back to Supplier List'}
      hideActions
    >
      <SupplierForm
        values={values}
        errors={errors}
        isEdit={true}
        readOnly={false}
        auditLog={auditLog}
        submitting={submitting}
        submitLabel={'Update Supplier'}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default SupplierEdit

