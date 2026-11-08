/**
 * @file Account Voucher Edit page.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { usersApi } from '../../../super-admin/user/api/userApi'
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
import { mapVoucherFromApi, mapVoucherToApi } from '../data/voucherApiMapper'
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
  const hasPrev = rules.some((r) => String(r).toLowerCase().includes('previous'))
  const hasFwd = rules.some(
    (r) => String(r).toLowerCase().includes('forward') || String(r).toLowerCase().includes('future'),
  )

  if (dateStr < todayStr && !hasPrev) {
    return 'Previous date data entry is not allowed by User Setup.'
  }
  if (dateStr > todayStr && !hasFwd) {
    return 'Forward date data entry is not allowed by User Setup.'
  }
  return null
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

function VoucherEdit() {
  const { voucherId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionUserId = String(session?.userId ?? session?.id ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(initialVoucherValues)
  const [details, setDetails] = useState([])
  const [attachments, setAttachments] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [detailErrors, setDetailErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Lookups and user setup
  const [userSetup, setUserSetup] = useState(null)
  const [loadedCalendars, setLoadedCalendars] = useState([])
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
  const [voucherTypeMappings, setVoucherTypeMappings] = useState([])

  const activeBuId = values.BU_ID || sessionBuId

  // Load existing voucher with users and employees for rich Audit Log display
  useEffect(() => {
    let active = true

    Promise.all([
      voucherApi.get(voucherId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
      supplierApi.list().catch(() => []),
      customerApi.list().catch(() => []),
    ])
      .then(([record, users, employees, suppliers, customers]) => {
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

        const empOptions = (employees || []).map((e) => {
          const id = String(e.id ?? e.ID ?? '')
          const code = String(
            e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
          ).trim()
          const name = String(
            e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
          ).trim()
          const label = code && name ? `${code}: ${name}` : code || name || id
          return { value: id, label, code, name }
        })
        setEmployeeOptions(empOptions)

        const supOptions = (suppliers || []).map((s) => {
          const id = String(s.id ?? s.ID ?? '')
          const code = String(
            s.supplierCode ?? s.supplier_code ?? s.SUPPLIER_CODE ?? '',
          ).trim()
          const name = String(
            s.supplierName ?? s.supplier_name ?? s.SUPPLIER_NAME ?? '',
          ).trim()
          const label = code && name ? `${code}: ${name}` : code || name || id
          return { value: id, label, code, name }
        })
        setSupplierOptions(supOptions)

        const cusOptions = (customers || []).map((c) => {
          const id = String(c.id ?? c.ID ?? '')
          const code = String(
            c.customerCode ?? c.customer_code ?? c.CUSTOMER_CODE ?? '',
          ).trim()
          const name = String(
            c.customerName ?? c.customer_name ?? c.CUSTOMER_NAME ?? '',
          ).trim()
          const label = code && name ? `${code}: ${name}` : code || name || id
          return { value: id, label, code, name }
        })
        setCustomerOptions(cusOptions)

        setOriginalRecord(record)
        const mapped = mapVoucherFromApi(record, userMap, empMap)
        setValues(mapped)
        setDetails(mapped.details.length > 0 ? mapped.details : [createInitialDetailRow()])
        setAttachments(mapped.attachments)
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load voucher.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [voucherId])

  // Load lookups when activeBuId is available
  useEffect(() => {
    if (!activeBuId) return undefined
    let active = true

    // User Setup for logged-in user
    userSetupApi
      .list({ buId: activeBuId, status: 1 })
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
          const dateErr = validateVoucherDateAllowed(values.VOUCHER_DATE, mySetup)
          if (dateErr) {
            setErrors((prev) => ({ ...prev, VOUCHER_DATE: dateErr }))
          }
        }
      })
      .catch(() => {
        if (active) setUserSetup(null)
      })

    // Voucher Types
    afmLookupApi
      .getValuesByTypeCode('VT001', activeBuId, 1)
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
      calendarApi.list({ buId: activeBuId }),
      periodApi.list({ buId: activeBuId }),
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

      // Resolve Period Name for currently loaded voucher date
      if (values.VOUCHER_DATE) {
        const { periodName, error: pErr } = resolvePeriodForDate(values.VOUCHER_DATE, cals, periods)
        if (periodName) {
          setValues((prev) => ({ ...prev, PERIOD_NAME: periodName }))
        }
        if (pErr) {
          setErrors((prev) => ({ ...prev, PERIOD_NAME: pErr }))
        }
      }
    })

    // User Locations (active)
    userLocationApi
      .list({ buId: activeBuId, status: 1 })
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

      const buGroups = groups.filter((g) => String(g.buId ?? '') === String(activeBuId))
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
      .list({ buId: activeBuId, status: 1 })
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
        const mappedCoa = filtered.map((r) => ({
          value: String(r.id),
          label: `${r.accountCode} - ${r.accountHeadName}`,
          code: r.accountCode,
          name: r.accountHeadName,
          source: r.accountsSource || r.source || 'None',
          accountsSource: r.accountsSource || r.source || 'None',
        }))
        setCoaOptions(mappedCoa)

        setDetails((prev) =>
          prev.map((row) => {
            if (!row.coaSourceType || row.coaSourceType === 'None') {
              const matched = mappedCoa.find((c) => String(c.value) === String(row.coaId))
              if (matched) {
                return {
                  ...row,
                  coaSourceType: matched.source,
                  accountsSource: matched.source,
                }
              }
            }
            return row
          }),
        )
      })
      .catch(() => {
        if (active) setCoaOptions([])
      })

    // Bank Accounts: active
    bankApi
      .list({ buId: activeBuId })
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
      .list({ buId: activeBuId })
      .then((rows) => {
        if (!active) return
        setAllCheques(rows || [])
      })
      .catch(() => {
        if (active) setAllCheques([])
      })

    // Active Employees matching BG_ID and BU_ID
    const targetBgId = values.BG_ID || sessionGroupId
    employeesApi
      .list({ buId: activeBuId, bgId: targetBgId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((e) => {
          const matchBu = !activeBuId || String(e.buId ?? '') === String(activeBuId)
          const matchBg = !targetBgId || String(e.bgId ?? '') === String(targetBgId)
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

    // Active Suppliers matching BG_ID and BU_ID
    supplierApi
      .list({ buId: activeBuId, bgId: targetBgId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((s) => {
          const matchBu = !activeBuId || String(s.buId ?? '') === String(activeBuId)
          const matchBg = !targetBgId || String(s.bgId ?? '') === String(targetBgId)
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

    // Active Customers matching BG_ID and BU_ID
    customerApi
      .list({ buId: activeBuId, bgId: targetBgId || undefined, status: 1 })
      .then((records) => {
        if (!active) return
        const list = Array.isArray(records) ? records : []
        const filtered = list.filter((c) => {
          const cBu = String(c.buId ?? c.bu_id ?? c.BU_ID ?? '').trim()
          const cBg = String(c.bgId ?? c.bg_id ?? c.BG_ID ?? '').trim()
          const matchBu = !activeBuId || cBu === String(activeBuId)
          const matchBg = !targetBgId || cBg === String(targetBgId)
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
        setCustomerOptions((prev) => {
          const map = new Map()
          opts.forEach((o) => map.set(String(o.value), o))
          ;(prev || []).forEach((p) => {
            if (!map.has(String(p.value))) {
              map.set(String(p.value), p)
            }
          })
          return Array.from(map.values())
        })
      })
      .catch(() => {
        if (active) setCustomerOptions([])
      })

    return () => {
      active = false
    }
  }, [activeBuId, sessionGroupId, sessionUserId, values.VOUCHER_DATE])

  // Filter options as per User Setup, preserving existing voucher values
  const voucherTypeOptions = useMemo(() => {
    if (!userSetup?.VOUCHER_TYPE || userSetup.VOUCHER_TYPE.length === 0) {
      return rawVoucherTypes
    }
    const allowed = userSetup.VOUCHER_TYPE.map(String)
    return rawVoucherTypes.filter(
      (vt) =>
        allowed.includes(String(vt.value)) ||
        (vt.code && allowed.includes(String(vt.code))) ||
        (vt.label && allowed.includes(String(vt.label))) ||
        String(vt.value) === String(values.VOUCHER_TYPE_ID),
    )
  }, [rawVoucherTypes, userSetup, values.VOUCHER_TYPE_ID])

  const locationOptions = useMemo(() => {
    if (!userSetup?.LOCATION || userSetup.LOCATION.length === 0) {
      return rawLocations
    }
    const allowed = userSetup.LOCATION.map(String)
    return rawLocations.filter(
      (loc) =>
        allowed.includes(String(loc.value)) ||
        (loc.label && allowed.includes(String(loc.label))) ||
        String(loc.value) === String(values.LOCATION_ID),
    )
  }, [rawLocations, userSetup, values.LOCATION_ID])

  const bankAccountOptions = useMemo(() => {
    if (!userSetup?.BANK_ACCOUNT || userSetup.BANK_ACCOUNT.length === 0) {
      return rawBankAccounts
    }
    const allowed = userSetup.BANK_ACCOUNT.map(String)
    return rawBankAccounts.filter(
      (ba) =>
        allowed.includes(String(ba.value)) ||
        (ba.bankAccountId && allowed.includes(String(ba.bankAccountId))) ||
        (ba.accountNumber && allowed.includes(String(ba.accountNumber))) ||
        String(ba.value) === String(values.BANK_ACCOUNT),
    )
  }, [rawBankAccounts, userSetup, values.BANK_ACCOUNT])

  const costCenterOptions = useMemo(() => {
    if (!userSetup?.COST_CENTER || userSetup.COST_CENTER.length === 0) {
      return rawCostCenters
    }
    const allowed = userSetup.COST_CENTER.map(String)
    const existingDeptIds = new Set(details.map((d) => String(d.costCenterId)).filter(Boolean))
    return rawCostCenters.filter(
      (cc) =>
        allowed.includes(String(cc.value)) ||
        (cc.label && allowed.includes(String(cc.label))) ||
        existingDeptIds.has(String(cc.value)),
    )
  }, [rawCostCenters, userSetup, details])

  // Payment Types & Mappings: depend on selected Voucher Type
  useEffect(() => {
    if (!activeBuId || !values.VOUCHER_TYPE_ID) {
      setVoucherTypeMappings([])
      setPaymentTypeOptions([])
      return undefined
    }
    let active = true

    voucherTypeMappingApi
      .getByVoucherType(activeBuId, values.VOUCHER_TYPE_ID, 1)
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
  }, [activeBuId, values.VOUCHER_TYPE_ID])

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

  // Payment Throughs: depend on selected Payment Type
  useEffect(() => {
    if (!activeBuId || !values.PAYMENT_TYPE_ID) {
      return undefined
    }
    let active = true

    paymentTypeMappingApi
      .getByPaymentType(activeBuId, values.PAYMENT_TYPE_ID, 1)
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
  }, [activeBuId, values.PAYMENT_TYPE_ID])

  // Cheque numbers: derived from selected Bank Account
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
      if (!isActive && String(c.chequeNo) !== String(values.CHEQUE_NO)) return false

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

    const distinct = Array.from(
      new Set(
        [...matching.map((c) => c.chequeNo), values.CHEQUE_NO ? values.CHEQUE_NO : null].filter(
          Boolean,
        ),
      ),
    )

    return distinct.map((no) => ({ value: no, label: no }))
  }, [allCheques, bankAccountOptions, values.BANK_ACCOUNT, values.CHEQUE_NO])

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

  // Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    const totalAmt = calculateTotal(details)
    const submitValues = {
      ...values,
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
      return
    }

    if (!validation.isBalanced) {
      showError(
        `Voucher is not balanced! Total Debit (${validation.totalDr}) must equal Total Credit (${validation.totalCr}).`,
      )
      return
    }

    setSubmitting(true)
    try {
      const payload = mapVoucherToApi(submitValues, details, attachments, originalRecord)
      await voucherApi.update(voucherId, payload)
      showSuccess('Account Voucher updated successfully!')
      navigate(listPath)
    } catch (err) {
      showError(getApiErrorMessage(err, 'Unable to update voucher.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPage title={'Edit Account Voucher'} backPath={listPath}>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading voucher data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Account Voucher: ${values.VOUCHER_NO || ''}`}
      listTo={listPath}
      hideActions
    >
      <VoucherForm
        values={values}
        errors={errors}
        detailErrors={detailErrors}
        details={details}
        attachments={attachments}
        auditLog={auditLog}
        isEdit={true}
        submitting={submitting}
        submitLabel={'Update'}
        isBankChequeReadOnly={isBankChequeReadOnly}
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

export default VoucherEdit
