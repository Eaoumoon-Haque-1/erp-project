/** @file Converts Asset Return records between backend API and frontend form fields. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetReturnFromApi(record = {}, references = {}) {
  const assignId = text(record.assignId)
  const itemId = text(record.itemId)
  const emplId = text(record.emplId)

  const assetItem = references.assetItems?.find((item) => String(item.id ?? item.ID) === itemId)
  const employee = references.employees?.find((emp) => String(emp.id ?? emp.ID ?? emp.value) === emplId)
  const assignment = references.assignedAssets?.find((opt) => String(opt.value ?? opt.id) === assignId)?.assignment

  const itemNameLabel = assetItem
    ? `${assetItem.itemCode ? `${assetItem.itemCode} - ` : ''}${assetItem.itemName || assetItem.ITEM_NAME || ''}`
    : (assignment?.ITEM_NAME_LABEL || (itemId ? `Item ${itemId}` : ''))

  const employeeNameLabel = employee
    ? `${employee.employeeCode ? `${employee.employeeCode} - ` : ''}${employee.employeeName || employee.name || ''}`
    : (assignment?.EMPLOYEE_NAME || (emplId ? `Employee ${emplId}` : ''))

  return {
    ID: text(record.id),
    id: record.id,
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ASSET_ASSIGNMENT_ID: assignId,
    ITEM_ID: itemId,
    ITEM_NAME_LABEL: itemNameLabel,
    HR_EMPL_ID: emplId,
    EMPLOYEE_NAME: employeeNameLabel,
    ASSET_DATE: text(record.assetDate),
    EXPECTED_RETURN_DATE: text(record.expectedReturnDate),
    ACTUAL_RETURN_DATE: text(record.actualReturnDate),
    CONDITION_ON_RETURN: text(record.conditionOnReturn),
    REMARKS: text(record.remarks),
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

export function mapAssetReturnToApi(values = {}, scope = {}) {
  return {
    ...(values.ID ? { id: nullableNumber(values.ID) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    assignId: nullableNumber(values.ASSET_ASSIGNMENT_ID),
    assetDate: values.ASSET_DATE || null,
    itemId: nullableNumber(values.ITEM_ID),
    emplId: nullableNumber(values.HR_EMPL_ID),
    expectedReturnDate: values.EXPECTED_RETURN_DATE || null,
    actualReturnDate: values.ACTUAL_RETURN_DATE || null,
    conditionOnReturn: values.CONDITION_ON_RETURN || null,
    remarks: values.REMARKS || '',
    status: Number(values.STATUS ?? 1),
  }
}

