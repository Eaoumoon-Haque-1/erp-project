/**
 * @file Customer Edit page.
 * Edits an existing AFM_CUSTOMER_INFO record.
 * Displays Audit Log block matching standard system style.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { customerApi } from '../api/customerApi'
import CustomerForm from '../components/CustomerForm'
import { mapCustomerFromApi, mapCustomerToApi } from '../data/customerApiMapper'
import { initialCustomerValues, validateCustomer } from '../validation/customerValidation'

const listPath = '/accounts/customer'

function CustomerEdit() {
  const { customerId } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialCustomerValues)
  const [auditLog, setAuditLog] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!customerId) return
    let active = true

    customerApi
      .get(customerId)
      .then((data) => {
        if (!active) return
        const mapped = mapCustomerFromApi(data)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG || mapped)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load customer details.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [customerId])

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const validationErrors = validateCustomer(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showError('Please correct the highlighted errors before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const payload = mapCustomerToApi(values)
      await customerApi.update(customerId, payload)
      showSuccess('Customer updated successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update Customer')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPage
        title={'Edit Customer Information'}
        backTo={listPath}
        backLabel={'Back to Customer List'}
        hideActions
      >
        <div className={'p-8 text-center text-xs text-gray-500'}>
          Loading customer details...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Customer Information: ${values.CUSTOMER_NAME || values.CUSTOMER_CODE || ''}`}
      backTo={listPath}
      backLabel={'Back to Customer List'}
      hideActions
    >
      <CustomerForm
        values={values}
        errors={errors}
        isEdit={true}
        auditLog={auditLog}
        submitting={submitting}
        submitLabel={'Update Customer'}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default CustomerEdit

