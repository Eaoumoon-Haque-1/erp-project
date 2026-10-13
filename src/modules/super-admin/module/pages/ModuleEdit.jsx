/** @file API-backed Module edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { modulesApi } from '../api/moduleApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import ModuleForm from '../components/ModuleForm'
import { mapModuleFromApi, mapModuleToApi } from '../data/moduleApiMapper'
import {
  MODULE_TABLE,
  initialModuleValues,
  validateModule,
} from '../validation/moduleValidation'

const listPath = '/super-admin/menu-creation/module'

function ModuleEdit() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const moduleNameRef = useRef(null)
  const [values, setValues] = useState(initialModuleValues)
  const [originalValues, setOriginalValues] = useState(initialModuleValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    modulesApi.get(moduleId)
      .then((record) => {
        if (!active) return
        const mapped = mapModuleFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Module.'))
      })
    return () => {
      active = false
    }
  }, [moduleId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateModule(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await modulesApi.update(moduleId, mapModuleToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Module.', {
        moduleName: 'MODULE_NAME',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => moduleNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Module Edit'}
      listTo={listPath}
      tableName={MODULE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
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

export default ModuleEdit
