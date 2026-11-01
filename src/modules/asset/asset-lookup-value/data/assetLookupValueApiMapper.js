/** @file Converts Asset Lookup Value records between API and form field names. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetLookupValueFromApi(record = {}, typeName = '') {
  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    TYPE_ID: text(record.typeId),
    TYPE_NAME: typeName,
    TYPE_CODE: record.typeCode ?? '',
    VALUE: record.value ?? '',
    VALUE_CODE: record.valueCode ?? '',
    SORT_ORDER: text(record.sortOrder),
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_EMP_ID: text(record.createdEmpId),
    CREATED_AT: text(record.createdDatetime),
    CREATED_APP: text(record.createdApp),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_EMP_ID: text(record.updatedEmpId),
    UPDATED_AT: text(record.updatedDatetime),
    UPDATED_APP: text(record.updatedApp),
  }
}

export function mapAssetLookupValueToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    typeId: nullableNumber(values.TYPE_ID),
    value: values.VALUE,
    typeCode: values.TYPE_CODE || values.VALUE_CODE || null,
    valueCode: values.VALUE_CODE || null,
    sortOrder: nullableNumber(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
