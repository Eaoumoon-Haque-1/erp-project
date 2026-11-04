/** @file Converts Asset Transfer records between backend API and frontend form fields. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetTransferFromApi(record = {}, references = {}) {
  const itemId = text(record.itemId)
  const fromCustodianId = text(record.fromCustodianId)
  const fromSubCustodianId = text(record.fromSubCustodianId)
  const fromDepartmentId = text(record.fromDepartmentId)
  const fromLocationId = text(record.fromLocationId)

  const toCustodianId = text(record.toCustodianId)
  const toSubCustodianId = text(record.toSubCustodianId)
  const toDepartmentId = text(record.toDepartmentId)
  const toLocationId = text(record.toLocationId)

  const assetItem = references.assetItems?.find((i) => String(i.id ?? i.ID) === itemId)
  const fromCust = references.custodians?.find((c) => String(c.id ?? c.ID) === fromCustodianId)
  const fromSub = fromCust?.subCustodians?.find((s) => String(s.id ?? s.ID) === fromSubCustodianId)
  const fromDept = references.departments?.find((d) => String(d.id ?? d.value) === fromDepartmentId)
  const fromLoc = references.locations?.find((l) => String(l.id ?? l.ID) === fromLocationId)

  const toCust = references.custodians?.find((c) => String(c.id ?? c.ID) === toCustodianId)
  const toSub = toCust?.subCustodians?.find((s) => String(s.id ?? s.ID) === toSubCustodianId)
  const toDept = references.departments?.find((d) => String(d.id ?? d.value) === toDepartmentId)
  const toLoc = references.locations?.find((l) => String(l.id ?? l.ID) === toLocationId)

  const itemNameLabel = assetItem
    ? `${assetItem.itemCode ? `${assetItem.itemCode} - ` : ''}${assetItem.itemName || assetItem.ITEM_NAME || ''}`
    : (record.itemName || (itemId ? `Item ${itemId}` : ''))

  return {
    ID: text(record.id),
    id: record.id,
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ITEM_ID: itemId,
    ITEM_NAME_LABEL: itemNameLabel,
    FROM_CUSTODIAN_ID: fromCustodianId,
    FROM_CUSTODIAN_NAME: fromCust?.custodianName || fromCust?.CUSTODIAN_NAME || (fromCustodianId ? `Custodian ${fromCustodianId}` : ''),
    FROM_SUB_CUSTODIAN_ID: fromSubCustodianId,
    FROM_SUB_CUSTODIAN_NAME: fromSub?.subCustodianName || fromSub?.SUB_CUSTODIAN_NAME || (fromSubCustodianId ? `Sub Custodian ${fromSubCustodianId}` : ''),
    FROM_DEPARTMENT_ID: fromDepartmentId,
    FROM_DEPARTMENT_NAME: fromDept?.departmentName || fromDept?.label || (fromDepartmentId ? `Department ${fromDepartmentId}` : ''),
    FROM_LOCATION: fromLocationId,
    FROM_LOCATION_NAME: fromLoc?.locationName || fromLoc?.LOCATION_NAME || (fromLocationId ? `Location ${fromLocationId}` : ''),
    FROM_BUILDING: fromLoc?.building || fromLoc?.BUILDING || '',
    FROM_FLOOR: fromLoc?.floor || fromLoc?.FLOOR || '',
    FROM_ROOM: fromLoc?.room || fromLoc?.ROOM || '',
    FROM_ASSIGN_DATE: text(record.fromAssignDate),
    FROM_CONDITION_ON_ISSUE: text(record.fromConditionOnIssue),
    FROM_REMARKS: text(record.fromRemarks),

    TO_CUSTODIAN_ID: toCustodianId,
    TO_CUSTODIAN_NAME: toCust?.custodianName || toCust?.CUSTODIAN_NAME || (toCustodianId ? `Custodian ${toCustodianId}` : ''),
    TO_SUB_CUSTODIAN_ID: toSubCustodianId,
    TO_SUB_CUSTODIAN_NAME: toSub?.subCustodianName || toSub?.SUB_CUSTODIAN_NAME || (toSubCustodianId ? `Sub Custodian ${toSubCustodianId}` : ''),
    TO_DEPARTMENT_ID: toDepartmentId,
    TO_DEPARTMENT_NAME: toDept?.departmentName || toDept?.label || (toDepartmentId ? `Department ${toDepartmentId}` : ''),
    TO_LOCATION: toLocationId,
    TO_LOCATION_NAME: toLoc?.locationName || toLoc?.LOCATION_NAME || (toLocationId ? `Location ${toLocationId}` : ''),
    TO_BUILDING: toLoc?.building || toLoc?.BUILDING || '',
    TO_FLOOR: toLoc?.floor || toLoc?.FLOOR || '',
    TO_ROOM: toLoc?.room || toLoc?.ROOM || '',
    TO_ASSIGN_DATE: text(record.toAssignDate),
    TO_CONDITION_ON_ISSUE: text(record.toConditionOnIssue),
    TO_REMARKS: text(record.toRemarks),

    STATUS: text(record.status ?? 1),

    // Audit fields
    createdUserId: record.createdUserId,
    createdEmpId: record.createdEmpId,
    createdDatetime: record.createdDatetime,
    createdApp: record.createdApp,
    updatedUserId: record.updatedUserId,
    updatedEmpId: record.updatedEmpId,
    updatedDatetime: record.updatedDatetime,
    updatedApp: record.updatedApp,
    status: record.status,
  }
}

export function mapAssetTransferToApi(values = {}, scope = {}) {
  return {
    ...(values.ID ? { id: nullableNumber(values.ID) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    itemId: nullableNumber(values.ITEM_ID),
    fromCustodianId: nullableNumber(values.FROM_CUSTODIAN_ID),
    fromSubCustodianId: nullableNumber(values.FROM_SUB_CUSTODIAN_ID),
    fromDepartmentId: nullableNumber(values.FROM_DEPARTMENT_ID),
    fromLocationId: nullableNumber(values.FROM_LOCATION),
    fromAssignDate: values.FROM_ASSIGN_DATE || null,
    fromConditionOnIssue: values.FROM_CONDITION_ON_ISSUE || null,
    fromRemarks: values.FROM_REMARKS || '',
    toCustodianId: nullableNumber(values.TO_CUSTODIAN_ID),
    toSubCustodianId: nullableNumber(values.TO_SUB_CUSTODIAN_ID),
    toDepartmentId: nullableNumber(values.TO_DEPARTMENT_ID),
    toLocationId: nullableNumber(values.TO_LOCATION),
    toAssignDate: values.TO_ASSIGN_DATE || null,
    toConditionOnIssue: values.TO_CONDITION_ON_ISSUE || null,
    toRemarks: values.TO_REMARKS || '',
    status: Number(values.STATUS ?? 1),
  }
}

