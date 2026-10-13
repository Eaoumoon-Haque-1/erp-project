/** @file Module API-to-form field mapping. */
export function mapModuleFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    MODULE_NAME: record.moduleName ?? '',
    STATUS: String(record.status ?? 1),
  }
}

export function mapModuleToApi(values) {
  return {
    moduleName: values.MODULE_NAME,
    status: Number(values.STATUS),
  }
}
