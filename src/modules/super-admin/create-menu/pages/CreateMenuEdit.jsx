/** @file API-backed Menu edit page with Module-dependent lookup options. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { menusApi, modulesApi, permissionsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import CreateMenuForm from '../components/CreateMenuForm'
import { mapMenuFromApi, mapMenuToApi } from '../data/menuApiMapper'
import {
  MENU_TABLE,
  initialMenuValues,
  validateMenu,
} from '../validation/createMenuValidation'

const listPath = '/super-admin/menu-creation/create-menu'

function CreateMenuEdit() {
  const { menuId } = useParams()
  const navigate = useNavigate()
  const menuNameRef = useRef(null)
  const [values, setValues] = useState(initialMenuValues)
  const [originalValues, setOriginalValues] = useState(initialMenuValues)
  const [moduleOptions, setModuleOptions] = useState([])
  const [parentMenuOptions, setParentMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDependencies = async (moduleId) => {
    if (!moduleId) {
      setParentMenuOptions([])
      setPermissionOptions([])
      return
    }
    const [menus, permissions] = await Promise.all([
      menusApi.listByModule(moduleId),
      permissionsApi.listByModule(moduleId),
    ])
    setParentMenuOptions(
      menus
        .filter((menu) => String(menu.id) !== String(menuId))
        .map((menu) => ({ value: String(menu.id), label: menu.menuName })),
    )
    setPermissionOptions(
      permissions.map((permission) => ({
        value: String(permission.id),
        label: permission.permissionName,
      })),
    )
  }

  useEffect(() => {
    let active = true
    Promise.all([menusApi.get(menuId), modulesApi.list()])
      .then(async ([menu, modules]) => {
        const mapped = mapMenuFromApi(menu)
        if (!active) return
        setValues(mapped)
        setOriginalValues(mapped)
        setModuleOptions(
          modules.map((module) => ({
            value: String(module.id),
            label: module.moduleName,
          })),
        )
        await loadDependencies(mapped.MODULE_ID)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Menu.'))
      })
    return () => {
      active = false
    }
  }, [menuId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'MODULE_ID'
        ? { PARENT_MENU_ID: '', PERMISSION_ID: '' }
        : {}),
      ...(name === 'IS_TOP_MENU' && nextValue === '1'
        ? { PARENT_MENU_ID: '' }
        : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (name === 'MODULE_ID') {
      loadDependencies(nextValue).catch((error) =>
        setMessage(
          getApiErrorMessage(error, 'Unable to load Menu dependencies.'),
        ),
      )
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateMenu(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await menusApi.update(menuId, mapMenuToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Menu.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    loadDependencies(originalValues.MODULE_ID).catch(() => {})
    requestAnimationFrame(() => menuNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Menu Edit'}
      listTo={listPath}
      tableName={MENU_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
    >
      <CreateMenuForm
        values={values}
        errors={errors}
        menuNameRef={menuNameRef}
        moduleOptions={moduleOptions}
        parentMenuOptions={parentMenuOptions}
        permissionOptions={permissionOptions}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default CreateMenuEdit
