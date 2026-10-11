/** @file Assigns menu permissions to a selected role using the documented role endpoints. */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { menusApi } from '../../create-menu/api/menuApi'
import { modulesApi } from '../../module/api/moduleApi'
import { roleDetailsApi, rolesApi } from '../../role/api/roleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import { runConfirmedAction, showError } from '../../../../components/shared/actionAlerts'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import RolePermissionAssignment from '../../role/components/RolePermissionAssignment'
import RolePermissionTable from '../../role/components/RolePermissionTable'
import { flattenRolePermissions } from '../../role/data/roleApiMapper'
import { initialRoleAssignmentValues, validateRoleAssignment } from '../../role/validation/roleValidation'

const listPath = '/super-admin/role-creation/menu-assign-role'

function MenuAssignRoleCreate() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [roleId, setRoleId] = useState(searchParams.get('roleId') || '')
  const [roleOptions, setRoleOptions] = useState([])
  const [assignmentValues, setAssignmentValues] = useState(initialRoleAssignmentValues)
  const [assignmentErrors, setAssignmentErrors] = useState({})
  const [assignments, setAssignments] = useState([])
  const [moduleOptions, setModuleOptions] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [permissionOptions, setPermissionOptions] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([rolesApi.list(), modulesApi.list()])
      .then(([roles, modules]) => {
        if (!active) return
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setModuleOptions(modules.map((module) => ({ value: String(module.id), label: module.moduleName })))
      })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load assignment options.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!roleId) return
    let active = true
    rolesApi.getDetails(roleId)
      .then((details) => { if (active) setAssignments(flattenRolePermissions(details)) })
      .catch((error) => { if (active) getApiErrorMessage(error, 'Unable to load assigned permissions.') })
    return () => { active = false }
  }, [roleId])

  const reloadAssignments = async () => setAssignments(flattenRolePermissions(await rolesApi.getDetails(roleId)))

  const changeRole = (event) => {
    const value = event.target.value
    setRoleId(value); setSearchParams(value ? { roleId: value } : {}); setAssignmentValues(initialRoleAssignmentValues); setAssignmentErrors({}); setMenuOptions([]); setPermissionOptions([])
  }

  const changeAssignment = async (event) => {
    const { name, value } = event.target
    setAssignmentValues((current) => ({ ...current, [name]: value, ...(name === 'MODULE_ID' ? { MENU_ID: '', PERMISSION_ID: '' } : {}), ...(name === 'MENU_ID' ? { PERMISSION_ID: '' } : {}) }))
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }))
    try {
      if (name === 'MODULE_ID') {
        setMenuOptions(value ? (await menusApi.listByModule(value)).map((menu) => ({ value: String(menu.id), label: menu.menuName })) : [])
        setPermissionOptions([])
      } else if (name === 'MENU_ID') {
        setPermissionOptions(value && roleId ? (await rolesApi.getAvailablePermissions(roleId, assignmentValues.MODULE_ID, value)).map((permission) => ({ value: String(permission.id), label: permission.permissionName })) : [])
      }
    } catch (error) { getApiErrorMessage(error, 'Unable to load permission options.') }
  }

  const add = async (event) => {
    event.preventDefault()
    if (!roleId) { await showError('Select a Role first.'); return }
    const result = validateRoleAssignment(assignmentValues, assignments)
    setAssignmentValues(result.values); setAssignmentErrors(result.errors)
    if (!result.isValid) return
    try {
      await rolesApi.assignPermissions(roleId, { moduleId: Number(result.values.MODULE_ID), menuId: Number(result.values.MENU_ID), permissionIds: [Number(result.values.PERMISSION_ID)] })
      await reloadAssignments(); setAssignmentValues(initialRoleAssignmentValues); setMenuOptions([]); setPermissionOptions([])
    } catch (error) { getApiErrorMessage(error, 'Unable to assign permission.') }
  }

  const remove = async (row) => {
    await runConfirmedAction(
      { action: 'delete', entityName: 'Permission', successText: 'Permission removed successfully.' },
      async () => {
        try { await roleDetailsApi.removePermission(row.ROLE_DETAIL_ID, row.PERMISSION_ID); await reloadAssignments() }
        catch (error) { getApiErrorMessage(error, 'Unable to remove permission.'); return false }
        return true
      },
    )
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Menu Assign to Role Create'} actionLabel={'List'} actionTo={listPath} />
      <section className={'erp-form-card erp-role-edit-card'}>
        <div className={'max-w-md'}><label className={'erp-field-label'} htmlFor={'ROLE_ID'}>Role Name<span className={'erp-required'}>*</span></label><select id={'ROLE_ID'} className={'erp-form-control'} value={roleId} onChange={changeRole}><option value={''}>--Select Role--</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        <div className={'erp-role-divider'} />
        <ActionForm entityName={'Permission assignment'} onSubmit={add} noValidate><RolePermissionAssignment values={assignmentValues} errors={assignmentErrors} moduleOptions={moduleOptions} menuOptions={menuOptions} permissionOptions={permissionOptions} onChange={changeAssignment} /></ActionForm>
        <RolePermissionTable rows={assignments} query={query} onQueryChange={setQuery} onDelete={remove} />
      </section>
    </div>
  )
}

export default MenuAssignRoleCreate
