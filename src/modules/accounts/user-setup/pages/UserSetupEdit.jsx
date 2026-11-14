/**
 * @file User Setup Edit page.
 * Edits an existing AFM_USER_SETUP record.
 * Group Name and Business Unit are retrieved from session and not shown in form.
 * Audit Log block displayed matching BankChequeMapForm style.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { afmLookupData } from '../../../../config/afmLookupData'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { bankApi } from '../../bank/api/bankApi'
import { userLocationApi } from '../../user-location/api/userLocationApi'
import { userSetupApi } from '../api/userSetupApi'
import UserSetupForm from '../components/UserSetupForm'
import { mapUserSetupFromApi, mapUserSetupToApi } from '../data/userSetupApiMapper'
import { initialUserSetupValues, validateUserSetup } from '../validation/userSetupValidation'

const listPath = '/accounts/voucher-setup/user-setup'

function UserSetupEdit() {
  const { setupId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [values, setValues] = useState(initialUserSetupValues)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Options state
  const [userOptions, setUserOptions] = useState([])
  const [voucherTypeOptions, setVoucherTypeOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [bankAccountOptions, setBankAccountOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])

  const [usersLoading, setUsersLoading] = useState(true)
  const [lookupsLoading, setLookupsLoading] = useState(true)
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true)
  const [costCentersLoading, setCostCentersLoading] = useState(true)

  // Load existing User Setup record
  useEffect(() => {
    if (!setupId) return
    let active = true

    userSetupApi
      .get(setupId)
      .then((data) => {
        if (!active) return
        setOriginalRecord(data)
        const mapped = mapUserSetupFromApi(data)
        setValues(mapped)
        setAuditLog(mapped)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load user setup record'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [setupId])

  // Load available users
  useEffect(() => {
    const bgId = values.BG_ID || sessionGroupId
    const buId = values.BU_ID || sessionBusinessUnitId
    if (!buId) return undefined
    let active = true

    userSetupApi
      .getAvailableUsers(bgId, buId)
      .then((data) => {
        if (!active) return
        const opts = (data || []).map((u) => ({
          value: String(u.userId),
          label: u.displayLabel || `${u.userName} : ${u.employeeCode || '-'} : ${u.employeeName || '-'}`,
          userName: u.userName,
          code: u.employeeCode,
        }))
        setUserOptions(opts)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load users'))
      })
      .finally(() => {
        if (active) setUsersLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.BG_ID, values.BU_ID, sessionGroupId, sessionBusinessUnitId])

  // Load voucher types from centralized afmLookupData.voucherType
  useEffect(() => {
    const buId = values.BU_ID || sessionBusinessUnitId || undefined
    let active = true
    const typeCode = afmLookupData.voucherType
    if (!typeCode) {
      setLookupsLoading(false)
      return undefined
    }

    afmLookupApi
      .getValuesByTypeCode(typeCode, buId, 1)
      .catch(() => afmLookupApi.getValuesByCode(typeCode, buId, 1))
      .then((data) => {
        if (!active) return
        const opts = (data || []).map((item) => ({
          value: String(item.id),
          label: item.value || item.valueCode || String(item.id),
          code: item.valueCode,
        }))
        setVoucherTypeOptions(opts)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load voucher types'))
      })
      .finally(() => {
        if (active) setLookupsLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.BU_ID, sessionBusinessUnitId])

  // Load locations
  useEffect(() => {
    const buId = values.BU_ID || sessionBusinessUnitId
    const bgId = values.BG_ID || sessionGroupId
    if (!buId) return undefined
    let active = true

    userLocationApi
      .list({ buId, bgId: bgId || undefined, status: 1 })
      .then((data) => {
        if (!active) return
        const opts = (data || []).map((loc) => ({
          value: String(loc.id),
          label: loc.location + (loc.shortName ? ` (${loc.shortName})` : ''),
        }))
        setLocationOptions(opts)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load user locations'))
      })
      .finally(() => {
        if (active) setLocationsLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.BU_ID, values.BG_ID, sessionBusinessUnitId, sessionGroupId])

  // Load bank accounts
  useEffect(() => {
    const buId = values.BU_ID || sessionBusinessUnitId
    const bgId = values.BG_ID || sessionGroupId
    if (!buId) return undefined
    let active = true

    bankApi
      .list({ buId, bgId: bgId || undefined, status: 1 })
      .then((banks) => {
        if (!active) return
        const accounts = (banks || []).flatMap((bank) =>
          (bank.bankDetails || []).map((detail) => {
            const accNum = String(detail.accountNumber ?? detail.accountNo ?? '').trim()
            const branchStr = detail.branchName ? ` (${detail.branchName.trim()})` : ''
            const bankName = bank.bankName || bank.shortName || 'Bank'
            return {
              value: String(detail.id),
              label: `${bankName} : ${accNum || detail.accountName || 'Account'}${branchStr}`,
            }
          }),
        )
        setBankAccountOptions(accounts)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load bank accounts'))
      })
      .finally(() => {
        if (active) setBankAccountsLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.BU_ID, values.BG_ID, sessionBusinessUnitId, sessionGroupId])

  // Load cost centers (departments)
  useEffect(() => {
    const bgId = values.BG_ID || sessionGroupId
    if (!bgId) return undefined
    let active = true

    departmentsApi
      .list(bgId)
      .then((depts) => {
        if (!active) return
        const opts = (depts || []).map((d) => ({
          value: String(d.id),
          label: d.departmentName || d.name,
        }))
        setCostCenterOptions(opts)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load cost centers'))
      })
      .finally(() => {
        if (active) setCostCentersLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.BG_ID, sessionGroupId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleMultiSelectChange = (name, nextValue) => {
    setValues((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async () => {
    const validationErrors = validateUserSetup(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showError('Please correct validation errors before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const payload = mapUserSetupToApi(values)
      await userSetupApi.update(setupId, payload)
      showSuccess('User Setup updated successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update User Setup')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalRecord) {
      setValues(mapUserSetupFromApi(originalRecord))
    }
    setErrors({})
  }

  if (loading) {
    return (
      <FormPage
        title={'Edit User Setup'}
        backTo={listPath}
        backLabel={'Back to User Setup'}
        hideActions
      >
        <div className={'p-6 text-center text-sm text-gray-500'}>
          Loading User Setup details...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={'Edit User Setup'}
      backTo={listPath}
      backLabel={'Back to User Setup'}
      hideActions
    >
      <UserSetupForm
        values={values}
        errors={errors}
        userOptions={userOptions}
        voucherTypeOptions={voucherTypeOptions}
        locationOptions={locationOptions}
        bankAccountOptions={bankAccountOptions}
        costCenterOptions={costCenterOptions}
        usersLoading={usersLoading}
        lookupsLoading={lookupsLoading}
        locationsLoading={locationsLoading}
        bankAccountsLoading={bankAccountsLoading}
        costCentersLoading={costCentersLoading}
        isEdit={true}
        readOnly={false}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        onChange={handleChange}
        onMultiSelectChange={handleMultiSelectChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default UserSetupEdit

