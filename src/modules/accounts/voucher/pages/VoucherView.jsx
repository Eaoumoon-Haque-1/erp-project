/**
 * @file Account Voucher View (Read-Only) page.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { afmChartOfAccountsApi } from '../../afm-chart-of-accounts/api/afmChartOfAccountsApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { bankChequeMapApi } from '../../bank-cheque-mapping/api/bankChequeMapApi'
import { bankApi } from '../../bank/api/bankApi'
import { calendarApi } from '../../calendar/api/calendarApi'
import { paymentTypeMappingApi } from '../../payment-type-mapping/api/paymentTypeMappingApi'
import { periodApi } from '../../period/api/periodApi'
import { userLocationApi } from '../../user-location/api/userLocationApi'
import { voucherTypeMappingApi } from '../../voucher-type-mapping/api/voucherTypeMappingApi'
import { voucherApi } from '../api/voucherApi'
import VoucherForm from '../components/VoucherForm'
import { mapVoucherFromApi } from '../data/voucherApiMapper'
import { initialVoucherValues } from '../validation/voucherValidation'

const listPath = '/accounts/voucher'

function VoucherView() {
  const { voucherId } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialVoucherValues)
  const [details, setDetails] = useState([])
  const [attachments, setAttachments] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  // Dropdown / lookup options
  const [voucherTypeOptions, setVoucherTypeOptions] = useState([])
  const [paymentTypeOptions, setPaymentTypeOptions] = useState([])
  const [throughOptions, setThroughOptions] = useState([])
  const [periodOptions, setPeriodOptions] = useState([])
  const [coaOptions, setCoaOptions] = useState([])
  const [costCenterOptions, setCostCenterOptions] = useState([])
  const [bankAccountOptions, setBankAccountOptions] = useState([])
  const [allCheques, setAllCheques] = useState([])
  const [locationOptions, setLocationOptions] = useState([])

  const buId = values.BU_ID

  useEffect(() => {
    let active = true

    Promise.all([
      voucherApi.get(voucherId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, users, employees]) => {
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
        const mapped = mapVoucherFromApi(record, userMap, empMap)
        setValues(mapped)
        setDetails(mapped.details)
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

  // Load lookup options once BU_ID is available
  useEffect(() => {
    if (!buId) return undefined
    let active = true

    // Voucher Types
    afmLookupApi
      .getValuesByTypeCode('VT001', buId, 1)
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

    // Open Periods
    Promise.allSettled([
      periodApi.getOpenPeriods(buId),
      calendarApi.list({ buId }),
      periodApi.list({ buId }),
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
          new Set([
            ...namesFromOpenApi,
            ...namesFromCalendar,
            ...namesFromPeriods,
            values.PERIOD_NAME ? String(values.PERIOD_NAME).trim() : null,
          ]),
        )
          .filter(Boolean)
          .sort()

        setPeriodOptions(distinctNames.map((name) => ({ value: name, label: name })))
      })
      .catch(() => {
        if (active) {
          setPeriodOptions(
            values.PERIOD_NAME ? [{ value: values.PERIOD_NAME, label: values.PERIOD_NAME }] : [],
          )
        }
      })

    // Chart of Accounts
    afmChartOfAccountsApi
      .list({ buId })
      .then((rows) => {
        if (!active) return
        const mappedCoa = (rows || []).map((r) => ({
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

    // Cost Centers: loaded from HR_DEPT and HR_DEPT_GROUP matching BU
    Promise.allSettled([
      departmentsApi.list(values.BG_ID || undefined),
      departmentGroupsApi.list(),
    ]).then(([deptRes, groupRes]) => {
      if (!active) return
      const depts = deptRes.status === 'fulfilled' && Array.isArray(deptRes.value) ? deptRes.value : []
      const groups = groupRes.status === 'fulfilled' && Array.isArray(groupRes.value) ? groupRes.value : []

      const buGroups = groups.filter((g) => String(g.buId ?? '') === String(buId))
      const allowedDeptIds = new Set(buGroups.map((g) => String(g.deptId)))

      const matchedDepts = depts.filter((d) => {
        const inBu = buGroups.length === 0 ? true : allowedDeptIds.has(String(d.id))
        return inBu
      })

      setCostCenterOptions(
        matchedDepts.map((d) => ({
          value: String(d.id),
          label: d.departmentName || d.shortName || String(d.id),
        })),
      )
    })

    // User Locations
    userLocationApi
      .list({ buId })
      .then((rows) => {
        if (!active) return
        setLocationOptions(
          (rows || []).map((r) => ({
            value: String(r.id),
            label: r.shortName ? `${r.location} (${r.shortName})` : r.location,
          })),
        )
      })
      .catch(() => {
        if (active) setLocationOptions([])
      })

    // Bank Accounts
    bankApi
      .list({ buId })
      .then((banks) => {
        if (!active) return
        const accts = []
        ;(banks || []).forEach((b) => {
          if (Array.isArray(b.bankDetails)) {
            b.bankDetails.forEach((d) => {
              const accNum = String(d.accountNumber ?? d.accountNo ?? '').trim()
              if (d.id) {
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
        setBankAccountOptions(accts)
      })
      .catch(() => {
        if (active) setBankAccountOptions([])
      })

    // Cheques
    bankChequeMapApi
      .list({ buId })
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
  }, [buId, values.PERIOD_NAME, values.BG_ID])

  // Payment Types
  useEffect(() => {
    if (!buId || !values.VOUCHER_TYPE_ID) return undefined
    let active = true

    voucherTypeMappingApi
      .getByVoucherType(buId, values.VOUCHER_TYPE_ID, 1)
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
  }, [buId, values.VOUCHER_TYPE_ID])

  // Throughs
  useEffect(() => {
    if (!buId || !values.PAYMENT_TYPE_ID) return undefined
    let active = true

    paymentTypeMappingApi
      .getByPaymentType(buId, values.PAYMENT_TYPE_ID, 1)
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
  }, [buId, values.PAYMENT_TYPE_ID])

  // Cheque options
  const chequeOptions = useMemo(() => {
    if (!values.BANK_ACCOUNT) return []
    const selected = String(values.BANK_ACCOUNT).trim().toLowerCase()

    const matchedAccount = bankAccountOptions.find((a) => {
      const aVal = String(a.value || '').trim().toLowerCase()
      const aId = String(a.bankAccountId || a.id || '').trim().toLowerCase()
      const aNum = String(a.accountNumber || '').trim().toLowerCase()
      return aVal === selected || aId === selected || aNum === selected
    })

    const matched = allCheques.filter((c) => {
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
        [...matched.map((c) => c.chequeNo), values.CHEQUE_NO ? values.CHEQUE_NO : null].filter(
          Boolean,
        ),
      ),
    )
    return distinct.map((no) => ({ value: no, label: no }))
  }, [allCheques, bankAccountOptions, values.BANK_ACCOUNT, values.CHEQUE_NO])

  if (loading) {
    return (
      <FormPage title={'View Account Voucher'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading voucher data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Account Voucher: ${values.VOUCHER_NO || ''}`}
      listTo={listPath}
      hideActions
      afterActions={
        <div className={'flex items-center justify-end pt-3'}>
          <button
            type={'button'}
            onClick={() => navigate(`/accounts/voucher/${voucherId}/edit`)}
            className={
              'px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-sm transition-colors'
            }
          >
            Edit Voucher
          </button>
        </div>
      }
    >
      <VoucherForm
        values={values}
        details={details}
        attachments={attachments}
        auditLog={auditLog}
        readOnly={true}
        voucherTypeOptions={voucherTypeOptions}
        paymentTypeOptions={paymentTypeOptions}
        throughOptions={throughOptions}
        periodOptions={periodOptions}
        bankAccountOptions={bankAccountOptions}
        chequeOptions={chequeOptions}
        coaOptions={coaOptions}
        costCenterOptions={costCenterOptions}
        locationOptions={locationOptions}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default VoucherView
