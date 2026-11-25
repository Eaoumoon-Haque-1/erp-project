/** @file Converts Unit of Measure records between API and form fields. */
const text = (value) => value == null ? '' : String(value)
const nullableNumber = (value) => value === '' || value == null ? null : Number(value)

export function mapAssetUnitOfMeasureFromApi(record = {}) {
  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    UNIT_NAME: record.unitName ?? '',
    SORT_ORDER: text(record.sortOrder),
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_EMP_ID: text(record.createdEmpId),
    CREATED_AT: text(record.createdDatetime),
    CREATED_APP: record.createdApp ?? '',
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_EMP_ID: text(record.updatedEmpId),
    UPDATED_AT: text(record.updatedDatetime),
    UPDATED_APP: record.updatedApp ?? '',
  }
}

export function mapAssetUnitOfMeasureToApi(values, scope = {}) {
  return {
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    unitName: values.UNIT_NAME,
    sortOrder: nullableNumber(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
