/** @file API-backed Level of Education edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { levelOfEducationsApi } from '../api/levelOfEducationApi'
import LevelOfEducationForm from '../components/LevelOfEducationForm'
import {
  mapLevelOfEducationFromApi,
  mapLevelOfEducationToApi,
} from '../data/levelOfEducationApiMapper'
import {
  LEVEL_OF_EDUCATION_TABLE,
  initialLevelOfEducationValues,
  validateLevelOfEducation,
} from '../validation/levelOfEducationValidation'

const listPath = '/hris/employee-settings/level-of-education'

function LevelOfEducationEdit() {
  const { levelOfEducationId } = useParams()
  const navigate = useNavigate()
  const levelOfEducationRef = useRef(null)
  const [values, setValues] = useState(initialLevelOfEducationValues)
  const [originalValues, setOriginalValues] = useState(initialLevelOfEducationValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      levelOfEducationsApi.get(levelOfEducationId),
      levelOfEducationsApi.list(),
    ])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapLevelOfEducationFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter(
          (item) => String(item.id) !== String(levelOfEducationId),
        ))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Level of Education.'))
      })
    return () => {
      active = false
    }
  }, [levelOfEducationId])

  const handleChange = (event) => {
    if (!event?.target) return
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateLevelOfEducation(
      values,
      existingRecords.map((record) => record.levelOfEdu),
    )
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await levelOfEducationsApi.update(
        levelOfEducationId,
        mapLevelOfEducationToApi(result.values),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Level of Education.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => levelOfEducationRef.current?.focus())
  }

  return (
    <FormPage
      title={'Level of Education Edit'}
      listTo={listPath}
      tableName={LEVEL_OF_EDUCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
    >
      <LevelOfEducationForm
        values={values}
        errors={errors}
        levelOfEducationRef={levelOfEducationRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default LevelOfEducationEdit
