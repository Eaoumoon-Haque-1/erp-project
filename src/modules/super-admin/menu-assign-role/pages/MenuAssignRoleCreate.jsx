/** @file Assigns menu permissions to a selected role using the documented role endpoints. */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { menusApi, modulesApi, roleDetailsApi, rolesApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
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
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([rolesApi.list(), modulesApi.list()])
      .then(([roles, modules]) => {
        if (!active) return
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setModuleOptions(modules.map((module) => ({ value: String(module.id), label: module.moduleName })))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load assignment options.')) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!roleId) return
    let active = true
    rolesApi.getDetails(roleId)
      .then((details) => { if (active) setAssignments(flattenRolePermissions(details)) })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load assigned permissions.')) })
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
    } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to load permission options.')) }
  }

  const add = async (event) => {
    event.preventDefault()
    if (!roleId) { setMessage('Select a Role first.'); return }
    const result = validateRoleAssignment(assignmentValues, assignments)
    setAssignmentValues(result.values); setAssignmentErrors(result.errors)
    if (!result.isValid) return
    try {
      await rolesApi.assignPermissions(roleId, { moduleId: Number(result.values.MODULE_ID), menuId: Number(result.values.MENU_ID), permissionIds: [Number(result.values.PERMISSION_ID)] })
      await reloadAssignments(); setAssignmentValues(initialRoleAssignmentValues); setMenuOptions([]); setPermissionOptions([]); setMessage('Permission assigned successfully.')
    } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to assign permission.')) }
  }

  const remove = async (row) => {
    if (!window.confirm(`Remove "${row.PERMISSION_NAME}" permission?`)) return
    try { await roleDetailsApi.removePermission(row.ROLE_DETAIL_ID, row.PERMISSION_ID); await reloadAssignments(); setMessage('Permission removed successfully.') }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to remove permission.')) }
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Menu Assign to Role Create'} actionLabel={'List'} actionTo={listPath} />
      <section className={'erp-form-card erp-role-edit-card'}>
        {message && <p className={'erp-form-message'} role={'status'}>{message}</p>}
        <div className={'max-w-md'}><label className={'erp-field-label'} htmlFor={'ROLE_ID'}>Role Name<span className={'erp-required'}>*</span></label><select id={'ROLE_ID'} className={'erp-form-control'} value={roleId} onChange={changeRole}><option value={''}>--Select Role--</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        <div className={'erp-role-divider'} />
        <form onSubmit={add} noValidate><RolePermissionAssignment values={assignmentValues} errors={assignmentErrors} moduleOptions={moduleOptions} menuOptions={menuOptions} permissionOptions={permissionOptions} onChange={changeAssignment} /></form>
        <RolePermissionTable rows={assignments} query={query} onQueryChange={setQuery} onDelete={remove} />
      </section>
    </div>
  )
}

export default MenuAssignRoleCreate
