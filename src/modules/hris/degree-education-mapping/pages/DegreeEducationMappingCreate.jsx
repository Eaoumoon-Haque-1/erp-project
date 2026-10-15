/** @file API-backed batch-style Degree create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { degreesApi } from '../api/degreeApi'
import DegreeEducationMappingForm from '../components/DegreeEducationMappingForm'
import { mapDegreeToApi } from '../data/degreeApiMapper'
import {
  DEGREE_TABLE,
  initialDegreeEntryValues,
  validateDegreeEntry,
  validateDegreeSubmission,
} from '../validation/degreeEducationMappingValidation'

const listPath = '/hris/employee-settings/degree-education-mapping'
let nextRowId = 0

function DegreeEducationMappingCreate() {
  const navigate = useNavigate()
  const degreeNameRef = useRef(null)
  const [levelOfEducationId, setLevelOfEducationId] = useState('')
  const [levelOptions, setLevelOptions] = useState([])
  const [existingDegrees, setExistingDegrees] = useState([])
  const [entryValues, setEntryValues] = useState(initialDegreeEntryValues)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([levelOfEducationsApi.list(), degreesApi.list()])
      .then(([levels, degrees]) => {
        if (!active) return
        setLevelOptions(levels
          .filter((level) => String(level.status ?? 1) === '1')
          .map((level) => ({ value: String(level.id), label: level.levelOfEdu })))
        setExistingDegrees(degrees)
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Degree options.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const existingRowsForLevel = existingDegrees
    .filter((degree) => String(degree.levelOfEduId) === levelOfEducationId)
    .map((degree) => ({ DEGREE_NAME: degree.degreeName }))

  const handleLevelChange = (event) => {
    setLevelOfEducationId(event.target.value)
    setErrors((current) => ({ ...current, LEVEL_OF_EDU_ID: undefined }))
  }

  const handleEntryChange = (event) => {
    const { name, type, value, checked } = event.target
    setEntryValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined, DEGREES: undefined }))
  }

  const handleAdd = () => {
    if (!levelOfEducationId) {
      setErrors((current) => ({ ...current, LEVEL_OF_EDU_ID: 'Level of Education is required.' }))
      return
    }
    const result = validateDegreeEntry(entryValues, [...existingRowsForLevel, ...rows])
    setEntryValues(result.values)
    setErrors((current) => ({ ...current, ...result.errors }))
    if (!result.isValid) return

    nextRowId += 1
    setRows((current) => [...current, {
      ID: `degree-row-${nextRowId}`,
      LEVEL_OF_EDU_ID: levelOfEducationId,
      ...result.values,
    }])
    setEntryValues(initialDegreeEntryValues)
    setErrors({})
    requestAnimationFrame(() => degreeNameRef.current?.focus())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDegreeSubmission(levelOfEducationId, rows)
    setErrors((current) => ({ ...current, ...result.errors }))
    if (!result.isValid) return

    setSubmitting(true)
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        await degreesApi.create(mapDegreeToApi(row))
      } catch (error) {
        const savedCount = index
        const fallback = savedCount > 0
          ? `${savedCount} degree(s) were saved. Unable to save ${row.DEGREE_NAME}.`
          : `Unable to create ${row.DEGREE_NAME}.`
        const mergeErrors = (update) => {
          const resolved = typeof update === 'function' ? update({}) : update
          setErrors((current) => ({ ...current, ...resolved }))
        }
        applyApiFormErrors(error, mergeErrors, fallback, {
          levelOfEduId: 'LEVEL_OF_EDU_ID', degreeName: 'DEGREE_NAME',
          shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
        })
        if (savedCount > 0) setRows((current) => current.slice(index))
        setSubmitting(false)
        return
      }
    }
    navigate(listPath)
  }

  const handleReset = () => {
    setLevelOfEducationId('')
    setEntryValues(initialDegreeEntryValues)
    setRows([])
    setErrors({})
    requestAnimationFrame(() => degreeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Degree & Education Mapping Create'} listTo={listPath} tableName={DEGREE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DegreeEducationMappingForm
        levelOfEducationId={levelOfEducationId}
        levelOfEducationOptions={levelOptions}
        levelsLoading={loading}
        entryValues={entryValues}
        errors={errors}
        rows={rows}
        degreeNameRef={degreeNameRef}
        onLevelChange={handleLevelChange}
        onEntryChange={handleEntryChange}
        onAdd={handleAdd}
        onRemove={(id) => setRows((current) => current.filter((row) => row.ID !== id))}
      />
    </FormPage>
  )
}

export default DegreeEducationMappingCreate
