/**
 * @file Customer Edit page.
 * Edits an existing AFM_CUSTOMER_INFO record.
 * Displays Audit Log block matching standard system style.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { afmLookupApi } from '../../../../api/afmLookup'
import { afmLookupData } from '../../../../config/afmLookupData'
import { customerApi } from '../api/customerApi'
import CustomerForm from '../components/CustomerForm'
import { mapCustomerFromApi, mapCustomerToApi } from '../data/customerApiMapper'
import { initialCustomerValues, validateCustomer } from '../validation/customerValidation'

function CustomerEdit() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/accounts/voucher-setup/customer')
    ? '/accounts/voucher-setup/customer'
    : '/accounts/customer'

  const [values, setValues] = useState(initialCustomerValues)
  const [auditLog, setAuditLog] = useState(null)
  const [initialFinanceStatus, setInitialFinanceStatus] = useState(null)
  const [agreements, setAgreements] = useState([])
  const [errors, setErrors] = useState({})
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Payment Terms lookup values using centralized afmLookupData.paymentTerms
  useEffect(() => {
    let active = true
    const typeCode = afmLookupData.paymentTerms
    if (!typeCode) return undefined
    const targetBuId = values.BU_ID || undefined

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
  }, [values.BU_ID])

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
        setInitialFinanceStatus(mapped.FINANCE_STATUS || data.financeStatus || 'Draft')
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

  const handleChange = (nameOrObj, value) => {
    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      setValues((prev) => ({ ...prev, ...nameOrObj }))
      setErrors((prev) => {
        const next = { ...prev }
        Object.keys(nameOrObj).forEach((k) => delete next[k])
        return next
      })
      return
    }

    setValues((prev) => {
      const next = { ...prev, [nameOrObj]: value }
      if (nameOrObj === 'AGREEMENT_DATE_FROM' || nameOrObj === 'AGREEMENT_DATE_TO') {
        if (next.AGREEMENT_DATE_FROM && next.AGREEMENT_DATE_TO && next.AGREEMENT_DATE_TO < next.AGREEMENT_DATE_FROM) {
          setErrors((errs) => ({
            ...errs,
            AGREEMENT_DATE_TO: 'Agreement Date (To) must be on or after Agreement Date (From)',
          }))
        } else {
          setErrors((errs) => {
            if (!errs.AGREEMENT_DATE_TO) return errs
            const copy = { ...errs }
            delete copy.AGREEMENT_DATE_TO
            return copy
          })
        }
      }
      return next
    })

    if (errors[nameOrObj] && nameOrObj !== 'AGREEMENT_DATE_TO') {
      setErrors((prev) => ({ ...prev, [nameOrObj]: undefined }))
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

    const wasAlreadyApproved =
      String(initialFinanceStatus || auditLog?.FINANCE_STATUS || '').toLowerCase() === 'approved'

    // Only prompt for approval when transitioning from Draft -> Approved
    // When already Approved in DB, no prompt is needed because financial data cannot be edited
    if (
      String(values.FINANCE_STATUS || '').toLowerCase() === 'approved' &&
      !wasAlreadyApproved
    ) {
      const confirmed = await confirmAction({
        title: 'Approve Financial Agreement?',
        text: 'Payment & Financial Information can not be editable next time. Do you want to Approved and Insert data?',
        action: 'update',
        confirmButtonText: 'Yes, Approve & Insert',
      })
      if (!confirmed) return
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
        customerId={customerId}
        values={values}
        errors={errors}
        isEdit={true}
        paymentTermsOptions={paymentTermsOptions}
        auditLog={auditLog}
        agreements={agreements}
        submitting={submitting}
        submitLabel={'Update Customer'}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onAgreementCreated={(updatedCustomer) => {
          if (updatedCustomer) {
            const mapped = mapCustomerFromApi(updatedCustomer)
            setValues(mapped)
            setAuditLog(mapped.AUDIT_LOG || mapped)
            setInitialFinanceStatus(mapped.FINANCE_STATUS)
          }
          if (customerId) {
            customerApi
              .getFinancialAgreements(customerId)
              .then((res) => setAgreements(Array.isArray(res) ? res : []))
              .catch(() => {})
          }
        }}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default CustomerEdit

