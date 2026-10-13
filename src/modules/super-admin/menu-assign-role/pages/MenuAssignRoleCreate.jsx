/** @file Assigns menu permissions to a selected role using the documented role endpoints. */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { menusApi } from '../../create-menu/api/menuApi'
import { modulesApi } from '../../module/api/moduleApi'
import { rolePermissionsApi, rolesApi } from '../../role/api/roleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import { runConfirmedAction } from '../../../../components/shared/actionAlerts'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import RolePermissionAssignment from '../../role/components/RolePermissionAssignment'
import RolePermissionTable from '../../role/components/RolePermissionTable'
import { flattenRolePermissions } from '../../role/data/roleApiMapper'
import { initialRoleAssignmentValues, validateRoleAssignment } from '../../role/validation/roleValidation'

const listPath = '/super-admin/role-creation/menu-assign-role'

function groupAssignedPermissions(rows) {
  return Array.from(rows.reduce((groups, row) => {
    const key = `${row.MODULE_ID}:${row.MENU_ID}`
    const group = groups.get(key) || {
      ID: `assigned-${key}`,
      ROLE_DETAIL_ID: row.ROLE_DETAIL_ID,
      MODULE_ID: row.MODULE_ID,
      MODULE_NAME: row.MODULE_NAME,
      MENU_ID: row.MENU_ID,
      MENU_NAME: row.MENU_NAME,
      PERMISSION_NAME: '',
      PERMISSIONS: [],
      IS_STAGED: false,
    }
    group.PERMISSIONS.push({
      ROLE_DETAIL_ID: row.ROLE_DETAIL_ID,
      PERMISSION_ID: row.PERMISSION_ID,
      PERMISSION_NAME: row.PERMISSION_NAME,
    })
    group.PERMISSION_NAME = group.PERMISSIONS.map((permission) => permission.PERMISSION_NAME).join(', ')
    groups.set(key, group)
    return groups
  }, new Map()).values())
}

function expandStagedPermissions(rows) {
  return rows.flatMap((row) => row.PERMISSION_IDS.map((permissionId) => ({
    MODULE_ID: row.MODULE_ID,
    MENU_ID: row.MENU_ID,
    PERMISSION_ID: permissionId,
  })))
}

