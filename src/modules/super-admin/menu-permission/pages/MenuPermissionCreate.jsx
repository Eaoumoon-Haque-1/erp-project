/** @file API-backed Menu Permission create page with temporary staged rows. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { modulesApi } from '../../module/api/moduleApi'
import { permissionsApi } from '../api/menuPermissionApi'
import MenuPermissionForm from '../components/MenuPermissionForm'
import { mapPermissionToApi } from '../data/menuPermissionApiMapper'
import {
  MENU_PERMISSION_TABLE,
  validateMenuPermission,
  validateMenuPermissionRows,
} from '../validation/menuPermissionValidation'

const listPath = '/super-admin/menu-creation/menu-permission'
const initialEntryValues = { PERMISSION_NAME: '', STATUS: '1' }
let nextRowId = 0

function stagePermission(values) {
  nextRowId += 1
  return { key: `permission-row-${nextRowId}`, ...values }
}

function MenuPermissionCreate() {
  const navigate = useNavigate()
  const permissionNameRef = useRef(null)
  const [moduleId, setModuleId] = useState('')
  const [entryValues, setEntryValues] = useState(initialEntryValues)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})
  const [moduleOptions, setModuleOptions] = useState([])
  const [existingPermissions, setExistingPermissions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([modulesApi.list(), permissionsApi.list()])
      .then(([modules, permissions]) => {
        if (!active) return
        setModuleOptions(modules.map((module) => ({
          value: String(module.id),
          label: module.moduleName,
        })))
        setExistingPermissions(permissions)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Menu Permission options.'))
      })
    return () => {
      active = false
    }
  }, [])

  const namesForSelectedModule = () => existingPermissions
    .filter((permission) => String(permission.moduleId) === String(moduleId))
    .map((permission) => permission.permissionName)

  const handleModuleChange = (value) => {
    setModuleId(value)
    setErrors((current) => ({ ...current, MODULE_ID: undefined }))
  }

  const handleEntryChange = (field, value) => {
    setEntryValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, PERMISSIONS: undefined }))
  }

  const handleAdd = () => {
    const result = validateMenuPermission(
      { ...entryValues, MODULE_ID: moduleId },
      [...namesForSelectedModule(), ...rows.map((row) => row.PERMISSION_NAME)],
    )
    setModuleId(result.values.MODULE_ID)
    setEntryValues({
      PERMISSION_NAME: result.values.PERMISSION_NAME,
      STATUS: result.values.STATUS,
    })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setRows((current) => [...current, stagePermission({
      PERMISSION_NAME: result.values.PERMISSION_NAME,
      STATUS: result.values.STATUS,
    })])
    setEntryValues(initialEntryValues)
    setErrors({})
    requestAnimationFrame(() => permissionNameRef.current?.focus())
  }

  const handleRemove = (rowKey) => {
    setRows((current) => current.filter((row) => row.key !== rowKey))
    setErrors((current) => ({ ...current, PERMISSIONS: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateMenuPermissionRows(
      moduleId,
      rows,
      namesForSelectedModule(),
    )
    const nextErrors = {
      MODULE_ID: result.moduleError || undefined,
      PERMISSIONS: rows.length === 0
        ? 'Add at least one permission using the + button.'
        : Object.values(result.rowErrors)[0]?.PERMISSION_NAME,
    }
    setErrors(nextErrors)

    if (!result.isValid || rows.length === 0) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    for (let index = 0; index < result.rows.length; index += 1) {
      const row = result.rows[index]
      try {
        await permissionsApi.create(mapPermissionToApi({ ...row, MODULE_ID: result.moduleId }))
      } catch (error) {
        const savedCount = index
        const fallback = savedCount > 0
          ? `${savedCount} permission(s) were saved. Unable to save ${row.PERMISSION_NAME}.`
          : `Unable to create ${row.PERMISSION_NAME}.`
        const setCurrentRowErrors = (update) => {
          const resolved = typeof update === 'function' ? update({}) : update
          setErrors((current) => ({ ...current, ...resolved }))
        }
        setMessage(applyApiFormErrors(error, setCurrentRowErrors, fallback))
        if (savedCount > 0) setRows(result.rows.slice(index))
        setSubmitting(false)
        return
      }
    }

    navigate(listPath)
  }

  const handleReset = () => {
    setModuleId('')
    setEntryValues(initialEntryValues)
    setRows([])
    setErrors({})
    setMessage('')
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
        moduleId={moduleId}
        moduleOptions={moduleOptions}
        entryValues={entryValues}
        errors={errors}
        rows={rows}
        permissionNameRef={permissionNameRef}
        allowMultiple
        onModuleChange={handleModuleChange}
        onEntryChange={handleEntryChange}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </FormPage>
  )
}

export default MenuPermissionCreate
