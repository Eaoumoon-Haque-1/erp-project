/**
 * @file Accounting Period Open Create page.
 * Manages creation of Accounting Period Open entries.
 * Note: Group Name and Business Unit are handled from session and hidden from UI.
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

function PeriodCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const yearRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialPeriodValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [availableYears, setAvailableYears] = useState([])
  const [periodNameOptions, setPeriodNameOptions] = useState([])
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
      setValues((prev) => {
        if (!prev.PERIOD_YEAR && merged.length > 0) {
          return { ...prev, PERIOD_YEAR: merged[0] }
        }
        return prev
      })
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

        const merged = Array.from(new Set([...namesFromMonths, ...namesFromOpenApi])).filter(
          Boolean,
        )
        setPeriodNameOptions(merged)
      })
      .catch(() => {
        if (active) setPeriodNameOptions([])
      })
      .finally(() => {
        if (active) setPeriodsLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, values.PERIOD_YEAR])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? (checked ? '1' : '0') : value

    if (name === 'PERIOD_YEAR') {
      setPeriodsLoading(true)
      setPeriodNameOptions([])
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
    setValues({
      ...initialPeriodValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
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
      action: 'create',
      entityName: 'Accounting Period Open',
      title: `Open period "${values.PERIOD_NAME}" for Year ${values.PERIOD_YEAR}?`,
    })
    if (!confirmed) return

    setSubmitting(true)
    try {
      await periodApi.create(mapPeriodToApi(payloadValues))
      await showSuccess('Accounting Period opened successfully.')
      navigate(listPath)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to open Accounting Period.'
      await showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'Accounting Period Open'}
      listTo={listPath}
      tableName={AFM_PERIOD_TABLE}
      submitLabel={'Submit'}
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
        isEdit={false}
        submitLabel={'Submit'}
        submitting={submitting}
        yearRef={yearRef}
        onChange={handleChange}
        onReset={handleReset}
      />
    </FormPage>
  )
}

export default PeriodCreate
