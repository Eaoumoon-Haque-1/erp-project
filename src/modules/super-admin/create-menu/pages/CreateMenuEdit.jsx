/** @file API-backed Menu edit page with Module-dependent lookup options. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { permissionsApi } from '../../menu-permission/api/menuPermissionApi'
import { modulesApi } from '../../module/api/moduleApi'
import { menusApi } from '../api/menuApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
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
  const [existingMenus, setExistingMenus] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDependencies = useCallback(async (moduleId) => {
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
        .filter(
          (menu) =>
            String(menu.id) !== String(menuId) &&
            Number(menu.isParent) === 1 &&
            Number(menu.status ?? 1) === 1,
        )
        .map((menu) => ({ value: String(menu.id), label: menu.menuName })),
    )
    setPermissionOptions(
      permissions
        .filter((permission) => Number(permission.status ?? 1) === 1)
        .map((permission) => ({
          value: String(permission.id),
          label: permission.permissionName,
        })),
    )
  }, [menuId])

  useEffect(() => {
    let active = true
    Promise.all([menusApi.get(menuId), modulesApi.list(), menusApi.list()])
      .then(async ([menu, modules, menus]) => {
        const mapped = mapMenuFromApi(menu)
        if (!active) return
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingMenus(menus.filter((item) => String(item.id) !== String(menuId)))
        setModuleOptions(
          modules
            .filter((module) => Number(module.status ?? 1) === 1 || String(module.id) === mapped.MODULE_ID)
            .map((module) => ({
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
  }, [loadDependencies, menuId])

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
        ? {
            IS_PARENT: '0',
            PARENT_MENU_ID: '',
            MODULE_ID: '',
            PERMISSION_ID: [],
            ROUTE_NAME: '#',
          }
        : {}),
      ...(name === 'IS_TOP_MENU' && nextValue === '0'
        ? { ROUTE_NAME: '' }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
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
    if (name === 'MODULE_ID') {
      loadDependencies(nextValue).catch((error) =>
        setMessage(
          getApiErrorMessage(error, 'Unable to load Menu dependencies.'),
        ),
      )
    }
  }

  const handlePermissionChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const existingMenuNames = existingMenus
      .filter((menu) => String(menu.moduleId ?? '') === String(values.MODULE_ID ?? ''))
      .map((menu) => menu.menuName)
    const result = validateMenu(values, existingMenuNames)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await menusApi.update(menuId, mapMenuToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Menu.', {
        menuName: 'MENU_NAME',
        moduleId: 'MODULE_ID',
        parentMenuId: 'PARENT_MENU_ID',
        permissionId: 'PERMISSION_ID',
        routeName: 'ROUTE_NAME',
        sortOrder: 'SORT_ORDER',
      }))
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
        onPermissionChange={handlePermissionChange}
      />
    </FormPage>
  )
}

export default CreateMenuEdit
