/**
 * @file Accounting Calendar Create page.
 * Manages calendar master creation, unique account year verification, and 12-month detail generation.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { calendarApi } from '../api/calendarApi'
import CalendarForm from '../components/CalendarForm'
import { mapCalendarToApi } from '../data/calendarApiMapper'
import {
  AFM_CALENDAR_TABLE,
  createInitialCalendarDetailRow,
  generateMonthlyCalendarRows,
  initialCalendarValues,
  validateCalendar,
} from '../validation/calendarValidation'

const listPath = '/accounts/voucher-setup/calendar'

function CalendarCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const yearRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialCalendarValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [existingCalendars, setExistingCalendars] = useState([])

  // Load existing calendars for duplicate Account Year check
  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined
    let active = true

    calendarApi
      .list({ buId: sessionBusinessUnitId })
      .then((data) => {
        if (active && Array.isArray(data)) {
          setExistingCalendars(data)
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId])

  // Automatically generate 12 monthly rows when From Date and To Date are entered
  const handleDatesAutoGenerate = (fromDate, toDate, accountYear, calendarType) => {
    if (fromDate && toDate && toDate >= fromDate) {
      const generated = generateMonthlyCalendarRows(fromDate, toDate, accountYear, calendarType)
      if (generated.length > 0) {
        setRows(generated)
        setValues((prev) => ({ ...prev, PERIOD: String(generated.length) }))
        setErrors((prev) => {
          const next = { ...prev }
          delete next.GENERAL
          return next
        })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? (checked ? '1' : '0') : value

    let nextRows = rows
    if (name === 'FROM_DATE' || name === 'TO_DATE') {
      const fromD = name === 'FROM_DATE' ? nextVal : values.FROM_DATE
      const toD = name === 'TO_DATE' ? nextVal : values.TO_DATE
      if (fromD && toD && toD >= fromD) {
        const generated = generateMonthlyCalendarRows(fromD, toD, values.CALENDAR_YEAR, values.CALENDAR_TYPE)
        if (generated.length > 0) {
          nextRows = generated
          setRows(generated)
        }
      }
    } else if (name === 'CALENDAR_YEAR') {
      if (values.FROM_DATE && values.TO_DATE && values.TO_DATE >= values.FROM_DATE) {
        const generated = generateMonthlyCalendarRows(values.FROM_DATE, values.TO_DATE, nextVal, values.CALENDAR_TYPE)
        if (generated.length > 0) {
          nextRows = generated
          setRows(generated)
        }
      }
    }

    setValues((prev) => {
      const updated = { ...prev, [name]: nextVal }
      if (nextRows !== rows) {
        updated.PERIOD = String(nextRows.length)
      }
      return updated
    })

    // Inline duplicate check for Account Year
    if (name === 'CALENDAR_YEAR') {
      const trimmed = nextVal.trim().toLowerCase()
      const isDup = existingCalendars.some((c) => {
        const cYear = String(c.calendarYear ?? c.CALENDAR_YEAR ?? '').trim().toLowerCase()
        return cYear === trimmed
      })
      if (isDup) {
        setErrors((prev) => ({
          ...prev,
          CALENDAR_YEAR: `Account Year '${nextVal.trim()}' already exists for this Business Unit.`,
        }))
        return
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

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._ROW_ID !== rowId) return r
        const updated = { ...r, [field]: value }

        // If month or year changed, update periodName
        if (field === 'CALENDAR_MONTH' || field === 'CALENDAR_YEAR') {
          const m = field === 'CALENDAR_MONTH' ? value : r.CALENDAR_MONTH
          const y = field === 'CALENDAR_YEAR' ? value : r.CALENDAR_YEAR
          const mShort = (m || '').slice(0, 3)
          updated.PERIOD_NAME = `${mShort}-${y}`
        }

        return updated
      })
    )

    if (errors.subRows?.[rowId]?.[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        if (next.subRows?.[rowId]) {
          delete next.subRows[rowId][field]
          if (Object.keys(next.subRows[rowId]).length === 0) {
            delete next.subRows[rowId]
          }
        }
        return next
      })
    }
  }

  const handleAddRow = () => {
    const nextSerial = rows.length + 1
    const newRow = createInitialCalendarDetailRow({
      SERIAL_NO: nextSerial,
      CALENDAR_YEAR: values.CALENDAR_YEAR,
      PERIOD_NAME: `Period-${nextSerial}`,
    })
    setRows((prev) => [...prev, newRow])
    setValues((prev) => ({ ...prev, PERIOD: String(rows.length + 1) }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.GENERAL
      return next
    })
  }

  const handleRemoveRow = (rowId) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r._ROW_ID !== rowId)
      const renumbered = filtered.map((r, i) => ({ ...r, SERIAL_NO: i + 1 }))
      setValues((v) => ({ ...v, PERIOD: String(renumbered.length) }))
      return renumbered
    })
  }

  const handleAutoGenerateClick = () => {
    handleDatesAutoGenerate(values.FROM_DATE, values.TO_DATE, values.CALENDAR_YEAR, values.CALENDAR_TYPE)
  }

  const handleValidate = () => {
    const bgId = sessionGroupId || values.BG_ID
    const buId = sessionBusinessUnitId || values.BU_ID
    if (!bgId || !buId) {
      showError('Group Name and Business Unit are required from user session. Please re-login.')
      return false
    }

    let currentRows = rows
    if (
      (!currentRows || currentRows.length === 0) &&
      values.FROM_DATE &&
      values.TO_DATE &&
      values.TO_DATE >= values.FROM_DATE
    ) {
      currentRows = generateMonthlyCalendarRows(
        values.FROM_DATE,
        values.TO_DATE,
        values.CALENDAR_YEAR,
        values.CALENDAR_TYPE
      )
      if (currentRows.length > 0) {
        setRows(currentRows)
        setValues((prev) => ({ ...prev, PERIOD: String(currentRows.length) }))
      }
    }

    const payloadValues = {
      ...values,
      BG_ID: bgId,
      BU_ID: buId,
    }

    const validation = validateCalendar(payloadValues, currentRows, existingCalendars)
    if (!validation.isValid) {
      setErrors(validation.errors)
      if (validation.errors.CALENDAR_YEAR) {
        showError(validation.errors.CALENDAR_YEAR)
      } else if (validation.errors.GENERAL) {
        showError(validation.errors.GENERAL)
      } else if (validation.errors.FROM_DATE || validation.errors.TO_DATE) {
        showError(validation.errors.FROM_DATE || validation.errors.TO_DATE)
      } else {
        showError('Please correct the highlighted form errors before proceeding.')
      }
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    let currentRows = rows
    if (
      (!currentRows || currentRows.length === 0) &&
      values.FROM_DATE &&
      values.TO_DATE &&
      values.TO_DATE >= values.FROM_DATE
    ) {
      currentRows = generateMonthlyCalendarRows(
        values.FROM_DATE,
        values.TO_DATE,
        values.CALENDAR_YEAR,
        values.CALENDAR_TYPE
      )
    }

    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      STATUS: '1',
    }

    setSubmitting(true)
    try {
      await calendarApi.create(mapCalendarToApi(payloadValues, currentRows))
      navigate(listPath)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to create Accounting Calendar.'
      if (err?.response?.status === 409 || msg.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({
          ...prev,
          CALENDAR_YEAR: msg,
        }))
      }
      showError(msg)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!handleValidate()) return

    let currentRows = rows
    if (
      (!currentRows || currentRows.length === 0) &&
      values.FROM_DATE &&
      values.TO_DATE &&
      values.TO_DATE >= values.FROM_DATE
    ) {
      currentRows = generateMonthlyCalendarRows(
        values.FROM_DATE,
        values.TO_DATE,
        values.CALENDAR_YEAR,
        values.CALENDAR_TYPE
      )
    }

    const payloadValues = {
      ...values,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      STATUS: '0',
    }

    const confirmed = await confirmAction({
      action: 'draft',
      entityName: 'Accounting Calendar',
      title: 'Save this calendar as draft?',
    })
    if (!confirmed) return

    setSubmitting(true)
    try {
      await calendarApi.create(mapCalendarToApi(payloadValues, currentRows))
      await showSuccess('Accounting Calendar saved as draft.')
      navigate(listPath)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to save Accounting Calendar as draft.'
      if (err?.response?.status === 409 || msg.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({
          ...prev,
          CALENDAR_YEAR: msg,
        }))
      }
      await showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormPage
      title={'Add New Accounting Calendar'}
      listTo={listPath}
      tableName={AFM_CALENDAR_TABLE}
      submitLabel={'Submit'}
      hideActions
      onValidate={handleValidate}
      onSubmit={handleSubmit}
      submitting={submitting}
    >
      <CalendarForm
        values={values}
        errors={errors}
        rows={rows}
        isEdit={false}
        submitting={submitting}
        yearRef={yearRef}
        onChange={handleChange}
        onRowChange={handleRowChange}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onAutoGenerate={handleAutoGenerateClick}
        onSaveDraft={handleSaveDraft}
      />
    </FormPage>
  )
}

export default CalendarCreate
