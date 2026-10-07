/** @file Module API-to-form field mapping. */
export function mapModuleFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    MODULE_NAME: record.moduleName ?? '',
    STATUS: String(record.isActive ?? record.status ?? 1),
  }
}

export function mapModuleToApi(values) {
  return {
    moduleName: values.MODULE_NAME,
    isActive: Number(values.STATUS),
    status: Number(values.STATUS),
  }
}
