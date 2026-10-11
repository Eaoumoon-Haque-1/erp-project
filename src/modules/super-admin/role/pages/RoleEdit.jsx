/**
 * @file API-backed Role editor and permission assignment workflow.
 * Role metadata uses Role CRUD APIs; the lower section uses grouped permission
 * endpoints and dependent Module/Menu/Permission lookups.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { menusApi } from '../../create-menu/api/menuApi'
import { modulesApi } from '../../module/api/moduleApi'
import { roleDetailsApi, rolesApi } from '../api/roleApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import { runConfirmedAction } from '../../../../components/shared/actionAlerts'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import RoleForm from '../components/RoleForm'
import RolePermissionAssignment from '../components/RolePermissionAssignment'
import RolePermissionTable from '../components/RolePermissionTable'
import {
  flattenRolePermissions,
  mapRoleFromApi,
  mapRoleToApi,
} from '../data/roleApiMapper'
import {
  initialRoleAssignmentValues,
  initialRoleValues,
  validateRole,
  validateRoleAssignment,
} from '../validation/roleValidation'

const listPath = '/super-admin/role-creation/role'

function RoleEdit() {
  const { roleId } = useParams()
  const [roleValues, setRoleValues] = useState(initialRoleValues)
  const [roleErrors, setRoleErrors] = useState({})
  const [assignmentValues, setAssignmentValues] = useState(
    initialRoleAssignmentValues,
  )
  const [assignmentErrors, setAssignmentErrors] = useState({})
  const [assignments, setAssignments] = useState([])
  const [moduleOptions, setModuleOptions] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
  const [query, setQuery] = useState('')

  const reloadAssignments = async () => {
    const details = await rolesApi.getDetails(roleId)
    setAssignments(flattenRolePermissions(details))
  }

  useEffect(() => {
    let active = true
    Promise.all([rolesApi.get(roleId), rolesApi.getDetails(roleId), modulesApi.list()])
      .then(([role, details, modules]) => {
        if (!active) return
        setRoleValues(mapRoleFromApi(role))
        setAssignments(flattenRolePermissions(details))
        setModuleOptions(
          modules.map((module) => ({
            value: String(module.id),
            label: module.moduleName,
          })),
        )
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Role.')
      })
    return () => {
      active = false
    }
  }, [roleId])

  const handleRoleChange = (event) => {
    const { name, type, value, checked } = event.target
    setRoleValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setRoleErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleRoleUpdate = async (event) => {
    event.preventDefault()
    const result = validateRole(roleValues)
    setRoleValues(result.values)
    setRoleErrors(result.errors)
    if (!result.isValid) return

    try {
      const updated = await rolesApi.update(roleId, mapRoleToApi(result.values))
      setRoleValues(mapRoleFromApi(updated))
    } catch (error) {
      applyApiFormErrors(error, setRoleErrors, 'Unable to update Role.', { roleName: 'PERMISSION_NAME' })
    }
  }

  const handleAssignmentChange = async (event) => {
    const { name, value } = event.target
    const nextValues = {
      ...assignmentValues,
      [name]: value,
      ...(name === 'MODULE_ID' ? { MENU_ID: '', PERMISSION_ID: '' } : {}),
      ...(name === 'MENU_ID' ? { PERMISSION_ID: '' } : {}),
    }
    setAssignmentValues(nextValues)
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }))

    try {
      if (name === 'MODULE_ID') {
        if (!value) {
          setMenuOptions([])
          setPermissionOptions([])
          return
        }
        const menus = await menusApi.listByModule(value)
        setMenuOptions(
          menus.map((menu) => ({
            value: String(menu.id),
            label: menu.menuName,
          })),
        )
        setPermissionOptions([])
      }
      if (name === 'MENU_ID') {
        if (!value) {
          setPermissionOptions([])
          return
        }
        const permissions = await rolesApi.getAvailablePermissions(
          roleId,
          assignmentValues.MODULE_ID,
          value,
        )
        setPermissionOptions(
          permissions.map((permission) => ({
            value: String(permission.id),
            label: permission.permissionName,
          })),
        )
      }
    } catch (error) {
      getApiErrorMessage(error, 'Unable to load permission options.')
    }
  }

  const handleAddPermission = async (event) => {
    event.preventDefault()
    const result = validateRoleAssignment(assignmentValues, assignments)
    setAssignmentValues(result.values)
    setAssignmentErrors(result.errors)
    if (!result.isValid) return

    try {
      await rolesApi.assignPermissions(roleId, {
        moduleId: Number(result.values.MODULE_ID),
        menuId: Number(result.values.MENU_ID),
        permissionIds: [Number(result.values.PERMISSION_ID)],
      })
      await reloadAssignments()
      setAssignmentValues(initialRoleAssignmentValues)
      setMenuOptions([])
      setPermissionOptions([])
    } catch (error) {
      getApiErrorMessage(error, 'Unable to assign Permission.')
    }
  }

  const handleDeletePermission = async (row) => {
    await runConfirmedAction(
      { action: 'delete', entityName: 'Permission', successText: 'Permission removed successfully.' },
      async () => {
        try {
          await roleDetailsApi.removePermission(
            row.ROLE_DETAIL_ID,
            row.PERMISSION_ID,
          )
          await reloadAssignments()
        } catch (error) {
          getApiErrorMessage(error, 'Unable to remove Permission.')
          return false
        }
        return true
      },
    )
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Role Edit'} actionLabel={'List'} actionTo={listPath} />
      <section className={'erp-form-card erp-role-edit-card'}>
        <ActionForm action={'update'} entityName={'Role'} onSubmit={handleRoleUpdate} noValidate>
          <RoleForm
            values={roleValues}
            errors={roleErrors}
            onChange={handleRoleChange}
          />
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'}>Update</button>
          </div>
        </ActionForm>
        <div className={'erp-role-divider'} />
        <ActionForm entityName={'Permission assignment'} onSubmit={handleAddPermission} noValidate>
          <RolePermissionAssignment
            values={assignmentValues}
            errors={assignmentErrors}
            moduleOptions={moduleOptions}
            menuOptions={menuOptions}
            permissionOptions={permissionOptions}
            onChange={handleAssignmentChange}
          />
        </ActionForm>
        <RolePermissionTable
          rows={assignments}
          query={query}
          onQueryChange={setQuery}
          onDelete={handleDeletePermission}
        />
      </section>
    </div>
  )
}

export default RoleEdit
