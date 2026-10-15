/**
 * @file API-backed Role editor and permission assignment workflow.
 * Role metadata uses Role CRUD APIs; the lower section uses grouped permission
 * endpoints and dependent Module/Menu/Permission lookups.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { menusApi } from '../../create-menu/api/menuApi'
import { modulesApi } from '../../module/api/moduleApi'
import { rolePermissionsApi, rolesApi } from '../api/roleApi'
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
  const [stagedAssignments, setStagedAssignments] = useState([])
  const [moduleOptions, setModuleOptions] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
  const [query, setQuery] = useState('')
  const [existingRoleNames, setExistingRoleNames] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const reloadAssignments = async () => {
    const details = await rolePermissionsApi.getDetails(roleId)
    setAssignments(flattenRolePermissions(details))
  }

  useEffect(() => {
    let active = true
    Promise.all([rolesApi.get(roleId), rolePermissionsApi.getDetails(roleId), modulesApi.list(), rolesApi.list()])
      .then(([role, details, modules, roles]) => {
        if (!active) return
        setRoleValues(mapRoleFromApi(role))
        setAssignments(flattenRolePermissions(details))
        setExistingRoleNames(
          roles
            .filter((item) => String(item.id) !== String(roleId))
            .map((item) => item.roleName),
        )
        setModuleOptions(
          modules
            .filter((module) => Number(module.status ?? 1) === 1)
            .map((module) => ({
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
    const result = validateRole(roleValues, existingRoleNames)
    setRoleValues(result.values)
    setRoleErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    let updated
    try {
      updated = await rolesApi.update(roleId, mapRoleToApi(result.values))
    } catch (error) {
      applyApiFormErrors(error, setRoleErrors, 'Unable to update Role.', { roleName: 'PERMISSION_NAME' })
      setSubmitting(false)
      return
    }

    const savedRowIds = new Set()
    for (const row of stagedAssignments) {
      try {
        await rolePermissionsApi.assignPermissions(roleId, {
          moduleId: Number(row.MODULE_ID),
          menuId: Number(row.MENU_ID),
          permissionIds: row.PERMISSION_IDS.map(Number),
        })
        savedRowIds.add(row.ID)
      } catch (error) {
        setRoleValues(mapRoleFromApi(updated))
        setStagedAssignments((current) =>
          current.filter((item) => !savedRowIds.has(item.ID)),
        )
        await reloadAssignments().catch(() => {})
        getApiErrorMessage(
          error,
          'The Role was updated, but not all Permission assignments were saved.',
        )
        setSubmitting(false)
        return
      }
    }

    setRoleValues(mapRoleFromApi(updated))
    setStagedAssignments([])
    setAssignmentValues(initialRoleAssignmentValues)
    setAssignmentErrors({})
    setMenuOptions([])
    setPermissionOptions([])
    try {
      await reloadAssignments()
    } catch (error) {
      getApiErrorMessage(error, 'Role changes were saved, but assignments could not be reloaded.')
    }
    setSubmitting(false)
  }

  const handleAssignmentChange = async (event) => {
    const { name, value } = event.target
    const nextValues = {
      ...assignmentValues,
      [name]: value,
      ...(name === 'MODULE_ID' ? { MENU_ID: '', PERMISSION_ID: [] } : {}),
      ...(name === 'MENU_ID' ? { PERMISSION_ID: [] } : {}),
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
          menus
            .filter((menu) => Number(menu.isParent ?? 0) === 0 && Number(menu.isTopMenu ?? 0) === 0 && Number(menu.status ?? 1) === 1)
            .map((menu) => ({
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
        const permissions = await rolePermissionsApi.getAvailablePermissions(
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

  const handleAddPermission = (event) => {
    event.preventDefault()
    const stagedPermissionRows = stagedAssignments.flatMap((row) =>
      row.PERMISSION_IDS.map((permissionId) => ({
        MODULE_ID: row.MODULE_ID,
        MENU_ID: row.MENU_ID,
        PERMISSION_ID: permissionId,
      })),
    )
    const result = validateRoleAssignment(
      assignmentValues,
      [...assignments, ...stagedPermissionRows],
    )
    setAssignmentValues(result.values)
    setAssignmentErrors(result.errors)
    if (!result.isValid) return

    const moduleName = moduleOptions.find(
      (option) => option.value === result.values.MODULE_ID,
    )?.label || result.values.MODULE_ID
    const menuName = menuOptions.find(
      (option) => option.value === result.values.MENU_ID,
    )?.label || result.values.MENU_ID
    const selectedPermissions = result.values.PERMISSION_ID.map((permissionId) => ({
      id: permissionId,
      name: permissionOptions.find((option) => option.value === permissionId)?.label || permissionId,
    }))

    setStagedAssignments((current) => {
      const existing = current.find((row) => (
        row.MODULE_ID === result.values.MODULE_ID
        && row.MENU_ID === result.values.MENU_ID
      ))
      if (existing) {
        return current.map((row) => row.ID === existing.ID ? {
          ...row,
          PERMISSION_IDS: [
            ...row.PERMISSION_IDS,
            ...selectedPermissions.map((permission) => permission.id),
          ],
          PERMISSION_NAMES: [
            ...row.PERMISSION_NAMES,
            ...selectedPermissions.map((permission) => permission.name),
          ],
          PERMISSION_NAME: [
            ...row.PERMISSION_NAMES,
            ...selectedPermissions.map((permission) => permission.name),
          ].join(', '),
        } : row)
      }

      return [...current, {
        ID: `pending-${result.values.MODULE_ID}-${result.values.MENU_ID}`,
        MODULE_ID: result.values.MODULE_ID,
        MODULE_NAME: moduleName,
        MENU_ID: result.values.MENU_ID,
        MENU_NAME: menuName,
        PERMISSION_IDS: selectedPermissions.map((permission) => permission.id),
        PERMISSION_NAMES: selectedPermissions.map((permission) => permission.name),
        PERMISSION_NAME: selectedPermissions.map((permission) => permission.name).join(', '),
        IS_STAGED: true,
      }]
    })
    setAssignmentValues((current) => ({ ...current, PERMISSION_ID: [] }))
    setAssignmentErrors({})
  }

  const handleDeletePermission = async (row) => {
    if (row.IS_STAGED) {
      setStagedAssignments((current) =>
        current.filter((item) => item.ID !== row.ID),
      )
      return
    }

    await runConfirmedAction(
      { action: 'delete', entityName: 'Permission', successText: 'Permission removed successfully.' },
      async () => {
        try {
          await rolePermissionsApi.removePermission(
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
        <ActionForm id={'role-edit-form'} action={'update'} entityName={'Role'} onSubmit={handleRoleUpdate} noValidate>
          <RoleForm
            values={roleValues}
            errors={roleErrors}
            onChange={handleRoleChange}
          />
        </ActionForm>
        <div className={'erp-role-divider'} />
        <div>
          <RolePermissionAssignment
            values={assignmentValues}
            errors={assignmentErrors}
            moduleOptions={moduleOptions}
            menuOptions={menuOptions}
            permissionOptions={permissionOptions}
            onChange={handleAssignmentChange}
            onAdd={handleAddPermission}
          />
        </div>
        <RolePermissionTable
          rows={[...assignments, ...stagedAssignments]}
          query={query}
          onQueryChange={setQuery}
          onDelete={handleDeletePermission}
        />
        <div className={'erp-form-actions'}>
          <button type={'submit'} form={'role-edit-form'} className={'primary-button'} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default RoleEdit