function MenuAssignRoleCreate() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [roleId, setRoleId] = useState(searchParams.get('roleId') || '')
  const [roleOptions, setRoleOptions] = useState([])
  const [assignmentValues, setAssignmentValues] = useState(initialRoleAssignmentValues)
  const [assignmentErrors, setAssignmentErrors] = useState({})
  const [assignments, setAssignments] = useState([])
  const [stagedAssignments, setStagedAssignments] = useState([])
  const [moduleOptions, setModuleOptions] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([rolesApi.list(), modulesApi.list()])
      .then(([roles, modules]) => {
        if (!active) return
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setModuleOptions(modules.filter((module) => Number(module.status ?? 1) === 1).map((module) => ({ value: String(module.id), label: module.moduleName })))
      })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load assignment options.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!roleId) return
    let active = true
    rolePermissionsApi.getDetails(roleId)
      .then((details) => { if (active) setAssignments(flattenRolePermissions(details)) })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load assigned permissions.') })
    return () => { active = false }
  }, [roleId])

  const reloadAssignments = async () => setAssignments(flattenRolePermissions(await rolePermissionsApi.getDetails(roleId)))

  const changeRole = (event) => {
    const value = event.target.value
    setRoleId(value); setSearchParams(value ? { roleId: value } : {}); setAssignmentValues(initialRoleAssignmentValues); setAssignmentErrors({}); setAssignments([]); setStagedAssignments([]); setMenuOptions([]); setPermissionOptions([])
  }

  const changeAssignment = async (event) => {
    const { name, value } = event.target
    setAssignmentValues((current) => ({ ...current, [name]: value, ...(name === 'MODULE_ID' ? { MENU_ID: '', PERMISSION_ID: [] } : {}), ...(name === 'MENU_ID' ? { PERMISSION_ID: [] } : {}) }))
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }))
    try {
      if (name === 'MODULE_ID') {
        setMenuOptions(value ? (await menusApi.listByModule(value))
          .filter((menu) => Number(menu.isParent ?? 0) === 0 && Number(menu.isTopMenu ?? 0) === 0 && Number(menu.status ?? 1) === 1)
          .map((menu) => ({ value: String(menu.id), label: menu.menuName })) : [])
        setPermissionOptions([])
      } else if (name === 'MENU_ID') {
        setPermissionOptions(value && roleId ? (await rolePermissionsApi.getAvailablePermissions(roleId, assignmentValues.MODULE_ID, value)).map((permission) => ({ value: String(permission.id), label: permission.permissionName })) : [])
      }
    } catch (error) { getApiErrorMessage(error, 'Unable to load permission options.') }
  }

  const add = async () => {
    if (!roleId) {
      setAssignmentErrors((current) => ({ ...current, ROLE_ID: 'Role Name is required.' }))
      return
    }
    const result = validateRoleAssignment(
      assignmentValues,
      [...assignments, ...expandStagedPermissions(stagedAssignments)],
    )
    setAssignmentValues(result.values); setAssignmentErrors(result.errors)
    if (!result.isValid) return

    const moduleName = moduleOptions.find((option) => option.value === result.values.MODULE_ID)?.label || result.values.MODULE_ID
    const menuName = menuOptions.find((option) => option.value === result.values.MENU_ID)?.label || result.values.MENU_ID
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
          PERMISSION_IDS: [...row.PERMISSION_IDS, ...selectedPermissions.map((permission) => permission.id)],
          PERMISSION_NAME: [...row.PERMISSION_NAMES, ...selectedPermissions.map((permission) => permission.name)].join(', '),
          PERMISSION_NAMES: [...row.PERMISSION_NAMES, ...selectedPermissions.map((permission) => permission.name)],
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

  const save = async (event) => {
    event.preventDefault()
    if (!roleId) {
      setAssignmentErrors((current) => ({ ...current, ROLE_ID: 'Role Name is required.' }))
      return
    }
    if (stagedAssignments.length === 0) {
      setAssignmentErrors((current) => ({ ...current, PERMISSION_ID: 'Add at least one Permission using the + button.' }))
      return
    }

    setSubmitting(true)
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
        setStagedAssignments((current) => current.filter((row) => !savedRowIds.has(row.ID)))
        await reloadAssignments().catch(() => {})
        setSubmitting(false)
        getApiErrorMessage(error, 'Unable to save all Permission assignments.')
        return
      }
    }

    setSubmitting(false)
    navigate(listPath)
  }

  const resetStaged = () => {
    setAssignmentValues(initialRoleAssignmentValues)
    setAssignmentErrors({})
    setStagedAssignments([])
    setMenuOptions([])
    setPermissionOptions([])
  }

  const remove = async (row) => {
    if (row.IS_STAGED) {
      setStagedAssignments((current) => current.filter((item) => item.ID !== row.ID))
      setAssignmentErrors((current) => ({ ...current, PERMISSION_ID: undefined }))
      return
    }

    await runConfirmedAction(
      { action: 'delete', entityName: 'Permission assignment', successText: 'Permission assignment removed successfully.' },
      async () => {
        try {
          await rolePermissionsApi.remove(row.ROLE_DETAIL_ID)
          await reloadAssignments()
        } catch (error) { getApiErrorMessage(error, 'Unable to remove Permission assignment.'); return false }
        return true
      },
    )
  }

  const permissionRows = [...groupAssignedPermissions(assignments), ...stagedAssignments]

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Menu Assign to Role Create'} actionLabel={'List'} actionTo={listPath} />
      <section className={'erp-form-card erp-role-edit-card'}>
        <ActionForm entityName={'Permission assignment'} successText={'Permissions assigned successfully.'} onSubmit={save} noValidate>
          <div className={'max-w-md'}><label className={'erp-field-label'} htmlFor={'ROLE_ID'}>Role Name<span className={'erp-required'}>*</span></label><select id={'ROLE_ID'} name={'ROLE_ID'} className={['erp-form-control', assignmentErrors.ROLE_ID ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')} value={roleId} required aria-invalid={Boolean(assignmentErrors.ROLE_ID)} aria-describedby={assignmentErrors.ROLE_ID ? 'ROLE_ID-error' : undefined} onChange={changeRole}><option value={''}>--Select Role--</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{assignmentErrors.ROLE_ID && <p id={'ROLE_ID-error'} className={'erp-field-error'}>{assignmentErrors.ROLE_ID}</p>}</div>
          <div className={'erp-role-divider'} />
          <RolePermissionAssignment values={assignmentValues} errors={assignmentErrors} moduleOptions={moduleOptions} menuOptions={menuOptions} permissionOptions={permissionOptions} onChange={changeAssignment} onAdd={add} />
          <RolePermissionTable rows={permissionRows} query={query} onQueryChange={setQuery} onDelete={remove} title={'Permission List'} />
          <div className={'erp-form-actions'}>
            <button type={'button'} className={'secondary-button'} disabled={submitting} onClick={resetStaged}>Reset</button>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </ActionForm>
      </section>
    </div>
  )
}

export default MenuAssignRoleCreate
