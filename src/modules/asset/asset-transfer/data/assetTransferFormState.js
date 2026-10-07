/** @file Cross-field population and dependency resets for Asset Transfer. */
export function updateAssetTransferField(current, name, value, references) {
  let next = { ...current, [name]: value }

  if (name === 'ASSET_ASSIGNMENT_ID') {
    const option = references.transferableAssets.find((record) => record.value === value)
    const assignment = option?.assignment
    const source = option?.current
    next = {
      ...next,
      ASSET_ASSIGNMENT_ID: value,
      ASSET_RECORD_ID: assignment?.ASSET_RECORD_ID || '', ASSET_NO: assignment?.ASSET_NO || '',
      ITEM_NAME: assignment?.ITEM_NAME || '', ITEM_NAME_LABEL: assignment?.ITEM_NAME_LABEL || '',
      FROM_CUSTODIAN_ID: source?.custodianId || '', FROM_CUSTODIAN_NAME: source?.custodianName || '',
      FROM_SUB_CUSTODIAN_ID: source?.subCustodianId || '', FROM_SUB_CUSTODIAN_NAME: source?.subCustodianName || '',
      FROM_DEPARTMENT_ID: source?.departmentId || '', FROM_DEPARTMENT_NAME: source?.departmentName || '',
      FROM_LOCATION: source?.locationId || '', FROM_LOCATION_NAME: source?.locationName || '',
      FROM_BUILDING: source?.building || '', FROM_FLOOR: source?.floor || '', FROM_ROOM: source?.room || '',
      FROM_ASSIGN_DATE: source?.assignDate || '', FROM_CONDITION_ON_ISSUE: source?.condition || '', FROM_REMARKS: source?.remarks || '',
      TO_CONDITION_ON_ISSUE: source?.condition || '',
    }
  }

  if (name === 'TO_CUSTODIAN_ID') {
    next = { ...next, TO_CUSTODIAN_NAME: references.custodians.find((record) => record.ID === value)?.CUSTODIAN_NAME || '', TO_SUB_CUSTODIAN_ID: '', TO_SUB_CUSTODIAN_NAME: '', TO_LOCATION: '', TO_LOCATION_NAME: '', TO_BUILDING: '', TO_FLOOR: '', TO_ROOM: '' }
  }
  if (name === 'TO_SUB_CUSTODIAN_ID') {
    const custodian = references.custodians.find((record) => record.ID === current.TO_CUSTODIAN_ID)
    next = { ...next, TO_SUB_CUSTODIAN_NAME: custodian?.SUB_CUSTODIANS.find((record) => record.ID === value)?.SUB_CUSTODIAN_NAME || '', TO_LOCATION: '', TO_LOCATION_NAME: '', TO_BUILDING: '', TO_FLOOR: '', TO_ROOM: '' }
  }
  if (name === 'TO_DEPARTMENT_ID') next.TO_DEPARTMENT_NAME = references.departments.find((option) => option.value === value)?.label || ''
  if (name === 'TO_LOCATION') {
    const location = references.locations.find((record) => record.ID === value)
    next = { ...next, TO_LOCATION_NAME: location?.LOCATION_NAME || '', TO_BUILDING: location?.BUILDING || '', TO_FLOOR: location?.FLOOR || '', TO_ROOM: location?.ROOM || '' }
  }
  return next
}
