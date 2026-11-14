/**
 * @file Accounting Period Close Create page.
 * Manages creation of Accounting Period Close entries.
 * - Year: Distinct CALENDAR_YEAR from AFM_CALENDAR_MONTH table
 * - Period Name: Filtered where month PERIOD_STATUS is 'Open' and not yet inserted in AFM_PERIOD
 * - Period Status: Default 'Close', readonly textfield
 * - Submits: PERIOD_YEAR, PERIOD_NAME, PERIOD_STATUS ('Close'), AFM_CALENDAR_MONTH_ID, STATUS (1)
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { calendarApi } from '../../calendar/api/calendarApi'
import { periodApi } from '../api/periodApi'
import PeriodForm from '../components/PeriodForm'
import { mapPeriodToApi } from '../data/periodApiMapper'
import {
  AFM_PERIOD_TABLE,
  initialPeriodValues,
  validatePeriod,
} from '../validation/periodValidation'

const listPath = '/accounts/voucher-setup/period'

function ClosePeriodCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const yearRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialPeriodValues,
    PERIOD_STATUS: 'Close',
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [availableYears, setAvailableYears] = useState([])
  const [candidateMonths, setCandidateMonths] = useState([])
  const [periodsLoading, setPeriodsLoading] = useState(false)

  // Load available calendar years for the logged-in user's Business Unit and Business Group
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    const queryParams = {
      buId: sessionBusinessUnitId,
      ...(sessionGroupId ? { bgId: sessionGroupId } : {}),
      status: 1,
    }

    Promise.allSettled([
      periodApi.list({ ...queryParams, periodStatus: 'Open' }),
      calendarApi.list(queryParams),
      periodApi.getAvailableYears(sessionBusinessUnitId),
    ]).then(([openRes, calsRes, yearsRes]) => {
      if (!active) return

      const openPeriods =
        openRes.status === 'fulfilled' && Array.isArray(openRes.value) ? openRes.value : []
      const cals =
        calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []
      const yearsFromPeriodApi =
        yearsRes.status === 'fulfilled' && Array.isArray(yearsRes.value) ? yearsRes.value : []

      const yearsFromOpen = openPeriods
        .filter((p) => {
          const buMatch = String(p.buId ?? p.BU_ID ?? '').trim() === sessionBusinessUnitId
          const bgMatch = !sessionGroupId || String(p.bgId ?? p.BG_ID ?? '').trim() === sessionGroupId
          const isOpen = String(p.periodStatus ?? p.PERIOD_STATUS ?? '').trim().toLowerCase() === 'open'
          const isActive = Number(p.status ?? p.STATUS ?? 1) === 1
          return buMatch && bgMatch && isOpen && isActive
        })
        .map((p) => String(p.periodYear ?? p.PERIOD_YEAR ?? '').trim())
        .filter(Boolean)

      const yearsFromMonths = cals
        .filter((c) => {
          const buMatch = String(c.buId ?? '').trim() === sessionBusinessUnitId
          const bgMatch = !sessionGroupId || String(c.bgId ?? '').trim() === sessionGroupId
          return buMatch && bgMatch
        })
        .flatMap((c) => (c.calendarMonths || []).map((m) => String(m.calendarYear || c.calendarYear || '').trim()))
        .filter(Boolean)

      const merged = Array.from(new Set([...yearsFromOpen, ...yearsFromMonths, ...yearsFromPeriodApi]))
        .filter(Boolean)
        .sort()

      setAvailableYears(merged)
    })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  // Load all active opened period names of the selected year for the logged-in user's BU and BG
  useEffect(() => {
    if (!sessionBusinessUnitId || !values.PERIOD_YEAR) {
      setCandidateMonths([])
      return undefined
    }

    let active = true
    setPeriodsLoading(true)
    const selectedYear = String(values.PERIOD_YEAR).trim()

    const periodParams = {
      buId: sessionBusinessUnitId,
      ...(sessionGroupId ? { bgId: sessionGroupId } : {}),
      periodYear: selectedYear,
      status: 1,
    }

    const calendarParams = {
      buId: sessionBusinessUnitId,
      ...(sessionGroupId ? { bgId: sessionGroupId } : {}),
      status: 1,
    }

    Promise.allSettled([
      // 1. All active periods from AFM_PERIOD for user's BU, BG and Year
      periodApi.list(periodParams),
      // 2. Candidate months from backend for user's BU, BG and Year
      periodApi.getCandidateMonths(sessionBusinessUnitId, selectedYear, 'Open', sessionGroupId),
      // 3. Calendar months for user's BU and BG
      calendarApi.list(calendarParams),
    ])
      .then(([periodsRes, candidatesRes, calsRes]) => {
        if (!active) return

        const allPeriods =
          periodsRes.status === 'fulfilled' && Array.isArray(periodsRes.value) ? periodsRes.value : []
        const backendCandidates =
          candidatesRes.status === 'fulfilled' && Array.isArray(candidatesRes.value) ? candidatesRes.value : []
        const cals =
          calsRes.status === 'fulfilled' && Array.isArray(calsRes.value) ? calsRes.value : []

        // Set of periods explicitly closed in AFM_PERIOD for user's BU/BG/Year
        const closedPeriodNames = new Set(
          allPeriods
            .filter((p) => {
              const buMatch = String(p.buId ?? p.BU_ID ?? '').trim() === sessionBusinessUnitId
              const bgMatch = !sessionGroupId || String(p.bgId ?? p.BG_ID ?? '').trim() === sessionGroupId
              const yrMatch = String(p.periodYear ?? p.PERIOD_YEAR ?? '').trim().toLowerCase() === selectedYear.toLowerCase()
              const isClosed = String(p.periodStatus ?? p.PERIOD_STATUS ?? '').trim().toLowerCase() === 'close'
              return buMatch && bgMatch && yrMatch && isClosed
            })
            .map((p) => String(p.periodName ?? p.PERIOD_NAME ?? '').trim().toLowerCase()),
        )

        const resultsMap = new Map()

        // 1. Add active opened periods from AFM_PERIOD table
        allPeriods
          .filter((p) => {
            const buMatch = String(p.buId ?? p.BU_ID ?? '').trim() === sessionBusinessUnitId
            const bgMatch = !sessionGroupId || String(p.bgId ?? p.BG_ID ?? '').trim() === sessionGroupId
            const yrMatch = String(p.periodYear ?? p.PERIOD_YEAR ?? '').trim().toLowerCase() === selectedYear.toLowerCase()
            const isOpen = String(p.periodStatus ?? p.PERIOD_STATUS ?? '').trim().toLowerCase() === 'open'
            const isActive = Number(p.status ?? p.STATUS ?? 1) === 1
            return buMatch && bgMatch && yrMatch && isOpen && isActive
          })
          .forEach((p) => {
            const name = String(p.periodName ?? p.PERIOD_NAME ?? '').trim()
            if (!name) return
            const key = name.toLowerCase()
            resultsMap.set(key, {
              id: p.id,
              periodId: p.id,
              afmCalendarMonthId: p.afmCalendarMonthId ?? p.AFM_CALENDAR_MONTH_ID ?? null,
              periodName: name,
              periodYear: selectedYear,
              periodStatus: 'Open',
              buId: p.buId ?? p.BU_ID,
              bgId: p.bgId ?? p.BG_ID,
              status: 1,
            })
          })

        // 2. Add backend candidate open months
        backendCandidates.forEach((m) => {
          const name = String(m.periodName || '').trim()
          if (!name || closedPeriodNames.has(name.toLowerCase())) return
          const key = name.toLowerCase()
          if (!resultsMap.has(key)) {
            resultsMap.set(key, {
              id: m.id,
              periodId: null,
              afmCalendarMonthId: m.id,
              periodName: name,
              periodYear: selectedYear,
              periodStatus: 'Open',
              buId: sessionBusinessUnitId,
              bgId: sessionGroupId,
              status: 1,
            })
          } else {
            const existing = resultsMap.get(key)
            if (!existing.afmCalendarMonthId && m.id) {
              existing.afmCalendarMonthId = m.id
            }
          }
        })

        // 3. Add active open months from AFM_CALENDAR_MONTH for user's BU & BG
        cals.forEach((c) => {
          const buMatch = String(c.buId ?? '').trim() === sessionBusinessUnitId
          const bgMatch = !sessionGroupId || String(c.bgId ?? '').trim() === sessionGroupId
          if (!buMatch || !bgMatch) return

          ;(c.calendarMonths || []).forEach((m) => {
            const yr = String(m.calendarYear || c.calendarYear || '').trim().toLowerCase()
            const st = String(m.periodStatus || '').trim().toLowerCase()
            const act = Number(m.status ?? 1)
            const name = String(m.periodName || '').trim()

            if (
              yr === selectedYear.toLowerCase() &&
              st === 'open' &&
              act === 1 &&
              name &&
              !closedPeriodNames.has(name.toLowerCase())
            ) {
              const key = name.toLowerCase()
              if (!resultsMap.has(key)) {
                resultsMap.set(key, {
                  id: m.id,
                  periodId: null,
                  afmCalendarMonthId: m.id,
                  periodName: name,
                  periodYear: selectedYear,
                  periodStatus: 'Open',
                  buId: sessionBusinessUnitId,
                  bgId: sessionGroupId,
                  status: 1,
                })
              } else {
                const existing = resultsMap.get(key)
                if (!existing.afmCalendarMonthId && m.id) {
                  existing.afmCalendarMonthId = m.id
                }
              }
            }
          })
        })

        const candidates = Array.from(resultsMap.values()).sort((a, b) =>
          a.periodName.localeCompare(b.periodName, undefined, { numeric: true }),
        )

        setCandidateMonths(candidates)
      })
      .catch(() => {
        if (active) setCandidateMonths([])
      })
      .finally(() => {
        if (active) setPeriodsLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId, values.PERIOD_YEAR])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'PERIOD_YEAR') {
      setCandidateMonths([])
      setPeriodsLoading(Boolean(value))
      setValues((prev) => ({
        ...prev,
        PERIOD_YEAR: value,
        PERIOD_NAME: '',
        AFM_CALENDAR_MONTH_ID: '',
        periodId: null,
      }))
      setErrors((prev) => ({ ...prev, PERIOD_YEAR: undefined, PERIOD_NAME: undefined }))
      return
    }

    if (name === 'PERIOD_NAME') {
      const match = candidateMonths.find((m) => {
        const pName = m.periodName || m.value
        return pName === value
      })
      setValues((prev) => ({
        ...prev,
        PERIOD_NAME: value,
        AFM_CALENDAR_MONTH_ID: match
          ? String(match.afmCalendarMonthId || match.id || '')
          : '',
        periodId: match?.periodId || null,
      }))
      setErrors((prev) => ({ ...prev, PERIOD_NAME: undefined }))
      return
    }

    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleReset = () => {
    setValues({
      ...initialPeriodValues,
      PERIOD_STATUS: 'Close',
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
      periodId: null,
    })
    setErrors({})
    setCandidateMonths([])
    yearRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const sessionValues = { BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }
    const { errors: validationErrors, isValid } = validatePeriod(
      { ...values, PERIOD_STATUS: 'Close' },
      sessionValues,
    )
    setErrors(validationErrors)

    if (!isValid) {
      if (validationErrors.PERIOD_YEAR) yearRef.current?.focus()
      return
    }

    const ok = await confirmAction({
      title: 'Close Accounting Period',
      text: `Are you sure you want to close period "${values.PERIOD_NAME}" for year ${values.PERIOD_YEAR}?`,
      confirmButtonText: 'Yes, Close Period',
    })
    if (!ok) return

    setSubmitting(true)
    try {
      const payload = mapPeriodToApi({
        ...values,
        BG_ID: sessionGroupId,
        BU_ID: sessionBusinessUnitId,
        PERIOD_STATUS: 'Close',
        STATUS: 1,
      })
      if (values.periodId) {
        await periodApi.update(values.periodId, payload)
      } else {
        await periodApi.create(payload)
      }
      await showSuccess('Accounting Period closed successfully.')
      navigate(listPath)
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Unable to close Accounting Period.'
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'New Accounting Period Close'}
      tableName={AFM_PERIOD_TABLE}
      backTo={listPath}
      backLabel={'Back to List'}
      onSubmit={handleSubmit}
    >
      <PeriodForm
        values={{ ...values, PERIOD_STATUS: 'Close' }}
        errors={errors}
        availableYears={availableYears}
        periodNameOptions={values.PERIOD_YEAR ? candidateMonths : []}
        periodsLoading={periodsLoading}
        mode={'close-create'}
        submitLabel={'Close Period'}
        submitting={submitting}
        yearRef={yearRef}
        onChange={handleChange}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default ClosePeriodCreate
