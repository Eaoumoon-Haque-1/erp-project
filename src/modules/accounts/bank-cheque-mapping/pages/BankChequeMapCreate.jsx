/**
 * @file Bank Cheque Mapping Create page.
 * Implements range-batch insertion with confirmation dialog:
 * e.g., If From Cheque 1000 and To Cheque 1005 -> "Five records will be inserted. Do you want to proceed?"
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { bankApi } from '../../bank/api/bankApi'
import { bankChequeMapApi } from '../api/bankChequeMapApi'
import BankChequeMapForm from '../components/BankChequeMapForm'
import { mapFormToApi } from '../data/bankChequeMapApiMapper'
import {
  AFM_BANK_CHEQUE_MAP_TABLE,
  initialBankChequeMapValues,
  numberToWords,
  validateBankChequeMap,
} from '../validation/bankChequeMapValidation'

const listPath = '/accounts/voucher-setup/bank-cheque-mapping'

function BankChequeMapCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const bankRef = useRef(null)
  const [values, setValues] = useState({
    ...initialBankChequeMapValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Banks and accounts state
  const [bankOptions, setBankOptions] = useState([])
  const [accountOptions, setAccountOptions] = useState([])
  const [banksLoading, setBanksLoading] = useState(Boolean(sessionBusinessUnitId))
  const [accountsLoading, setAccountsLoading] = useState(false)

  // Load banks for the current group and business unit
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    bankApi
      .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined, status: 1 })
      .then((banks) => {
        if (!active) return
        const scopedBanks = (banks || []).filter((b) => {
          if (sessionBusinessUnitId && b.buId && String(b.buId) !== sessionBusinessUnitId) {
            return false
          }
          const itemBgId = String(b.bgId ?? '')
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) {
            return false
          }
          return true
        })
        const opts = scopedBanks.map((b) => ({
          value: String(b.id),
          label: b.bankName,
          shortName: b.shortName,
        }))
        setBankOptions(opts)
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load banks')
      })
      .finally(() => {
        if (active) setBanksLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  // Load bank accounts when bank selection changes
  useEffect(() => {
    if (!values.BANK_ID) return undefined
    let active = true

    bankApi
      .getDetails(values.BANK_ID)
      .then((details) => {
        if (!active) return
        const opts = (details || []).map((acc) => ({
          value: String(acc.id),
          label: `${acc.accountNumber}${acc.accountName ? ` - ${acc.accountName}` : ''}${
            acc.branchName ? ` (${acc.branchName})` : ''
          }`,
          accountNumber: acc.accountNumber,
          branchName: acc.branchName,
        }))
        setAccountOptions(opts)
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
  }, [values.BANK_ID])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((prev) => {
      const updated = { ...prev, [name]: nextVal }
      // If bank changed, clear bank account
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

  const handleReset = () => {
    setValues({
      ...initialBankChequeMapValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setAccountOptions([])
    setErrors({})
    requestAnimationFrame(() => bankRef.current?.focus())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      STATUS: '1',
    }

    const validation = validateBankChequeMap(payloadValues, { isEdit: false })
    if (!validation.isValid) {
      setErrors(validation.errors)
      if (validation.errors.BG_ID || validation.errors.BU_ID) {
        showError(validation.errors.BU_ID || validation.errors.BG_ID)
      }
      return
    }

    const count = validation.count
    const countWord = numberToWords(count)
    const alertMessage = `${countWord} records will be inserted. Do you want to proceed?`

    const proceed = await confirmAction({
      title: alertMessage,
      action: 'create',
      entityName: 'Bank Cheque Mapping',
    })

    if (!proceed) return

    setSubmitting(true)
    try {
      await bankChequeMapApi.createBatch(mapFormToApi(payloadValues))
      await showSuccess(`${countWord} cheque records inserted successfully.`)
      navigate(listPath)
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message || err?.message || 'Unable to create Bank Cheque Mapping.'
      await showError(serverMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'Bank Cheque Mapping'}
      listTo={listPath}
      tableName={AFM_BANK_CHEQUE_MAP_TABLE}
      submitLabel={'Submit'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <BankChequeMapForm
        values={values}
        errors={errors}
        bankOptions={bankOptions}
        accountOptions={values.BANK_ID ? accountOptions : []}
        banksLoading={banksLoading}
        accountsLoading={values.BANK_ID ? accountsLoading : false}
        isEdit={false}
        submitLabel={'Submit'}
        submitting={submitting}
        bankRef={bankRef}
        onChange={handleChange}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default BankChequeMapCreate
