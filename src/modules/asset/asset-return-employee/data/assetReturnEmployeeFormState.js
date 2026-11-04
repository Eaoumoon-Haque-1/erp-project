/** @file Selection-driven field population for Asset Return from Employee. */
export function updateAssetReturnField(current, name, value, references) {
  if (name !== 'ASSET_ASSIGNMENT_ID') return { ...current, [name]: value }

  const option = references.assignedAssets?.find((opt) => String(opt.value) === String(value))
  const assignment = option?.assignment

  return {
    ...current,
    ASSET_ASSIGNMENT_ID: value,
    ITEM_ID: assignment?.ITEM_ID || '',
    ITEM_NAME_LABEL: assignment?.ITEM_NAME_LABEL || '',
    HR_EMPL_ID: assignment?.HR_EMPL_ID || '',
    EMPLOYEE_NAME: assignment?.EMPLOYEE_NAME || '',
    EMPLOYEE_ID: assignment?.EMPLOYEE_ID || '',
    ASSET_DATE: assignment?.ASSET_DATE || '',
    EXPECTED_RETURN_DATE: assignment?.EXPECTED_RETURN_DATE || '',
  }
}
