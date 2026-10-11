/**
 * @file Create-page controller for Module.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { modulesApi } from '../api/moduleApi'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import ModuleForm from '../components/ModuleForm'
import { mapModuleToApi } from '../data/moduleApiMapper'
import {
  MODULE_TABLE,
  initialModuleValues,
  validateModule,
} from '../validation/moduleValidation'

const existingModuleNames = []
const listPath = '/super-admin/menu-creation/module'

function ModuleCreate() {
  const navigate = useNavigate()
  const moduleNameRef = useRef(null)
  const [values, setValues] = useState(initialModuleValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateModule(values, existingModuleNames)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await modulesApi.create(mapModuleToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Module.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialModuleValues)
    setErrors({})
    requestAnimationFrame(() => moduleNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Module Create'}
      listTo={listPath}
      tableName={MODULE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <ModuleForm
        values={values}
        errors={errors}
        moduleNameRef={moduleNameRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default ModuleCreate
