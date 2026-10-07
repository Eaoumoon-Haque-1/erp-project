/** @file Role API mapping and grouped-permission response flattening. */
export function mapRoleFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    PERMISSION_NAME: record.roleName ?? '',
    STATUS: String(record.isActive ?? record.status ?? 1),
  }
}

export function mapRoleToApi(values) {
  return {
    roleName: values.PERMISSION_NAME,
    isActive: Number(values.STATUS),
    status: Number(values.STATUS),
  }
}

export function flattenRolePermissions(response = {}) {
  return (response.assignedPermissions || []).flatMap((group) =>
    (group.permissions || []).map((permission) => ({
      ID: `${group.id}-${permission.id}`,
      ROLE_DETAIL_ID: String(group.id),
      MODULE_ID: String(group.moduleId),
      MODULE_NAME: group.moduleName,
      MENU_ID: String(group.menuId),
      MENU_NAME: group.menuName,
      PERMISSION_ID: String(permission.id),
      PERMISSION_NAME: permission.permissionName,
    })),
  )
}
