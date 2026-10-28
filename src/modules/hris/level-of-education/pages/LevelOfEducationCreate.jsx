/** @file API-backed Level of Education create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { levelOfEducationsApi } from '../api/levelOfEducationApi'
import LevelOfEducationForm from '../components/LevelOfEducationForm'
import { mapLevelOfEducationToApi } from '../data/levelOfEducationApiMapper'
import {
  LEVEL_OF_EDUCATION_TABLE,
  initialLevelOfEducationValues,
  validateLevelOfEducation,
} from '../validation/levelOfEducationValidation'

const listPath = '/hris/employee-settings/level-of-education'

function LevelOfEducationCreate() {
  const navigate = useNavigate()
  const levelOfEducationRef = useRef(null)
  const [values, setValues] = useState(initialLevelOfEducationValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    levelOfEducationsApi.list()
      .then((records) => {
        if (!active) return
        setExistingRecords(records)
        setValues((current) => ({
          ...current,
          SORT_ORDER: getNextSortOrder(records),
        }))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Levels of Education.'))
      })
    return () => {
      active = false
    }
  }, [])

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
      await levelOfEducationsApi.create(mapLevelOfEducationToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Level of Education.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialLevelOfEducationValues,
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => levelOfEducationRef.current?.focus())
  }

  return (
    <FormPage
      title={'Level of Education Create'}
      listTo={listPath}
      tableName={LEVEL_OF_EDUCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
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

export default LevelOfEducationCreate
