/** @file User API-to-form mapping and date conversion. */
function dateOnly(value) {
  return value ? String(value).slice(0, 10) : ''
}

function toDateTime(value) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null
}

export function mapUserFromApi(record = {}, lookups = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(lookups.businessGroupId ?? ''),
    BU_ID: String(record.buId ?? ''),
    USER_NAME: record.userName ?? '',
    FULL_NAME: record.fullName ?? '',
    EMAIL: record.email ?? '',
    MOBILE_NO: record.mobileNo ?? '',
    PASSWORD: '',
    CONFIRM_PASSWORD: '',
    FROM_DATE: dateOnly(record.fromDate),
    TO_DATE: dateOnly(record.toDate),
    ROLE_ID: String(record.roleId ?? ''),
    USER_TYPE_ID: String(record.userTypeId ?? ''),
    ANDROID_ID: String(record.isAndroidFixed ?? 0),
    STATUS: String(record.isActive ?? 1),
    BUSINESS_UNIT_NAME:
      lookups.businessUnits?.get(String(record.buId)) || String(record.buId || ''),
    ROLE_NAME:
      lookups.roles?.get(String(record.roleId)) || String(record.roleId || ''),
    USER_TYPE_NAME:
      lookups.userTypes?.get(String(record.userTypeId)) ||
      String(record.userTypeId || ''),
    DEPARTMENT_NAME: '-',
    API_RECORD: record,
  }
}

export function mapUserToApi(values, originalRecord = {}) {
  const payload = {
    ...originalRecord,
    userName: values.USER_NAME,
    fullName: values.FULL_NAME,
    email: values.EMAIL,
    mobileNo: values.MOBILE_NO,
    fromDate: toDateTime(values.FROM_DATE),
    toDate: toDateTime(values.TO_DATE),
    roleId: Number(values.ROLE_ID),
    userTypeId: Number(values.USER_TYPE_ID),
    buId: values.BU_ID,
    isActive: Number(values.STATUS),
    isAndroidFixed: Number(values.ANDROID_ID),
  }

  if (values.PASSWORD) payload.password = values.PASSWORD
  return payload
}
