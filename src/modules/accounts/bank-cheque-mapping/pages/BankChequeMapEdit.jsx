/**
 * @file Bank Cheque Mapping Edit page.
 * Allows updating cheque status (Not Use / Void / Used) and active status.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { bankApi } from '../../bank/api/bankApi'
import { bankChequeMapApi } from '../api/bankChequeMapApi'
import BankChequeMapForm from '../components/BankChequeMapForm'
import { mapChequeMapToForm, mapFormToUpdateApi } from '../data/bankChequeMapApiMapper'
import {
  AFM_BANK_CHEQUE_MAP_TABLE,
  initialBankChequeMapValues,
  validateBankChequeMap,
} from '../validation/bankChequeMapValidation'

const listPath = '/accounts/voucher-setup/bank-cheque-mapping'

function BankChequeMapEdit() {
  const { mappingId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(initialBankChequeMapValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [auditLog, setAuditLog] = useState(null)

  const [bankOptions, setBankOptions] = useState([])
  const [accountOptions, setAccountOptions] = useState([])
  const [banksLoading, setBanksLoading] = useState(true)
  const [accountsLoading, setAccountsLoading] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      bankChequeMapApi.get(mappingId),
      bankApi
        .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined, status: 1 })
        .catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([data, bankList, users, employees]) => {
        if (!active) return
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )
        const mapped = mapChequeMapToForm(data, userMap, empMap)
        setValues({
          ...mapped,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBusinessUnitId || mapped.BU_ID,
        })
        setAuditLog(mapped)

        const scopedBanks = (bankList || []).filter((b) => {
          if (sessionBusinessUnitId && b.buId && String(b.buId) !== sessionBusinessUnitId) {
            return false
          }
          const itemBgId = String(b.bgId ?? '')
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) {
            return false
          }
          return true
        })

        const bankOptsMap = new Map()
        scopedBanks.forEach((b) => {
          bankOptsMap.set(String(b.id), {
            value: String(b.id),
            label: b.bankName,
            shortName: b.shortName,
          })
        })
        if (mapped.BANK_ID && !bankOptsMap.has(String(mapped.BANK_ID))) {
          bankOptsMap.set(String(mapped.BANK_ID), {
            value: String(mapped.BANK_ID),
            label: mapped.BANK_NAME || `Bank #${mapped.BANK_ID}`,
          })
        }
        setBankOptions(Array.from(bankOptsMap.values()))
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load Bank Cheque Mapping')
      })
      .finally(() => {
        if (active) {
          setLoading(false)
          setBanksLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [mappingId, sessionBusinessUnitId, sessionGroupId])

  // Load bank accounts when bank selection changes
  useEffect(() => {
    if (!values.BANK_ID) return undefined
    let active = true

    bankApi
      .getDetails(values.BANK_ID)
      .then((details) => {
        if (!active) return
        const optsMap = new Map()
        ;(details || []).forEach((acc) => {
          optsMap.set(String(acc.id), {
            value: String(acc.id),
            label: `${acc.accountNumber}${acc.accountName ? ` - ${acc.accountName}` : ''}${
              acc.branchName ? ` (${acc.branchName})` : ''
            }`,
            accountNumber: acc.accountNumber,
            branchName: acc.branchName,
          })
        })
        // Preserve current mapping's account option if not in active details
        if (values.BANK_ACCOUNT_ID && !optsMap.has(String(values.BANK_ACCOUNT_ID))) {
          optsMap.set(String(values.BANK_ACCOUNT_ID), {
            value: String(values.BANK_ACCOUNT_ID),
            label: `${values.ACCOUNT_NUMBER || values.BANK_ACCOUNT_ID}${
              values.ACCOUNT_NAME ? ` - ${values.ACCOUNT_NAME}` : ''
            }`,
          })
        }
        setAccountOptions(Array.from(optsMap.values()))
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load bank accounts')
      })
      .finally(() => {
        if (active) setAccountsLoading(false)
      })

    return () => {
      active = false
    }
  }, [values.ACCOUNT_NAME, values.ACCOUNT_NUMBER, values.BANK_ACCOUNT_ID, values.BANK_ID])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((prev) => {
      const updated = { ...prev, [name]: nextVal }
      if (name === 'BANK_ID' && prev.BANK_ID !== nextVal) {
        updated.BANK_ACCOUNT_ID = ''
      }
      return updated
    })
    if (name === 'BANK_ID') {
      if (!nextVal) {
        setAccountOptions([])
      } else {
        setAccountsLoading(true)
      }
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      STATUS: '1',
    }

    const validation = validateBankChequeMap(payloadValues, { isEdit: true })
    if (!validation.isValid) {
      setErrors(validation.errors)
      if (validation.errors.BG_ID || validation.errors.BU_ID) {
        showError(validation.errors.BU_ID || validation.errors.BG_ID)
      }
      return
    }

    setSubmitting(true)
    try {
      await bankChequeMapApi.update(mappingId, mapFormToUpdateApi(payloadValues))
      await showSuccess('Bank Cheque Mapping updated successfully.')
      navigate(listPath)
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message || err?.message || 'Unable to update Bank Cheque Mapping.'
      await showError(serverMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={'p-6 text-xs text-gray-500'}>Loading Bank Cheque Mapping...</div>
  }

  return (
    <FormPage
      title={'Bank Cheque Mapping'}
      listTo={listPath}
      tableName={AFM_BANK_CHEQUE_MAP_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      submitting={submitting}
    >
      <BankChequeMapForm
        values={values}
        errors={errors}
        bankOptions={bankOptions}
        accountOptions={values.BANK_ID ? accountOptions : []}
        banksLoading={banksLoading}
        accountsLoading={values.BANK_ID ? accountsLoading : false}
        isEdit={true}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default BankChequeMapEdit
