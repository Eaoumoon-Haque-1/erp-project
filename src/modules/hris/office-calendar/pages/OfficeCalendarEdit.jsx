/** @file API-backed Office Calendar edit page. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { officeCalendarsApi } from '../api/officeCalendarApi'
import OfficeCalendarForm from '../components/OfficeCalendarForm'
import {
  mapOfficeCalendarFromApi,
  mapOfficeCalendarToApi,
  officeCalendarFieldMap,
} from '../data/officeCalendarApiMapper'
import {
  getOfficeCalendarEventTypeOptions,
  loadOfficeCalendarReferences,
} from '../data/officeCalendarReferences'
import {
  OFFICE_CALENDAR_TABLE,
  createInitialOfficeCalendarValues,
  createOfficeCalendarRows,
  officeCalendarMonthOptions,
  validateOfficeCalendar,
} from '../validation/officeCalendarValidation'

const listPath = '/hris/attendance-settings/office-calendar'

function OfficeCalendarEdit() {
  const { officeCalendarId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(createInitialOfficeCalendarValues)
  const [rows, setRows] = useState([])
  const [original, setOriginal] = useState({ values: createInitialOfficeCalendarValues(), rows: [] })
  const [errors, setErrors] = useState({})
  const [rowErrors, setRowErrors] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [references, setReferences] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([officeCalendarsApi.get(officeCalendarId), loadOfficeCalendarReferences()])
      .then(([record, references]) => {
        if (!active) return
        setReferences(references)
        const mapped = mapOfficeCalendarFromApi(
          record,
          references.businessUnitNames,
          references.eventTypeNames,
        )
        const mappedValues = {
          ID: mapped.ID,
          BU_ID: mapped.BU_ID,
          YEAR: mapped.YEAR,
          MONTH_ID: mapped.MONTH_ID,
          STATUS: mapped.STATUS,
        }
        setValues(mappedValues)
        setRows(mapped.DAYS)
        setOriginal({ values: mappedValues, rows: mapped.DAYS })

        const currentBusinessUnits = references.businessUnits
          .filter((unit) => mapped.BU_ID.includes(String(unit.id)))
          .map((unit) => ({ value: String(unit.id), label: unit.businessUnit }))
        setBusinessUnitOptions([
          ...references.businessUnitOptions,
          ...currentBusinessUnits.filter((option) =>
            !references.businessUnitOptions.some((current) => current.value === option.value)),
        ])
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Office Calendar.')
      })
      .finally(() => {
        if (active) setReferencesLoading(false)
      })
    return () => { active = false }
  }, [officeCalendarId])

  const selectedEventTypeIds = useMemo(
    () => rows.map((row) => row.EVENT_TYPE_ID).filter(Boolean),
    [rows],
  )
  const eventTypeOptions = useMemo(
    () => getOfficeCalendarEventTypeOptions(references, values.BU_ID, selectedEventTypeIds),
    [references, selectedEventTypeIds, values.BU_ID],
  )

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = name === 'YEAR'
      ? value.replace(/\D/g, '').slice(0, 4)
      : type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'YEAR' || name === 'MONTH_ID') {
        setRows(createOfficeCalendarRows(next.YEAR, next.MONTH_ID))
        setRowErrors({})
      }
      return next
    })
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...((name === 'YEAR' || name === 'MONTH_ID') ? { DETAILS: undefined } : {}),
    }))
  }

  const handleBusinessUnitChange = (name, nextValue) => {
    setValues((current) => ({ ...current, [name]: nextValue }))
    const allowedEventIds = new Set(
      getOfficeCalendarEventTypeOptions(references, nextValue).map((option) => option.value),
    )
    setRows((current) => current.map((row) => (
      row.EVENT_TYPE_ID && !allowedEventIds.has(String(row.EVENT_TYPE_ID))
        ? { ...row, EVENT_TYPE_ID: '' }
        : row
    )))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleRowChange = (date, field, value) => {
    setRows((current) => current.map((row) =>
      row.CALENDER_DATE === date ? { ...row, [field]: value } : row,
    ))
    setRowErrors((current) => ({
      ...current,
      [date]: { ...(current[date] ?? {}), [field]: undefined },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateOfficeCalendar(values, rows)
    setValues(result.values)
    setRows(result.rows)
    setErrors(result.errors)
    setRowErrors(result.rowErrors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      await officeCalendarsApi.update(
        officeCalendarId,
        mapOfficeCalendarToApi(result.values, result.rows),
      )
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Office Calendar.', officeCalendarFieldMap)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(original.values)
    setRows(original.rows)
    setErrors({})
    setRowErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage
      title={'Office Calendar Edit'}
      listTo={listPath}
      tableName={OFFICE_CALENDAR_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
    >
      <OfficeCalendarForm
        values={values}
        rows={rows}
        errors={errors}
        rowErrors={rowErrors}
        businessUnitOptions={businessUnitOptions}
        months={officeCalendarMonthOptions}
        eventTypes={eventTypeOptions}
        referencesLoading={referencesLoading}
        allowMultipleBusinessUnits={false}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
        onBusinessUnitChange={handleBusinessUnitChange}
        onRowChange={handleRowChange}
      />
    </FormPage>
  )
}

export default OfficeCalendarEdit
