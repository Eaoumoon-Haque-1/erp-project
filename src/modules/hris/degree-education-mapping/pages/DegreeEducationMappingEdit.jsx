/** @file API-backed Degree edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { degreesApi } from '../api/degreeApi'
import DegreeForm from '../components/DegreeForm'
import { mapDegreeFromApi, mapDegreeToApi } from '../data/degreeApiMapper'
import { DEGREE_TABLE, initialDegreeEntryValues, validateDegreeEntry } from '../validation/degreeEducationMappingValidation'

const listPath = '/hris/employee-settings/degree-education-mapping'
const initialValues = { LEVEL_OF_EDU_ID: '', ...initialDegreeEntryValues }

function DegreeEducationMappingEdit() {
  const { degreeId } = useParams()
  const navigate = useNavigate()
  const degreeNameRef = useRef(null)
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [levelOptions, setLevelOptions] = useState([])
  const [existingDegrees, setExistingDegrees] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([degreesApi.get(degreeId), degreesApi.list(), levelOfEducationsApi.list()])
      .then(([degree, degrees, levels]) => {
        if (!active) return
        const mapped = mapDegreeFromApi(degree)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingDegrees(degrees.filter((item) => String(item.id) !== String(degreeId)))
        setLevelOptions(levels
          .filter((level) => String(level.status ?? 1) === '1' || String(level.id) === mapped.LEVEL_OF_EDU_ID)
          .map((level) => ({ value: String(level.id), label: level.levelOfEdu })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Degree.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [degreeId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const duplicates = existingDegrees
      .filter((degree) => String(degree.levelOfEduId) === values.LEVEL_OF_EDU_ID)
      .map((degree) => ({ DEGREE_NAME: degree.degreeName }))
    const result = validateDegreeEntry(values, duplicates)
    const nextValues = { ...values, ...result.values }
    const nextErrors = { ...result.errors }
    if (!values.LEVEL_OF_EDU_ID) nextErrors.LEVEL_OF_EDU_ID = 'Level of Education is required.'
    setValues(nextValues)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await degreesApi.update(degreeId, mapDegreeToApi(nextValues))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Degree.', {
        levelOfEduId: 'LEVEL_OF_EDU_ID', degreeName: 'DEGREE_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    requestAnimationFrame(() => degreeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Degree & Education Mapping Edit'} listTo={listPath} tableName={DEGREE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} submitting={submitting}>
      <DegreeForm values={values} errors={errors} levelOptions={levelOptions} loadingLevels={loading} degreeNameRef={degreeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default DegreeEducationMappingEdit
