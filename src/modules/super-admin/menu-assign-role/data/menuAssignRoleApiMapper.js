/** @file Maps RoleDetail records to the Menu Assign to Role list/view model. */
function parsePermissionIds(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  const text = String(value ?? '').trim()
  if (!text) return []
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {
      return []
    }
  }
  return text.split(',').map((id) => id.trim()).filter(Boolean)
}

export function buildRoleDetailLookups({ roles = [], modules = [], menus = [], permissions = [] }) {
  return {
    roles: new Map(roles.map((role) => [String(role.id), role.roleName])),
    modules: new Map(modules.map((module) => [String(module.id), module.moduleName])),
    menus: new Map(menus.map((menu) => [String(menu.id), menu.menuName])),
    permissions: new Map(permissions.map((permission) => [String(permission.id), permission.permissionName])),
  }
}

export function mapRoleDetailFromApi(record = {}, lookups = {}) {
  const permissionIds = parsePermissionIds(record.permissionId)
  return {
    ID: String(record.id ?? ''),
    ROLE_ID: String(record.roleId ?? ''),
    ROLE_NAME: lookups.roles?.get(String(record.roleId)) || String(record.roleId ?? ''),
    MODULE_ID: String(record.moduleId ?? ''),
    MODULE_NAME: lookups.modules?.get(String(record.moduleId)) || String(record.moduleId ?? ''),
    MENU_ID: String(record.menuId ?? ''),
    MENU_NAME: lookups.menus?.get(String(record.menuId)) || String(record.menuId ?? ''),
    PERMISSION_IDS: permissionIds,
    PERMISSION_NAME: permissionIds
      .map((id) => lookups.permissions?.get(id) || id)
      .join(', '),
    STATUS: String(record.status ?? 1),
    API_RECORD: record,
  }
}
