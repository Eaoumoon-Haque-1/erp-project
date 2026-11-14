/**
 * @file User Setup View page.
 * Displays details of an existing AFM_USER_SETUP record with Audit Log block.
 * Group Name and Business Unit are retrieved from session and not shown in form.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { afmLookupData } from '../../../../config/afmLookupData'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { bankApi } from '../../bank/api/bankApi'
import { userLocationApi } from '../../user-location/api/userLocationApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { userSetupApi } from '../api/userSetupApi'
import UserSetupForm from '../components/UserSetupForm'
import { mapUserSetupFromApi } from '../data/userSetupApiMapper'
import { initialUserSetupValues } from '../validation/userSetupValidation'

const listPath = '/accounts/voucher-setup/user-setup'

function UserSetupView() {
  const { setupId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [values, setValues] = useState(initialUserSetupValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  const [userOptions, setUserOptions] = useState([])
  const [voucherTypeOptions, setVoucherTypeOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [bankAccountOptions, setBankAccountOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])

  useEffect(() => {
    let active = true
    usersApi
      .list()
      .then((users) => {
        if (!active) return
        const opts = (users || []).map((u) => ({
          value: String(u.id ?? u.ID ?? ''),
          label: u.userName ?? u.user_name ?? u.USER_NAME ?? String(u.id),
        }))
        setUserOptions(opts)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!setupId) return
    let active = true

    userSetupApi
      .get(setupId)
      .then((data) => {
        if (!active) return
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

  useEffect(() => {
    const buId = values.BU_ID || sessionBusinessUnitId || undefined
    let active = true
    const typeCode = afmLookupData.voucherType
    if (!typeCode) return undefined

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
      .catch(() => {})

    return () => {
      active = false
    }
  }, [values.BU_ID, sessionBusinessUnitId])

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
      .catch(() => {})

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
      .catch(() => {})

    return () => {
      active = false
    }
  }, [values.BU_ID, values.BG_ID, sessionBusinessUnitId, sessionGroupId])

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
      .catch(() => {})

    return () => {
      active = false
    }
  }, [values.BG_ID, sessionGroupId])

  if (loading) {
    return (
      <FormPage
        title={'View User Setup'}
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
      title={'View User Setup'}
      listTo={listPath}
      hideActions
    >
      <UserSetupForm
        values={values}
        errors={{}}
        userOptions={userOptions}
        voucherTypeOptions={voucherTypeOptions}
        locationOptions={locationOptions}
        bankAccountOptions={bankAccountOptions}
        costCenterOptions={costCenterOptions}
        isEdit={true}
        readOnly={true}
        auditLog={auditLog}
        onCancel={() => navigate(listPath)}
        onEdit={() => navigate(`${listPath}/${setupId}/edit`)}
      />
    </FormPage>
  )
}

export default UserSetupView

