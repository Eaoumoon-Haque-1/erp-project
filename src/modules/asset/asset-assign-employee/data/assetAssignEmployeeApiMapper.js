/** @file Converts Asset Assignment records between backend API and frontend form fields. */
const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

export function mapAssetAssignmentFromApi(record = {}, references = {}) {
  const itemId = text(record.itemId)
  const emplId = text(record.emplId)

  const assetItem = references.assetItems?.find((item) => String(item.id ?? item.ID) === itemId)
  const employee = references.employees?.find((emp) => String(emp.id ?? emp.ID ?? emp.value) === emplId)

  const itemNameLabel = assetItem
    ? `${assetItem.itemCode ? `${assetItem.itemCode} - ` : ''}${assetItem.itemName || assetItem.ITEM_NAME || ''}`
    : (record.itemName || (itemId ? `Item ${itemId}` : ''))

  const employeeNameLabel = employee
    ? `${employee.employeeCode ? `${employee.employeeCode} - ` : ''}${employee.employeeName || employee.name || ''}`
    : (record.employeeName || (emplId ? `Employee ${emplId}` : ''))

  return {
    ID: text(record.id),
    id: record.id,
    BG_ID: text(record.bgId),
    BU_ID: text(record.buId),
    ASSET_DATE: text(record.assetDate),
    ITEM_ID: itemId,
    ITEM_NAME_LABEL: itemNameLabel,
    HR_EMPL_ID: emplId,
    EMPLOYEE_NAME: employeeNameLabel,
    CONDITION_ON_ISSUE: text(record.conditionOnIssue),
    EXPECTED_RETURN_DATE: text(record.expectedReturnDate),
    ACTUAL_RETURN_DATE: text(record.actualReturnDate),
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

export function mapAssetAssignmentToApi(values = {}, scope = {}) {
  return {
    ...(values.ID ? { id: nullableNumber(values.ID) } : {}),
    bgId: nullableNumber(scope.bgId ?? values.BG_ID),
    buId: nullableNumber(scope.buId ?? values.BU_ID),
    assetDate: values.ASSET_DATE || null,
    itemId: nullableNumber(values.ITEM_ID),
    emplId: nullableNumber(values.HR_EMPL_ID),
    conditionOnIssue: values.CONDITION_ON_ISSUE || null,
    expectedReturnDate: values.EXPECTED_RETURN_DATE || null,
    actualReturnDate: values.ACTUAL_RETURN_DATE || null,
    remarks: values.REMARKS || '',
    status: Number(values.STATUS ?? 1),
  }
}

