/** @file Permission API-to-form field mapping. */
export function mapPermissionFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    PERMISSION_NAME: record.permissionName ?? '',
    MODULE_ID: String(record.moduleId ?? ''),
    STATUS: String(record.isActive ?? record.status ?? 1),
  }
}

export function mapPermissionToApi(values) {
  return {
    permissionName: values.PERMISSION_NAME,
    moduleId: Number(values.MODULE_ID),
    isActive: Number(values.STATUS),
    status: Number(values.STATUS),
  }
}
