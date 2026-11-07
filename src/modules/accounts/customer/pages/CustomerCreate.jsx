/**
 * @file Customer Create page.
 * Creates a new AFM_CUSTOMER_INFO record.
 * Group Name and Business Unit are retrieved from session and not shown in form.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { customerApi } from '../api/customerApi'
import CustomerForm from '../components/CustomerForm'
import { mapCustomerToApi } from '../data/customerApiMapper'
import { initialCustomerValues, validateCustomer } from '../validation/customerValidation'

const listPath = '/accounts/customer'

function CustomerCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(() => {
    const fromParams = {}
    if (typeof window !== 'undefined' && window.location.search) {
      const sp = new URLSearchParams(window.location.search)
      for (const [key, val] of sp.entries()) {
        fromParams[key] = val
      }
    }
    return {
      ...initialCustomerValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
      ...fromParams,
    }
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Sync if URL search params change
  useEffect(() => {
    if (location.search) {
      const sp = new URLSearchParams(location.search)
      const fromParams = {}
      for (const [key, val] of sp.entries()) {
        fromParams[key] = val
      }
      if (Object.keys(fromParams).length > 0) {
        setValues((prev) => ({ ...prev, ...fromParams }))
      }
    }
  }, [location.search])

  // Auto-fetch next customer code
  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    customerApi
      .getNextCode(sessionBuId)
      .then((res) => {
        if (!active) return
        if (res?.customerCode) {
          setValues((prev) => ({
            ...prev,
            CUSTOMER_CODE: prev.CUSTOMER_CODE || res.customerCode,
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

  // Update session IDs and resolve BG_ID from BU if needed
  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      BG_ID: sessionGroupId || prev.BG_ID,
      BU_ID: sessionBuId || prev.BU_ID,
    }))

    if (!sessionGroupId && sessionBuId) {
      businessUnitsApi
        .get(sessionBuId)
        .then((bu) => {
          if (bu?.bgId) {
            setValues((prev) => ({
              ...prev,
              BG_ID: String(bu.bgId),
            }))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBuId])

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
      let submitBgId = sessionGroupId || values.BG_ID
      let submitBuId = sessionBuId || values.BU_ID

      if (!submitBuId || !submitBgId) {
        try {
          const bus = await businessUnitsApi.list({ status: 1 })
          const list = Array.isArray(bus) ? bus : []
          if (list.length > 0) {
            if (!submitBuId) submitBuId = String(list[0].id)
            const matchedBu = list.find((b) => String(b.id) === String(submitBuId)) || list[0]
            if (matchedBu?.bgId) {
              submitBgId = String(matchedBu.bgId)
            }
          }
        } catch {
          // fallback
        }
      } else if (!submitBgId && submitBuId) {
        try {
          const bu = await businessUnitsApi.get(submitBuId)
          if (bu?.bgId) submitBgId = String(bu.bgId)
        } catch {
          // fallback
        }
      }

      const submitValues = {
        ...values,
        BG_ID: submitBgId,
        BU_ID: submitBuId,
      }

      const payload = mapCustomerToApi(submitValues)
      await customerApi.create(payload)
      showSuccess('Customer created successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create Customer')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'Create Customer'}
      backTo={listPath}
      backLabel={'Back to Customer List'}
      hideActions
    >
      <CustomerForm
        values={values}
        errors={errors}
        submitting={submitting}
        submitLabel={'Save Customer'}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default CustomerCreate

