/**
 * @file Accounting Period Open Edit page.
 * Allows updating period status (Open / Close) and active status.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { calendarApi } from '../../calendar/api/calendarApi'
import { periodApi } from '../api/periodApi'
import PeriodForm from '../components/PeriodForm'
import { mapPeriodFromApi, mapPeriodToApi } from '../data/periodApiMapper'
import {
  AFM_PERIOD_TABLE,
  initialPeriodValues,
  validatePeriod,
} from '../validation/periodValidation'

const listPath = '/accounts/voucher-setup/period'

function PeriodEdit() {
  const { periodId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const yearRef = useRef(null)
  const [values, setValues] = useState(initialPeriodValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [auditLog, setAuditLog] = useState(null)
  const [availableYears, setAvailableYears] = useState([])
  const [periodNameOptions, setPeriodNameOptions] = useState([])
  const [periodsLoading, setPeriodsLoading] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      periodApi.get(periodId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([data, users, employees]) => {
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
        const mapped = mapPeriodFromApi(data, userMap, empMap)
        setValues(mapped)
        setAuditLog(mapped)
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load Accounting Period')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [periodId])

  // Load available calendar years for the Business Unit from AFM_CALENDAR_MONTH
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    Promise.allSettled([
      periodApi.getAvailableYears(sessionBusinessUnitId),
      calendarApi.list({ buId: sessionBusinessUnitId }),
    ]).then(([yearsRes, calsRes]) => {
      if (!active) return
      const yearsFromPeriodApi =
        yearsRes.status === 'fulfilled' && Array.isArray(yearsRes.value) ? yearsRes.value : []
      const cals =
        calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []
      const yearsFromMonths = cals
        .flatMap((c) => (c.calendarMonths || []).map((m) => String(m.calendarYear || '').trim()))
        .filter(Boolean)

      const merged = Array.from(new Set([...yearsFromMonths, ...yearsFromPeriodApi]))
        .filter(Boolean)
        .sort()

      setAvailableYears(merged)
    })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId])

  // Load period names from AFM_CALENDAR_MONTH for the selected CALENDAR_YEAR
  useEffect(() => {
    if (!sessionBusinessUnitId || !values.PERIOD_YEAR) return undefined

    let active = true
    const selectedYear = String(values.PERIOD_YEAR).trim()

    Promise.allSettled([
      periodApi.getOpenPeriods(sessionBusinessUnitId, selectedYear),
      calendarApi.list({ buId: sessionBusinessUnitId }),
    ])
      .then(([openRes, calsRes]) => {
        if (!active) return
        const namesFromOpenApi =
          openRes.status === 'fulfilled' && Array.isArray(openRes.value) ? openRes.value : []
        const cals =
          calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []
        const namesFromMonths = cals
          .flatMap((c) =>
            (c.calendarMonths || [])
              .filter(
                (m) =>
                  String(m.calendarYear || '').trim().toLowerCase() === selectedYear.toLowerCase(),
              )
              .map((m) => String(m.periodName || '').trim()),
          )
          .filter(Boolean)

        const list = Array.from(new Set([...namesFromMonths, ...namesFromOpenApi])).filter(Boolean)
        if (values.PERIOD_NAME && !list.includes(values.PERIOD_NAME)) {
          list.unshift(values.PERIOD_NAME)
        }
        setPeriodNameOptions(list)
      })
      .catch(() => {
        if (active) {
          setPeriodNameOptions(values.PERIOD_NAME ? [values.PERIOD_NAME] : [])
        }
      })
      .finally(() => {
        if (active) setPeriodsLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, values.PERIOD_YEAR, values.PERIOD_NAME])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? (checked ? '1' : '0') : value

    if (name === 'PERIOD_YEAR') {
      setPeriodsLoading(true)
    }

    setValues((prev) => {
      const updated = { ...prev, [name]: nextVal }
      if (name === 'PERIOD_YEAR' && prev.PERIOD_YEAR !== nextVal) {
        updated.PERIOD_NAME = ''
      }
      return updated
    })

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleReset = () => {
    if (!auditLog) return
    setValues(auditLog)
    setErrors({})
    requestAnimationFrame(() => yearRef.current?.focus())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
    }

    const validation = validatePeriod(payloadValues, {
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const confirmed = await confirmAction({
      action: 'update',
      entityName: 'Accounting Period Open',
      title: `Save changes for period "${values.PERIOD_NAME}"?`,
    })
    if (!confirmed) return

    setSubmitting(true)
    try {
      await periodApi.update(periodId, mapPeriodToApi(payloadValues))
      await showSuccess('Accounting Period updated successfully.')
      navigate(listPath)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to update Accounting Period.'
      await showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={'p-6 text-xs text-gray-500'}>Loading Accounting Period...</div>
  }

  return (
    <FormPage
      title={'Edit Acc. Period Open/Close'}
      listTo={listPath}
      tableName={AFM_PERIOD_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <PeriodForm
        values={values}
        errors={errors}
        availableYears={availableYears}
        periodNameOptions={periodNameOptions}
        periodsLoading={periodsLoading}
        isEdit={true}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        yearRef={yearRef}
        onChange={handleChange}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default PeriodEdit
