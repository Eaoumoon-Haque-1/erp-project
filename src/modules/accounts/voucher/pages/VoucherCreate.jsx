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
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { afmChartOfAccountsApi } from '../../afm-chart-of-accounts/api/afmChartOfAccountsApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { bankChequeMapApi } from '../../bank-cheque-mapping/api/bankChequeMapApi'
import { bankApi } from '../../bank/api/bankApi'
import { calendarApi } from '../../calendar/api/calendarApi'
import { paymentTypeMappingApi } from '../../payment-type-mapping/api/paymentTypeMappingApi'
import { periodApi } from '../../period/api/periodApi'
import { supplierApi } from '../../supplier/api/supplierApi'
import { customerApi } from '../../customer/api/customerApi'
import { userLocationApi } from '../../user-location/api/userLocationApi'
import { userSetupApi } from '../../user-setup/api/userSetupApi'
import { mapUserSetupFromApi } from '../../user-setup/data/userSetupApiMapper'
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

function getTodayIso() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDayOffsetIso(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validateVoucherDateAllowed(dateStr, userSetup) {
  if (!dateStr) {
    return 'Voucher Date is required'
  }
  if (!userSetup || !Array.isArray(userSetup.VOUCHER_DATE) || userSetup.VOUCHER_DATE.length === 0) {
    return null
  }
  const rules = userSetup.VOUCHER_DATE
  const hasAll = rules.some((r) => String(r).trim().toLowerCase() === 'all')
  if (hasAll) return null

  const todayStr = getTodayIso()
  const hasCurrent = rules.some(
    (r) => String(r).toLowerCase().includes('current') || String(r).trim().toLowerCase() === 'all',
  )
  const hasPrev = rules.some((r) => String(r).toLowerCase().includes('previous'))
  const hasFwd = rules.some(
    (r) => String(r).toLowerCase().includes('forward') || String(r).toLowerCase().includes('future'),
  )

  if (dateStr === todayStr && !hasCurrent) {
    return 'Current date data entry is not allowed by User Setup.'
  }
  if (dateStr < todayStr && !hasPrev) {
    return 'Previous date data entry is not allowed by User Setup.'
  }
  if (dateStr > todayStr && !hasFwd) {
    return 'Forward date data entry is not allowed by User Setup.'
  }
  return null
}

function getVoucherDateLimits(userSetup) {
  if (!userSetup || !Array.isArray(userSetup.VOUCHER_DATE) || userSetup.VOUCHER_DATE.length === 0) {
    return { minDate: undefined, maxDate: undefined }
  }
  const rules = userSetup.VOUCHER_DATE
  const hasAll = rules.some((r) => String(r).trim().toLowerCase() === 'all')
  if (hasAll) {
    return { minDate: undefined, maxDate: undefined }
  }

  const todayStr = getTodayIso()
  const hasCurrent = rules.some(
    (r) => String(r).toLowerCase().includes('current') || String(r).trim().toLowerCase() === 'all',
  )
  const hasPrev = rules.some((r) => String(r).toLowerCase().includes('previous'))
  const hasFwd = rules.some(
    (r) => String(r).toLowerCase().includes('forward') || String(r).toLowerCase().includes('future'),
  )

  if (hasCurrent) {
    return {
      minDate: !hasPrev ? todayStr : undefined,
      maxDate: !hasFwd ? todayStr : undefined,
    }
  }

  // Current date not allowed
  return {
    minDate: !hasPrev ? getDayOffsetIso(1) : undefined,
    maxDate: !hasFwd ? getDayOffsetIso(-1) : undefined,
  }
}

function resolvePeriodForDate(dateStr, calendars = [], periods = []) {
  if (!dateStr) {
    return { periodName: '', error: 'Voucher Date is required' }
  }

  const allMonths = (calendars || []).flatMap((c) => c.calendarMonths || [])
  const matchedMonth = allMonths.find((m) => {
    if (!m.fromDate || !m.toDate) return false
    const f = String(m.fromDate).slice(0, 10)
    const t = String(m.toDate).slice(0, 10)
    return dateStr >= f && dateStr <= t
  })

  if (!matchedMonth) {
    return {
      periodName: '',
      error: 'No accounting period found for selected Voucher Date.',
    }
  }

  const periodOverride = (periods || []).find(
    (p) =>
      (p.afmCalendarMonthId != null &&
        matchedMonth.id != null &&
        String(p.afmCalendarMonthId) === String(matchedMonth.id)) ||
      (p.periodName &&
        matchedMonth.periodName &&
        String(p.periodName).trim().toLowerCase() === String(matchedMonth.periodName).trim().toLowerCase()),
  )

  const effectiveStatus = String(
    periodOverride?.periodStatus || matchedMonth.periodStatus || '',
  )
    .trim()
    .toLowerCase()

  if (effectiveStatus === 'open' || effectiveStatus === '1') {
    return {
      periodName: matchedMonth.periodName || '',
      error: null,
    }
  }

  return {
    periodName: '',
    error: `Accounting period "${matchedMonth.periodName}" is not open for data entry.`,
  }
}

function calculateTotal(rows) {
  const sumDr = (rows || []).reduce((s, row) => s + (parseFloat(row.drAmount) || 0), 0)
  const sumCr = (rows || []).reduce((s, row) => s + (parseFloat(row.crAmount) || 0), 0)
  const total = sumDr > 0 ? sumDr : sumCr
  return total.toFixed(2)
}

function VoucherCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionUserId = String(session?.userId ?? session?.id ?? '').trim()
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
    VOUCHER_DATE: getTodayIso(),
    CHEQUE_DATE: getTodayIso(),
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

  // Lookups and user setup
  const [userSetup, setUserSetup] = useState(null)
  const [loadedCalendars, setLoadedCalendars] = useState([])
  const [voucherTypeMappings, setVoucherTypeMappings] = useState([])
  const [loadedPeriods, setLoadedPeriods] = useState([])

  const [rawVoucherTypes, setRawVoucherTypes] = useState([])
  const [rawLocations, setRawLocations] = useState([])
  const [rawBankAccounts, setRawBankAccounts] = useState([])
  const [rawCostCenters, setRawCostCenters] = useState([])

  const [paymentTypeOptions, setPaymentTypeOptions] = useState([])
  const [throughOptions, setThroughOptions] = useState([])
  const [coaOptions, setCoaOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [supplierOptions, setSupplierOptions] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [allCheques, setAllCheques] = useState([])

  // 1. Initial lookups (User Setup, Calendars, Periods, Types, Locations, Banks, Cheques, Cost Centers, COA)
  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    // User Setup for logged-in user
    userSetupApi
      .list({ buId: sessionBuId, status: 1 })
      .then((records) => {
        if (!active) return
        const setups = (records || []).map(mapUserSetupFromApi)
        const mySetup =
          setups.find(
            (s) =>
              String(s.USER_ID) === sessionUserId &&
              (String(s.STATUS) === '1' || s.STATUS === 1),
          ) ||
          setups.find((s) => String(s.USER_ID) === sessionUserId) ||
          setups[0] ||
          null

        setUserSetup(mySetup)

        if (mySetup) {
          setValues((prev) => {
            const patch = {}
            if (!prev.VOUCHER_TYPE_ID && mySetup.VOUCHER_TYPE_DEFAULT) {
              patch.VOUCHER_TYPE_ID = String(mySetup.VOUCHER_TYPE_DEFAULT)
              if (mySetup.VOUCHER_TYPE_DEFAULT_NAME) {
                patch.VOUCHER_TYPE = mySetup.VOUCHER_TYPE_DEFAULT_NAME
              }
            }
            if (!prev.LOCATION_ID && mySetup.LOCATION_DEFAULT) {
              patch.LOCATION_ID = String(mySetup.LOCATION_DEFAULT)
              if (mySetup.LOCATION_DEFAULT_NAME) {
                patch.LOCATION = mySetup.LOCATION_DEFAULT_NAME
              }
            }
            if (!prev.BANK_ACCOUNT && mySetup.BANK_ACCOUNT_DEFAULT) {
              patch.BANK_ACCOUNT = String(mySetup.BANK_ACCOUNT_DEFAULT)
            }
            return Object.keys(patch).length > 0 ? { ...prev, ...patch } : prev
          })

          if (mySetup.COST_CENTER_DEFAULT) {
            setDetails((prev) =>
              prev.map((row) => ({
                ...row,
                costCenterId: row.costCenterId || String(mySetup.COST_CENTER_DEFAULT),
              })),
            )
          }

          // Initial voucher date validation against user setup
          const initialDateErr = validateVoucherDateAllowed(getTodayIso(), mySetup)
          if (initialDateErr) {
            setErrors((prev) => ({ ...prev, VOUCHER_DATE: initialDateErr }))
          }
        }
      })
      .catch(() => {
        if (active) setUserSetup(null)
      })

    // Voucher Types
    afmLookupApi
      .getValuesByTypeCode('VT001', sessionBuId, 1)
      .then((rows) => {
        if (!active) return
        setRawVoucherTypes(
          (rows || []).map((r) => ({
            value: String(r.id),
            label: r.value || r.valueCode,
            code: r.valueCode,
          })),
        )
      })
      .catch(() => {
        if (active) setRawVoucherTypes([])
      })

    // Calendars and Periods
    Promise.allSettled([
      calendarApi.list({ buId: sessionBuId }),
      periodApi.list({ buId: sessionBuId }),
    ]).then(([calsRes, periodsRes]) => {
      if (!active) return

      const cals =
        calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []
      const periods =
        periodsRes.status === 'fulfilled' && Array.isArray(periodsRes.value)
          ? periodsRes.value
          : []

      setLoadedCalendars(cals)
      setLoadedPeriods(periods)

      // Resolve initial Period Name for default date
      const { periodName, error: pErr } = resolvePeriodForDate(getTodayIso(), cals, periods)
      setValues((prev) => ({ ...prev, PERIOD_NAME: periodName }))
      if (pErr) {
        setErrors((prev) => ({ ...prev, PERIOD_NAME: pErr }))
      }
    })

    // User Locations (active)
    userLocationApi
      .list({ buId: sessionBuId, status: 1 })
      .then((rows) => {
        if (!active) return
        setRawLocations(
          (rows || []).map((r) => ({
            value: String(r.id),
            label: r.shortName ? `${r.location} (${r.shortName})` : r.location,
          })),
        )
      })
      .catch(() => {
        if (active) setRawLocations([])
      })

    // Cost Centers: loaded from HR_DEPT joined with HR_DEPT_GROUP matching login user's Business Unit
    Promise.allSettled([
      departmentsApi.list(sessionGroupId || undefined),
      departmentGroupsApi.list(),
    ]).then(([deptRes, groupRes]) => {
      if (!active) return
      const depts = deptRes.status === 'fulfilled' && Array.isArray(deptRes.value) ? deptRes.value : []
      const groups = groupRes.status === 'fulfilled' && Array.isArray(groupRes.value) ? groupRes.value : []

      const buGroups = groups.filter((g) => String(g.buId ?? '') === String(sessionBuId))
      const allowedDeptIds = new Set(buGroups.map((g) => String(g.deptId)))

      const matchedDepts = depts.filter((d) => {
        const inBu = buGroups.length === 0 ? true : allowedDeptIds.has(String(d.id))
        const isActive = d.status === 1 || d.status === '1' || d.status === undefined || d.status === null
        return inBu && isActive
      })

      setRawCostCenters(
        matchedDepts.map((d) => ({
          value: String(d.id),
          label: d.departmentName || d.shortName || String(d.id),
        })),
      )
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
            source: r.accountsSource || r.source || 'None',
            accountsSource: r.accountsSource || r.source || 'None',
          })),
        )
      })
      .catch(() => {
        if (active) setCoaOptions([])
      })

    // Bank Accounts: only active
    bankApi
      .list({ buId: sessionBuId })
      .then((banks) => {
        if (!active) return
        const accts = []
        ;(banks || []).forEach((b) => {
          const isBankActive =
            b.status === 1 || b.status === '1' || b.status === undefined || b.status === null
          if (isBankActive && Array.isArray(b.bankDetails)) {
            b.bankDetails.forEach((d) => {
              const isDetailActive =
                d.status === 1 || d.status === '1' || d.status === undefined || d.status === null
              const accNum = String(d.accountNumber ?? d.accountNo ?? '').trim()
              if (isDetailActive && d.id) {
                const bankName = b.bankName || b.shortName || 'Bank'
                const branchStr = d.branchName ? ` (${d.branchName.trim()})` : ''
                const label = `${bankName} : ${accNum || d.accountName || 'Account'}${branchStr}`
                accts.push({
                  value: String(d.id),
                  label,
                  id: String(d.id),
                  bankAccountId: String(d.id),
                  bankId: String(b.id),
                  accountNumber: accNum,
                  accountName: d.accountName || '',
                  bankName,
                  branchName: d.branchName || '',
                })
              }
            })
          }
        })
        setRawBankAccounts(accts)
      })
      .catch(() => {
        if (active) setRawBankAccounts([])
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

    // Active Employees matching login user's BG_ID and BU_ID
    employeesApi
      .list({ buId: sessionBuId, bgId: sessionGroupId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((e) => {
          const matchBu = !sessionBuId || String(e.buId ?? '') === sessionBuId
          const matchBg = !sessionGroupId || String(e.bgId ?? '') === sessionGroupId
          const isActive = String(e.status ?? '1') === '1' || e.status === 1 || e.status == null
          return matchBu && matchBg && isActive
        })
        const opts = filtered.map((e) => {
          const code = String(e.employeeCode ?? e.employee_code ?? '').trim()
          const name = String(e.employeeName ?? e.employee_name ?? '').trim()
          const label = code && name ? `${code}: ${name}` : code || name || String(e.id)
          return {
            value: String(e.id),
            label,
            code,
            name,
          }
        })
        setEmployeeOptions(opts)
      })
      .catch(() => {
        if (active) setEmployeeOptions([])
      })

    // Active Suppliers matching login user's BG_ID and BU_ID
    supplierApi
      .list({ buId: sessionBuId, bgId: sessionGroupId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((s) => {
          const matchBu = !sessionBuId || String(s.buId ?? '') === sessionBuId
          const matchBg = !sessionGroupId || String(s.bgId ?? '') === sessionGroupId
          const isActive = String(s.status ?? '1') === '1' || s.status === 1 || s.status == null
          return matchBu && matchBg && isActive
        })
        const opts = filtered.map((s) => {
          const code = String(s.supplierCode ?? s.supplier_code ?? '').trim()
          const name = String(s.supplierName ?? s.supplier_name ?? '').trim()
          const label = code && name ? `${code}: ${name}` : code || name || String(s.id)
          return {
            value: String(s.id),
            label,
            code,
            name,
          }
        })
        setSupplierOptions(opts)
      })
      .catch(() => {
        if (active) setSupplierOptions([])
      })

    // Active Customers matching login user's BG_ID and BU_ID
    customerApi
      .list({ buId: sessionBuId, bgId: sessionGroupId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((c) => {
          const cBu = String(c.buId ?? c.bu_id ?? c.BU_ID ?? '').trim()
          const cBg = String(c.bgId ?? c.bg_id ?? c.BG_ID ?? '').trim()
          const matchBu = !sessionBuId || cBu === sessionBuId
          const matchBg = !sessionGroupId || cBg === sessionGroupId
          const cStatus = String(c.status ?? c.STATUS ?? '1').trim()
          const isActive = cStatus === '1' || c.status === 1 || c.status == null
          return matchBu && matchBg && isActive
        })
        const opts = filtered.map((c) => {
          const id = String(c.id ?? c.ID ?? '')
          const code = String(c.customerCode ?? c.customer_code ?? c.CUSTOMER_CODE ?? '').trim()
          const name = String(c.customerName ?? c.customer_name ?? c.CUSTOMER_NAME ?? '').trim()
          const label = code && name ? `${code}: ${name}` : code || name || id
          return {
            value: id,
            label,
            code,
            name,
          }
        })
        setCustomerOptions(opts)
      })
      .catch(() => {
        if (active) setCustomerOptions([])
      })

    return () => {
      active = false
    }
  }, [sessionBuId, sessionGroupId, sessionUserId])

  // Filter options and date limits as per User Setup
  const voucherDateLimits = useMemo(() => getVoucherDateLimits(userSetup), [userSetup])

  const voucherTypeOptions = useMemo(() => {
    if (!userSetup?.VOUCHER_TYPE || userSetup.VOUCHER_TYPE.length === 0) {
      return rawVoucherTypes
    }
    const allowed = userSetup.VOUCHER_TYPE.map(String)
    return rawVoucherTypes.filter(
      (vt) =>
        allowed.includes(String(vt.value)) ||
        (vt.code && allowed.includes(String(vt.code))) ||
        (vt.label && allowed.includes(String(vt.label))),
    )
  }, [rawVoucherTypes, userSetup])

  const locationOptions = useMemo(() => {
    if (!userSetup?.LOCATION || userSetup.LOCATION.length === 0) {
      return rawLocations
    }
    const allowed = userSetup.LOCATION.map(String)
    return rawLocations.filter(
      (loc) =>
        allowed.includes(String(loc.value)) ||
        (loc.label && allowed.includes(String(loc.label))),
    )
  }, [rawLocations, userSetup])

  const bankAccountOptions = useMemo(() => {
    if (!userSetup?.BANK_ACCOUNT || userSetup.BANK_ACCOUNT.length === 0) {
      return rawBankAccounts
    }
    const allowed = userSetup.BANK_ACCOUNT.map(String)
    return rawBankAccounts.filter(
      (ba) =>
        allowed.includes(String(ba.value)) ||
        (ba.bankAccountId && allowed.includes(String(ba.bankAccountId))) ||
        (ba.accountNumber && allowed.includes(String(ba.accountNumber))),
    )
  }, [rawBankAccounts, userSetup])

  const costCenterOptions = useMemo(() => {
    if (!userSetup?.COST_CENTER || userSetup.COST_CENTER.length === 0) {
      return rawCostCenters
    }
    const allowed = userSetup.COST_CENTER.map(String)
    return rawCostCenters.filter(
      (cc) =>
        allowed.includes(String(cc.value)) ||
        (cc.label && allowed.includes(String(cc.label))),
    )
  }, [rawCostCenters, userSetup])

  // 2. Payment Types & Mappings: depend on selected Voucher Type
  useEffect(() => {
    if (!sessionBuId || !values.VOUCHER_TYPE_ID) {
      setVoucherTypeMappings([])
      setPaymentTypeOptions([])
      return undefined
    }
    let active = true

    voucherTypeMappingApi
      .getByVoucherType(sessionBuId, values.VOUCHER_TYPE_ID, 1)
      .then((rows) => {
        if (!active) return
        setVoucherTypeMappings(rows || [])
        setPaymentTypeOptions(
          (rows || []).map((r) => ({
            value: String(r.paymentTypeId),
            label: r.paymentTypeValue || r.paymentTypeValueCode,
          })),
        )
      })
      .catch(() => {
        if (active) {
          setVoucherTypeMappings([])
          setPaymentTypeOptions([])
        }
      })

    return () => {
      active = false
    }
  }, [sessionBuId, values.VOUCHER_TYPE_ID])

  const isBankChequeReadOnly = useMemo(() => {
    if (!values.VOUCHER_TYPE_ID) return false
    const list = voucherTypeMappings || []
    if (list.length === 0) return false

    const matched =
      (values.PAYMENT_TYPE_ID &&
        list.find((m) => String(m.paymentTypeId) === String(values.PAYMENT_TYPE_ID))) ||
      list[0]

    if (!matched) return false
    return String(matched.bankChequeMode || '').trim().toLowerCase() === 'readonly'
  }, [voucherTypeMappings, values.VOUCHER_TYPE_ID, values.PAYMENT_TYPE_ID])

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
      const aId = String(a.bankAccountId || a.id || '').trim().toLowerCase()
      const aNum = String(a.accountNumber || '').trim().toLowerCase()
      return aVal === selected || aId === selected || aNum === selected
    })

    const matching = allCheques.filter((c) => {
      const isActive =
        c.status === 1 || c.status === '1' || c.status === undefined || c.status === null
      if (!isActive) return false

      const cAcc = String(c.accountNumber || c.accountNo || '').trim().toLowerCase()
      const cAccId = String(c.bankAccountId || '').trim().toLowerCase()

      if (cAccId && cAccId === selected) return true
      if (cAcc && cAcc === selected) return true
      if (matchedAccount && cAccId && cAccId === String(matchedAccount.bankAccountId || matchedAccount.value).toLowerCase())
        return true
      if (matchedAccount && cAcc && matchedAccount.accountNumber && cAcc === String(matchedAccount.accountNumber).toLowerCase())
        return true

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

    if (field === 'VOUCHER_DATE') {
      const dateErr = validateVoucherDateAllowed(value, userSetup)
      const { periodName, error: pErr } = resolvePeriodForDate(
        value,
        loadedCalendars,
        loadedPeriods,
      )

      setValues((prev) => ({
        ...prev,
        VOUCHER_DATE: value,
        PERIOD_NAME: periodName,
      }))

      setErrors((prev) => {
        const next = { ...prev }
        if (dateErr) {
          next.VOUCHER_DATE = dateErr
        } else {
          delete next.VOUCHER_DATE
        }

        if (pErr) {
          next.PERIOD_NAME = pErr
        } else {
          delete next.PERIOD_NAME
        }

        return next
      })
      return
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
      const updatedRow = { ...copy[index], [field]: value }

      if (field === 'coaId') {
        const opt = coaOptions.find((c) => String(c.value) === String(value))
        if (opt) {
          updatedRow.accountHeadName = opt.name || opt.label || ''
          updatedRow.accountCode = opt.code || ''
          const src = opt.source || opt.accountsSource || 'None'
          updatedRow.coaSourceType = src
          updatedRow.accountsSource = src
        }
      }

      copy[index] = updatedRow

      // Auto update total voucher amount & cheque amount when DR/CR amounts change
      if (field === 'drAmount' || field === 'crAmount') {
        const totalAmt = calculateTotal(copy)
        setValues((v) => ({ ...v, VOUCHER_AMOUNT: totalAmt, CHEQUE_AMOUNT: totalAmt }))
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
    const newRow = createInitialDetailRow()
    if (userSetup?.COST_CENTER_DEFAULT) {
      newRow.costCenterId = String(userSetup.COST_CENTER_DEFAULT)
    }
    setDetails((prev) => [...prev, newRow])
  }

  const handleRemoveDetail = (index) => {
    if (details.length <= 1) {
      showError('Cannot delete all detail rows. At least one row is required.')
      return
    }
    const nextDetails = details.filter((_, i) => i !== index)
    setDetails(nextDetails)
    setDetailErrors((prev) => prev.filter((_, i) => i !== index))
    const totalAmt = calculateTotal(nextDetails)
    setValues((v) => ({ ...v, VOUCHER_AMOUNT: totalAmt, CHEQUE_AMOUNT: totalAmt }))
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
    const totalAmt = calculateTotal(details)
    const submitValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBuId || values.BU_ID,
      GROUP_NAME: sessionGroupName || values.GROUP_NAME,
      BUSINESS_UNIT: sessionBuName || values.BUSINESS_UNIT,
      VOUCHER_AMOUNT: totalAmt,
      CHEQUE_AMOUNT: totalAmt,
    }

    const validation = validateVoucher(submitValues, details, attachments)
    const dateErr = validateVoucherDateAllowed(values.VOUCHER_DATE, userSetup)
    const { error: pErr } = resolvePeriodForDate(
      values.VOUCHER_DATE,
      loadedCalendars,
      loadedPeriods,
    )

    const combinedErrors = {
      ...validation.errors,
      ...(dateErr ? { VOUCHER_DATE: dateErr } : {}),
      ...(pErr ? { PERIOD_NAME: pErr } : {}),
    }

    if (Object.keys(combinedErrors).length > 0 || !validation.isValid) {
      setErrors(combinedErrors)
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

    const totalAmt = calculateTotal(details)
    const submitValues = {
      ...values,
      BG_ID: submitBgId,
      BU_ID: submitBuId,
      GROUP_NAME: sessionGroupName || values.GROUP_NAME,
      BUSINESS_UNIT: sessionBuName || values.BUSINESS_UNIT,
      VOUCHER_AMOUNT: totalAmt,
      CHEQUE_AMOUNT: totalAmt,
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
        isBankChequeReadOnly={isBankChequeReadOnly}
        voucherDateMin={voucherDateLimits.minDate}
        voucherDateMax={voucherDateLimits.maxDate}
        voucherTypeOptions={voucherTypeOptions}
        paymentTypeOptions={paymentTypeOptions}
        throughOptions={throughOptions}
        bankAccountOptions={bankAccountOptions}
        chequeOptions={chequeOptions}
        coaOptions={coaOptions}
        costCenterOptions={costCenterOptions}
        locationOptions={locationOptions}
        employeeOptions={employeeOptions}
        supplierOptions={supplierOptions}
        customerOptions={customerOptions}
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
