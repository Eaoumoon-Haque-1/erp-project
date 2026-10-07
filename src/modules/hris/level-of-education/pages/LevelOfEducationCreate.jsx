/**
 * @file Create-page controller for Level Of Education.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import LevelOfEducationForm from '../components/LevelOfEducationForm'
import {
  LEVEL_OF_EDUCATION_TABLE,
  initialLevelOfEducationValues,
  validateLevelOfEducation,
} from '../validation/levelOfEducationValidation'

function LevelOfEducationCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialLevelOfEducationValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    if (!event || !event.target) return
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateLevelOfEducation(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      return
    }

    navigate('/hris/employee-settings/level-of-education')
  }

  const handleReset = () => {
    setValues(initialLevelOfEducationValues)
    setErrors({})
  }

  return (
    <FormPage
      title={'Level of Education Create'}
      listTo={'/hris/employee-settings/level-of-education'}
      tableName={LEVEL_OF_EDUCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <LevelOfEducationForm
        values={values}
        errors={errors}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default LevelOfEducationCreate
