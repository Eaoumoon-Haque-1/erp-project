/**
 * @file Customer View page.
 * Displays details of an existing AFM_CUSTOMER_INFO record with Audit Log block.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { customerApi } from '../api/customerApi'
import CustomerForm from '../components/CustomerForm'
import { mapCustomerFromApi } from '../data/customerApiMapper'
import { initialCustomerValues } from '../validation/customerValidation'

function CustomerView() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.includes('/voucher-setup/customer')
    ? '/accounts/voucher-setup/customer'
    : (location.pathname.includes('/customer-info') ? '/accounts/customer-info' : '/accounts/customer')
  const createPath = `${listPath}/create`

  const [values, setValues] = useState(initialCustomerValues)
  const [auditLog, setAuditLog] = useState(null)
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)

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

    customerApi
      .getFinancialAgreements(customerId)
      .then((res) => {
        if (!active) return
        setAgreements(Array.isArray(res) ? res : [])
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [customerId])

  if (loading) {
    return (
      <FormPage
        title={'View Customer'}
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
      title={`Customer Information: ${values.CUSTOMER_NAME || values.CUSTOMER_CODE || ''}`}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back To List'}
      createTo={createPath}
      createLabel={'Create New'}
      actions={[
        {
          label: 'Edit',
          to: `${listPath}/${customerId}/edit`,
          variant: 'primary',
        },
      ]}
      hideActions
    >
      <CustomerForm
        customerId={customerId}
        values={values}
        errors={{}}
        isEdit={true}
        readOnly={true}
        auditLog={auditLog}
        agreements={agreements}
        editLabel={'Edit Customer'}
        onEdit={() => navigate(`${listPath}/${customerId}/edit`)}
        onChange={(updates) => {
          if (typeof updates === 'object' && updates !== null) {
            setValues((prev) => ({ ...prev, ...updates }))
          }
        }}
        onAgreementCreated={(updatedCustomer) => {
          if (updatedCustomer) {
            const mapped = mapCustomerFromApi(updatedCustomer)
            setValues(mapped)
            setAuditLog(mapped.AUDIT_LOG || mapped)
          }
          if (customerId) {
            customerApi
              .getFinancialAgreements(customerId)
              .then((res) => setAgreements(Array.isArray(res) ? res : []))
              .catch(() => {})
          }
        }}
      />
    </FormPage>
  )
}

export default CustomerView

