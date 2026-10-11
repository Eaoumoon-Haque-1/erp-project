/**
 * @file Create-page controller for Create Menu.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { permissionsApi } from '../../menu-permission/api/menuPermissionApi'
import { modulesApi } from '../../module/api/moduleApi'
import { menusApi } from '../api/menuApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import CreateMenuForm from '../components/CreateMenuForm'
import { mapMenuToApi } from '../data/menuApiMapper'
import { MENU_TABLE, initialMenuValues, validateMenu } from '../validation/createMenuValidation'

const existingMenuNames = []
const listPath = '/super-admin/menu-creation/create-menu'

function CreateMenuCreate() {
  const navigate = useNavigate()
  const menuNameRef = useRef(null)
  const [values, setValues] = useState(initialMenuValues)
  const [errors, setErrors] = useState({})
  const [moduleOptions, setModuleOptions] = useState([])
  const [parentMenuOptions, setParentMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
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

  const loadModuleDependencies = async (moduleId) => {
    if (!moduleId) {
      setParentMenuOptions([])
      setPermissionOptions([])
      return
    }
    try {
      const [menus, permissions] = await Promise.all([
        menusApi.listByModule(moduleId),
        permissionsApi.listByModule(moduleId),
      ])
      setParentMenuOptions(
        menus
          .filter((menu) => Number(menu.isParent) === 1)
          .map((menu) => ({
            value: String(menu.id),
            label: menu.menuName,
          })),
      )
      setPermissionOptions(
        permissions.map((permission) => ({
          value: String(permission.id),
          label: permission.permissionName,
        })),
      )
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Unable to load Menu dependencies.'),
      )
    }
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'MODULE_ID'
        ? { PARENT_MENU_ID: '', PERMISSION_ID: [] }
        : {}),
      ...(name === 'IS_TOP_MENU' && nextValue === '1'
        ? { PARENT_MENU_ID: '', ROUTE_NAME: '#' }
        : {}),
      ...(name === 'IS_TOP_MENU' && nextValue === '0'
        ? {
            IS_PARENT: '0',
            PARENT_MENU_ID: '',
            MODULE_ID: '',
            PERMISSION_ID: [],
            ROUTE_NAME: '',
          }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'MODULE_ID'
        ? { PARENT_MENU_ID: undefined, PERMISSION_ID: undefined }
        : {}),
      ...(name === 'IS_TOP_MENU'
        ? {
            IS_PARENT: undefined,
            PARENT_MENU_ID: undefined,
            MODULE_ID: undefined,
            PERMISSION_ID: undefined,
            ROUTE_NAME: undefined,
          }
        : {}),
    }))
    if (name === 'MODULE_ID') loadModuleDependencies(nextValue)
  }

  const handlePermissionChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateMenu(values, existingMenuNames)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await menusApi.create(mapMenuToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Menu.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialMenuValues)
    setErrors({})
    requestAnimationFrame(() => menuNameRef.current?.focus())
  }

  return (
    <FormPage title={'Create Menu'} listTo={listPath} tableName={MENU_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <CreateMenuForm values={values} errors={errors} menuNameRef={menuNameRef} moduleOptions={moduleOptions} parentMenuOptions={parentMenuOptions} permissionOptions={permissionOptions} onChange={handleChange} onPermissionChange={handlePermissionChange} />
    </FormPage>
  )
}

export default CreateMenuCreate
