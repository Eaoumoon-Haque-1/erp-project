/**
 * @file Account Voucher Create page.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { failActiveAction, showError } from '../../../../components/shared/actionAlerts'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmChartOfAccountsApi } from '../../afm-chart-of-accounts/api/afmChartOfAccountsApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { bankChequeMapApi } from '../../bank-cheque-mapping/api/bankChequeMapApi'
import { bankApi } from '../../bank/api/bankApi'
import { calendarApi } from '../../calendar/api/calendarApi'
import { paymentTypeMappingApi } from '../../payment-type-mapping/api/paymentTypeMappingApi'
import { periodApi } from '../../period/api/periodApi'
import { voucherTypeMappingApi } from '../../voucher-type-mapping/api/voucherTypeMappingApi'
import { voucherApi } from '../api/voucherApi'
import VoucherForm from '../components/VoucherForm'
import { mapVoucherToApi } from '../data/voucherApiMapper'
import {
  createInitialAttachmentRow,
  createInitialDetailRow,
  initialVoucherValues,
  validateVoucher,
} from '../validation/voucherValidation'

const listPath = '/accounts/voucher'

function VoucherCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = String(session?.groupName ?? session?.businessGroupName ?? '').trim()
  const sessionBuName = String(session?.buName ?? session?.businessUnitName ?? '').trim()

  const [values, setValues] = useState(() => ({
    ...initialVoucherValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
    GROUP_NAME: sessionGroupName,
    BUSINESS_UNIT: sessionBuName,
    VOUCHER_DATE: new Date().toISOString().slice(0, 10),
    CHEQUE_DATE: new Date().toISOString().slice(0, 10),
    VOUCHER_NO: `V-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
  }))

  const [details, setDetails] = useState(() => [
    createInitialDetailRow(),
    createInitialDetailRow(),
  ])
  const [attachments, setAttachments] = useState(() => [createInitialAttachmentRow()])
  const [errors, setErrors] = useState({})
  const [detailErrors, setDetailErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Dropdown options
  const [voucherTypeOptions, setVoucherTypeOptions] = useState([])
  const [paymentTypeOptions, setPaymentTypeOptions] = useState([])
  const [throughOptions, setThroughOptions] = useState([])
  const [periodOptions, setPeriodOptions] = useState([])
  const [coaOptions, setCoaOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])
  const [bankAccountOptions, setBankAccountOptions] = useState([])
  const [allCheques, setAllCheques] = useState([])

  // 1. Initial lookups (Voucher types, Periods, Chart of Accounts, Cost centers, Banks, Cheques)
  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    // Voucher Types
    afmLookupApi
      .getValuesByTypeCode('VT001', sessionBuId, 1)
      .then((rows) => {
        if (!active) return
        setVoucherTypeOptions(
          (rows || []).map((r) => ({
            value: String(r.id),
            label: r.value || r.valueCode,
          })),
        )
      })
      .catch(() => {
        if (active) setVoucherTypeOptions([])
      })

    // Open Periods: fetch from both periodApi and calendarApi
    Promise.allSettled([
      periodApi.getOpenPeriods(sessionBuId),
      calendarApi.list({ buId: sessionBuId }),
      periodApi.list({ buId: sessionBuId }),
    ])
      .then(([openRes, calsRes, periodsRes]) => {
        if (!active) return

        const namesFromOpenApi =
          openRes.status === 'fulfilled' && Array.isArray(openRes.value) ? openRes.value : []

        const cals =
          calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []
        const namesFromCalendar = cals
          .flatMap((c) =>
            (c.calendarMonths || [])
              .filter((m) => String(m.periodStatus || '').trim().toLowerCase() === 'open')
              .map((m) => String(m.periodName || '').trim()),
          )
          .filter(Boolean)

        const periods =
          periodsRes.status === 'fulfilled' && Array.isArray(periodsRes.value) ? periodsRes.value : []
        const namesFromPeriods = periods
          .filter((p) => String(p.periodStatus || '').trim().toLowerCase() === 'open')
          .map((p) => String(p.periodName || '').trim())
          .filter(Boolean)

        const distinctNames = Array.from(
          new Set([...namesFromOpenApi, ...namesFromCalendar, ...namesFromPeriods]),
        )
          .filter(Boolean)
          .sort()

        setPeriodOptions(distinctNames.map((name) => ({ value: name, label: name })))
      })
      .catch(() => {
        if (active) setPeriodOptions([])
      })

    // Chart of Accounts where Ledger Head = Active Account, Is Active = yes
    afmChartOfAccountsApi
      .list({ buId: sessionBuId, status: 1 })
      .then((rows) => {
        if (!active) return
        const filtered = (rows || []).filter((r) => {
          const ledgerHead = String(r.ledgerHead || r.LEDGER_HEAD || '').trim().toLowerCase()
          const isActive = String(r.status ?? r.STATUS ?? '').trim()
          return (
            ledgerHead === 'active account' &&
            (isActive === '1' || isActive === 'true' || isActive === '')
          )
        })
        setCoaOptions(
          filtered.map((r) => ({
            value: String(r.id),
            label: `${r.accountCode} - ${r.accountHeadName}`,
            code: r.accountCode,
            name: r.accountHeadName,
            source: r.accountsSource,
          })),
        )
      })
      .catch(() => {
        if (active) setCoaOptions([])
      })

    // Cost Centers
    voucherApi
      .getCostCenters(sessionBuId)
      .then((rows) => {
        if (!active) return
        setCostCenterOptions(
          (rows || []).map((r) => ({
            value: String(r.id),
            label: r.costCenter,
          })),
        )
      })
      .catch(() => {
        if (active) setCostCenterOptions([])
      })

    // Bank Accounts: only active
    bankApi
      .list({ buId: sessionBuId })
      .then((banks) => {
        if (!active) return
        const accts = []
        ;(banks || []).forEach((b) => {
          const isBankActive = b.status === 1 || b.status === '1' || b.status === undefined || b.status === null
          if (isBankActive && Array.isArray(b.bankDetails)) {
            b.bankDetails.forEach((d) => {
              const isDetailActive = d.status === 1 || d.status === '1' || d.status === undefined || d.status === null
              const accNum = String(d.accountNumber ?? d.accountNo ?? '').trim()
              if (isDetailActive && accNum) {
                const labelParts = [
                  b.bankName || b.shortName,
                  d.accountName,
                  d.branchName,
                ].filter(Boolean).join(' - ')
                accts.push({
                  value: accNum,
                  label: labelParts ? `${accNum} (${labelParts})` : accNum,
                  bankId: String(b.id),
                  bankAccountId: String(d.id),
                  accountNumber: accNum,
                  accountName: d.accountName || '',
                  bankName: b.bankName || '',
                })
              }
            })
          }
        })
        setBankAccountOptions(accts)
      })
      .catch(() => {
        if (active) setBankAccountOptions([])
      })

    // Cheques from Bank Cheque Mapping
    bankChequeMapApi
      .list({ buId: sessionBuId })
      .then((rows) => {
        if (!active) return
        setAllCheques(rows || [])
      })
      .catch(() => {
        if (active) setAllCheques([])
      })

    return () => {
      active = false
    }
  }, [sessionBuId])

  // 2. Payment Types: depend on selected Voucher Type
  useEffect(() => {
    if (!sessionBuId || !values.VOUCHER_TYPE_ID) {
      return undefined
    }
    let active = true

    voucherTypeMappingApi
      .getByVoucherType(sessionBuId, values.VOUCHER_TYPE_ID, 1)
      .then((rows) => {
        if (!active) return
        setPaymentTypeOptions(
          (rows || []).map((r) => ({
            value: String(r.paymentTypeId),
            label: r.paymentTypeValue || r.paymentTypeValueCode,
          })),
        )
      })
      .catch(() => {
        if (active) setPaymentTypeOptions([])
      })

    return () => {
      active = false
    }
  }, [sessionBuId, values.VOUCHER_TYPE_ID])

  // 3. Payment Throughs: depend on selected Payment Type
  useEffect(() => {
    if (!sessionBuId || !values.PAYMENT_TYPE_ID) {
      return undefined
    }
    let active = true

    paymentTypeMappingApi
      .getByPaymentType(sessionBuId, values.PAYMENT_TYPE_ID, 1)
      .then((rows) => {
        if (!active) return
        setThroughOptions(
          (rows || []).map((r) => ({
            value: String(r.paymentThroughId),
            label: r.paymentThroughValue || r.paymentThroughValueCode,
          })),
        )
      })
      .catch(() => {
        if (active) setThroughOptions([])
      })

    return () => {
      active = false
    }
  }, [sessionBuId, values.PAYMENT_TYPE_ID])

  // 4. Cheque numbers: derived from selected Bank Account
  const chequeOptions = useMemo(() => {
    if (!values.BANK_ACCOUNT) return []
    const selected = String(values.BANK_ACCOUNT).trim().toLowerCase()

    const matchedAccount = bankAccountOptions.find((a) => {
      const aVal = String(a.value || '').trim().toLowerCase()
      const aId = String(a.bankAccountId || '').trim().toLowerCase()
      return aVal === selected || aId === selected
    })

    const matching = allCheques.filter((c) => {
      const isActive = c.status === 1 || c.status === '1' || c.status === undefined || c.status === null
      if (!isActive) return false

      const cAcc = String(c.accountNumber || c.accountNo || '').trim().toLowerCase()
      const cAccId = String(c.bankAccountId || '').trim().toLowerCase()

      if (cAcc && cAcc === selected) return true
      if (cAccId && cAccId === selected) return true
      if (matchedAccount && cAccId && cAccId === String(matchedAccount.bankAccountId).toLowerCase()) return true
      if (matchedAccount && cAcc && cAcc === String(matchedAccount.accountNumber).toLowerCase()) return true

      return false
    })

    return matching.map((c) => ({
      value: c.chequeNo,
      label: `${c.chequeNo}${c.chequeStatus ? ' (' + c.chequeStatus + ')' : ''}`,
    }))
  }, [allCheques, bankAccountOptions, values.BANK_ACCOUNT])

  // Form field change handler
  const handleChange = (field, value) => {
    if (field === 'VOUCHER_TYPE_ID' && !value) {
      setPaymentTypeOptions([])
      setThroughOptions([])
    }
    if (field === 'PAYMENT_TYPE_ID' && !value) {
      setThroughOptions([])
    }

    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Detail row change handler
  const handleDetailChange = (index, field, value) => {
    setDetails((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }

      // Auto update total voucher amount when DR amounts change
      if (field === 'drAmount' || field === 'crAmount') {
        const sumDr = copy.reduce((s, row) => s + (parseFloat(row.drAmount) || 0), 0)
        setValues((v) => ({ ...v, VOUCHER_AMOUNT: sumDr.toFixed(2) }))
      }

      return copy
    })

    if (detailErrors[index]?.[field]) {
      setDetailErrors((prev) => {
        const copy = [...prev]
        if (copy[index]) {
          const rowCopy = { ...copy[index] }
          delete rowCopy[field]
          copy[index] = rowCopy
        }
        return copy
      })
    }
  }

  const handleAddDetail = () => {
    setDetails((prev) => [...prev, createInitialDetailRow()])
  }

  const handleRemoveDetail = (index) => {
    if (details.length <= 1) {
      showError('Cannot delete all detail rows. At least one row is required.')
      return
    }
    setDetails((prev) => prev.filter((_, i) => i !== index))
    setDetailErrors((prev) => prev.filter((_, i) => i !== index))
  }

  // Attachment handlers
  const handleAttachmentChange = (index, patch) => {
    setAttachments((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...patch }
      return copy
    })
  }

  const handleAddAttachment = () => {
    setAttachments((prev) => [...prev, createInitialAttachmentRow()])
  }

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Form validation prior to confirm dialog
  const handleValidate = () => {
    const submitValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBuId || values.BU_ID,
      GROUP_NAME: sessionGroupName || values.GROUP_NAME,
      BUSINESS_UNIT: sessionBuName || values.BUSINESS_UNIT,
    }

    const validation = validateVoucher(submitValues, details, attachments)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setDetailErrors(validation.detailErrors)
      showError('Please correct the highlighted form errors.')
      return false
    }

    if (!validation.isBalanced) {
      showError(
        `Voucher is not balanced! Total Debit (${validation.totalDr}) must equal Total Credit (${validation.totalCr}).`,
      )
      return false
    }

    return true
  }

  // Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    if (!handleValidate()) return

    let submitBgId = sessionGroupId || values.BG_ID
    const submitBuId = sessionBuId || values.BU_ID

    if (!submitBgId && submitBuId) {
      try {
        const bu = await businessUnitsApi.get(submitBuId)
        if (bu?.bgId) {
          submitBgId = String(bu.bgId)
        }
      } catch {
        // proceed
      }
    }

    const submitValues = {
      ...values,
      BG_ID: submitBgId,
      BU_ID: submitBuId,
      GROUP_NAME: sessionGroupName || values.GROUP_NAME,
      BUSINESS_UNIT: sessionBuName || values.BUSINESS_UNIT,
    }

    setSubmitting(true)
    try {
      const payload = mapVoucherToApi(submitValues, details, attachments)
      await voucherApi.create(payload)
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create voucher.')
      failActiveAction(msg)
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'New Account Voucher'}
      listTo={listPath}
      submitLabel={'Submit'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <VoucherForm
        values={values}
        errors={errors}
        detailErrors={detailErrors}
        details={details}
        attachments={attachments}
        submitting={submitting}
        submitLabel={'Submit'}
        voucherTypeOptions={voucherTypeOptions}
        paymentTypeOptions={paymentTypeOptions}
        throughOptions={throughOptions}
        periodOptions={periodOptions}
        bankAccountOptions={bankAccountOptions}
        chequeOptions={chequeOptions}
        coaOptions={coaOptions}
        costCenterOptions={costCenterOptions}
        onChange={handleChange}
        onDetailChange={handleDetailChange}
        onAddDetail={handleAddDetail}
        onRemoveDetail={handleRemoveDetail}
        onAttachmentChange={handleAttachmentChange}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default VoucherCreate
