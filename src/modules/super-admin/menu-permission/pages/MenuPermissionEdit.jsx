/** @file API-backed Menu Permission edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { modulesApi, permissionsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import MenuPermissionForm from '../components/MenuPermissionForm'
import {
  mapPermissionFromApi,
  mapPermissionToApi,
} from '../data/menuPermissionApiMapper'
import {
  MENU_PERMISSION_TABLE,
  initialMenuPermissionValues,
  validateMenuPermission,
} from '../validation/menuPermissionValidation'

const listPath = '/super-admin/menu-creation/menu-permission'

function MenuPermissionEdit() {
  const { permissionId } = useParams()
  const navigate = useNavigate()
  const permissionNameRef = useRef(null)
  const [values, setValues] = useState(initialMenuPermissionValues)
  const [originalValues, setOriginalValues] = useState(initialMenuPermissionValues)
  const [moduleOptions, setModuleOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([permissionsApi.get(permissionId), modulesApi.list()])
      .then(([permission, modules]) => {
        if (!active) return
        const mapped = mapPermissionFromApi(permission)
        setValues(mapped)
        setOriginalValues(mapped)
        setModuleOptions(
          modules.map((module) => ({
            value: String(module.id),
            label: module.moduleName,
          })),
        )
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Permission.'))
      })
    return () => {
      active = false
    }
  }, [permissionId])

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
    const result = validateMenuPermission(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await permissionsApi.update(permissionId, mapPermissionToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Permission.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => permissionNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Menu Permission Edit'}
      listTo={listPath}
      tableName={MENU_PERMISSION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
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

export default MenuPermissionEdit
