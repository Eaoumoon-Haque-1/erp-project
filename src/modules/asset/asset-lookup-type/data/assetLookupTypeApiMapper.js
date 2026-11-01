/** @file Converts Asset Lookup Type records between API and form field names. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetLookupTypeFromApi(record = {}) {
  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    TYPE_NAME: record.typeName ?? '',
    CODE: record.typeCode ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_AT: text(record.createdDatetime),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_AT: text(record.updatedDatetime),
  }
}

export function mapAssetLookupTypeToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    typeName: values.TYPE_NAME,
    typeCode: values.CODE,
    status: Number(values.STATUS),
  }
}
