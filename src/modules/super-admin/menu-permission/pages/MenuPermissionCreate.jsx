/**
 * @file Create-page controller for Menu Permission.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { modulesApi, permissionsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import MenuPermissionForm from '../components/MenuPermissionForm'
import { mapPermissionToApi } from '../data/menuPermissionApiMapper'
import {
  MENU_PERMISSION_TABLE,
  initialMenuPermissionValues,
  validateMenuPermission,
} from '../validation/menuPermissionValidation'

const existingPermissionNames = []
const listPath = '/super-admin/menu-creation/menu-permission'

function MenuPermissionCreate() {
  const navigate = useNavigate()
  const permissionNameRef = useRef(null)
  const [values, setValues] = useState(initialMenuPermissionValues)
  const [errors, setErrors] = useState({})
  const [moduleOptions, setModuleOptions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    modulesApi.list()
      .then((modules) => {
        if (active) {
          setModuleOptions(
            modules.map((module) => ({
              value: String(module.id),
              label: module.moduleName,
            })),
          )
        }
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Modules.'))
      })
    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateMenuPermission(values, existingPermissionNames)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await permissionsApi.create(mapPermissionToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to create Permission.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialMenuPermissionValues)
    setErrors({})
    requestAnimationFrame(() => permissionNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Menu Permission Create'}
      listTo={listPath}
      tableName={MENU_PERMISSION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <MenuPermissionForm
        values={values}
        errors={errors}
        permissionNameRef={permissionNameRef}
        moduleOptions={moduleOptions}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default MenuPermissionCreate
