/**
 * @file Accounting Period Open Create page.
 * Manages creation of Accounting Period Open entries.
 * - Year: Distinct CALENDAR_YEAR from AFM_CALENDAR_MONTH table
 * - Period Name: Filtered where month PERIOD_STATUS is 'Close' and not yet inserted in AFM_PERIOD
 * - Period Status: Default 'Open', readonly textfield
 * - Submits: PERIOD_YEAR, PERIOD_NAME, PERIOD_STATUS ('Open'), AFM_CALENDAR_MONTH_ID, STATUS (1)
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

function OpenPeriodCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const yearRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialPeriodValues,
    PERIOD_STATUS: 'Open',
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [availableYears, setAvailableYears] = useState([])
  const [candidateMonths, setCandidateMonths] = useState([])
  const [periodsLoading, setPeriodsLoading] = useState(false)

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

  // Load candidate period names where PERIOD_STATUS in AFM_CALENDAR_MONTH is 'Close'
  // and not yet in AFM_PERIOD
  useEffect(() => {
    if (!sessionBusinessUnitId || !values.PERIOD_YEAR) {
      return undefined
    }

    let active = true
    const selectedYear = String(values.PERIOD_YEAR).trim()

    // Attempt backend candidate-months API first, fallback to client-side filtering if needed
    periodApi
      .getCandidateMonths(sessionBusinessUnitId, selectedYear, 'Close')
      .then((candidates) => {
        if (!active) return
        if (Array.isArray(candidates)) {
          setCandidateMonths(candidates)
        } else {
          setCandidateMonths([])
        }
      })
      .catch(async () => {
        // Fallback: load calendar months and existing periods to filter manually
        try {
          const [cals, periods] = await Promise.all([
            calendarApi.list({ buId: sessionBusinessUnitId }).catch(() => []),
            periodApi.list({ buId: sessionBusinessUnitId, periodYear: selectedYear }).catch(() => []),
          ])
          if (!active) return

          const existingNames = new Set(
            (periods || []).map((p) => String(p.periodName ?? p.PERIOD_NAME ?? '').trim().toLowerCase()),
          )

          const months = (cals || []).flatMap((c) => c.calendarMonths || []).filter((m) => {
            const yr = String(m.calendarYear || '').trim().toLowerCase()
            const st = String(m.periodStatus || '').trim().toLowerCase()
            const pName = String(m.periodName || '').trim()
            return (
              yr === selectedYear.toLowerCase() &&
              st === 'close' &&
              pName &&
              !existingNames.has(pName.toLowerCase())
            )
          })

          setCandidateMonths(months)
        } catch {
          if (active) setCandidateMonths([])
        }
      })
      .finally(() => {
        if (active) setPeriodsLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, values.PERIOD_YEAR])

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
        AFM_CALENDAR_MONTH_ID: match ? String(match.id) : '',
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
      PERIOD_STATUS: 'Open',
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setErrors({})
    setCandidateMonths([])
    yearRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const sessionValues = { BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }
    const { errors: validationErrors, isValid } = validatePeriod(
      { ...values, PERIOD_STATUS: 'Open' },
      sessionValues,
    )
    setErrors(validationErrors)

    if (!isValid) {
      if (validationErrors.PERIOD_YEAR) yearRef.current?.focus()
      return
    }

    const ok = await confirmAction({
      title: 'Open Accounting Period',
      text: `Are you sure you want to open period "${values.PERIOD_NAME}" for year ${values.PERIOD_YEAR}?`,
      confirmButtonText: 'Yes, Open Period',
    })
    if (!ok) return

    setSubmitting(true)
    try {
      const payload = mapPeriodToApi({
        ...values,
        BG_ID: sessionGroupId,
        BU_ID: sessionBusinessUnitId,
        PERIOD_STATUS: 'Open',
        STATUS: 1,
      })
      await periodApi.create(payload)
      await showSuccess('Accounting Period opened successfully.')
      navigate(listPath)
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Unable to open Accounting Period.'
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'New Accounting Period Open'}
      tableName={AFM_PERIOD_TABLE}
      backTo={listPath}
      backLabel={'Back to List'}
      onSubmit={handleSubmit}
    >
      <PeriodForm
        values={{ ...values, PERIOD_STATUS: 'Open' }}
        errors={errors}
        availableYears={availableYears}
        periodNameOptions={values.PERIOD_YEAR ? candidateMonths : []}
        periodsLoading={periodsLoading}
        mode={'open-create'}
        submitLabel={'Open Period'}
        submitting={submitting}
        yearRef={yearRef}
        onChange={handleChange}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default OpenPeriodCreate
