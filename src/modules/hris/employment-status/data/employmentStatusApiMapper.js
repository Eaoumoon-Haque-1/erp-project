/** @file Converts Employment Status API records to and from form field names. */
const text = (value) => value == null ? '' : String(value)

export function mapEmploymentStatusFromApi(record = {}) {
  return {
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    STATUS_NAME: record.statusName ?? '',
    SHORT_NAME: record.shortName ?? '',
    SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_AT: text(record.createdDatetime),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_AT: text(record.updatedDatetime),
  }
}

export function mapEmploymentStatusToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    statusName: values.STATUS_NAME,
    shortName: values.SHORT_NAME || null,
    sortOrder: values.SORT_ORDER === '' ? null : Number(values.SORT_ORDER),
    status: Number(values.STATUS),
  }
}
