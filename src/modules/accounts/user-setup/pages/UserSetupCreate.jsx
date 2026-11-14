/**
 * @file User Setup Create page.
 * Creates a new AFM_USER_SETUP record.
 * Group Name and Business Unit are retrieved from session and not shown in form.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { mapUserSetupToApi } from '../data/userSetupApiMapper'
import { initialUserSetupValues, validateUserSetup } from '../validation/userSetupValidation'

const listPath = '/accounts/voucher-setup/user-setup'

function UserSetupCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [values, setValues] = useState({
    ...initialUserSetupValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Options state
  const [userOptions, setUserOptions] = useState([])
  const [voucherTypeOptions, setVoucherTypeOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [bankAccountOptions, setBankAccountOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])

  const [usersLoading, setUsersLoading] = useState(Boolean(sessionBusinessUnitId))
  const [lookupsLoading, setLookupsLoading] = useState(Boolean(sessionBusinessUnitId))
  const [locationsLoading, setLocationsLoading] = useState(Boolean(sessionBusinessUnitId))
  const [bankAccountsLoading, setBankAccountsLoading] = useState(Boolean(sessionBusinessUnitId))
  const [costCentersLoading, setCostCentersLoading] = useState(Boolean(sessionGroupId))

  // Load available users
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    userSetupApi
      .getAvailableUsers(sessionGroupId, sessionBusinessUnitId)
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
  }, [sessionGroupId, sessionBusinessUnitId])

  // Load voucher types from centralized afmLookupData.voucherType
  useEffect(() => {
    let active = true
    const typeCode = afmLookupData.voucherType
    if (!typeCode) {
      setLookupsLoading(false)
      return undefined
    }

    afmLookupApi
      .getValuesByTypeCode(typeCode, sessionBusinessUnitId || undefined, 1)
      .catch(() => afmLookupApi.getValuesByCode(typeCode, sessionBusinessUnitId || undefined, 1))
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
  }, [sessionBusinessUnitId])

  // Load locations
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    userLocationApi
      .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined, status: 1 })
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
  }, [sessionBusinessUnitId, sessionGroupId])

  // Load bank accounts
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    bankApi
      .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined, status: 1 })
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
  }, [sessionBusinessUnitId, sessionGroupId])

  // Load cost centers (departments)
  useEffect(() => {
    if (!sessionGroupId) return undefined
    let active = true

    departmentsApi
      .list(sessionGroupId)
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
  }, [sessionGroupId])

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
      const payload = mapUserSetupToApi({
        ...values,
        BG_ID: values.BG_ID || sessionGroupId,
        BU_ID: values.BU_ID || sessionBusinessUnitId,
      })
      await userSetupApi.create(payload)
      showSuccess('User Setup created successfully')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create User Setup')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialUserSetupValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setErrors({})
  }

  return (
    <FormPage
      title={'Add New User Setup'}
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
        isEdit={false}
        readOnly={false}
        submitLabel={'Submit'}
        submitting={submitting}
        onChange={handleChange}
        onMultiSelectChange={handleMultiSelectChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default UserSetupCreate

