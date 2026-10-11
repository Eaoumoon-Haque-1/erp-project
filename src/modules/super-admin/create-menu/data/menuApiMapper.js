/** @file Menu API-to-form field mapping. */
export function parsePermissionIds(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return String(value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export function mapMenuFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    MENU_NAME: record.menuName ?? '',
    MODULE_ID: String(record.moduleId ?? ''),
    IS_PARENT: String(record.isParent ?? 0),
    PARENT_MENU_ID: record.parentMenuId == null ? '' : String(record.parentMenuId),
    IS_TOP_MENU: String(record.isTopMenu ?? 0),
    PERMISSION_ID: parsePermissionIds(record.permissionIds ?? record.permissionId),
    ROUTE_NAME: record.routeName ?? '',
    SORT_ORDER: String(record.sortOrder ?? ''),
    STATUS: String(record.isActive ?? record.status ?? 1),
  }
}

export function mapMenuToApi(values) {
  return {
    menuName: values.MENU_NAME,
    moduleId: values.MODULE_ID ? Number(values.MODULE_ID) : null,
    isParent: Number(values.IS_PARENT),
    parentMenuId: values.PARENT_MENU_ID
      ? Number(values.PARENT_MENU_ID)
      : null,
    isTopMenu: Number(values.IS_TOP_MENU),
    permissionId: parsePermissionIds(values.PERMISSION_ID).join(',') || null,
    routeName: values.ROUTE_NAME,
    sortOrder: values.SORT_ORDER,
    isActive: Number(values.STATUS),
    status: Number(values.STATUS),
  }
}
