/** @file Selection-driven field population for Asset Return from Employee. */
export function updateAssetReturnField(current, name, value, references) {
  if (name !== 'ASSET_ASSIGNMENT_ID') return { ...current, [name]: value }

  const assignment = references.assignedAssets.find((option) => option.value === value)?.assignment
  const employee = references.employees.find((record) => record.value === assignment?.HR_EMPL_ID)
  return {
    ...current,
    ASSET_ASSIGNMENT_ID: value,
    ASSET_RECORD_ID: assignment?.ASSET_RECORD_ID || '',
    ASSET_NO: assignment?.ASSET_NO || '',
    ITEM_NAME: assignment?.ITEM_NAME || '',
    ITEM_NAME_LABEL: assignment?.ITEM_NAME_LABEL || '',
    HR_EMPL_ID: assignment?.HR_EMPL_ID || '',
    EMPLOYEE_NAME: assignment?.EMPLOYEE_NAME || employee?.name || '',
    EMPLOYEE_ID: employee?.employeeId || '',
    ASSET_DATE: assignment?.ASSET_DATE || '',
    EXPECTED_RETURN_DATE: assignment?.EXPECTED_RETURN_DATE || '',
  }
}
