/** @file Cross-field population and dependency resets for Asset Transfer. */
export function updateAssetTransferField(current, name, value, references) {
  const next = { ...current, [name]: value }

  if (name === 'ITEM_ID') {
    const item = references.assetItems?.find((r) => String(r.id) === String(value))
    next.ITEM_ID = value
    next.ITEM_NAME_LABEL = item?.label || ''
  }

  if (name === 'TO_CUSTODIAN_ID') {
    const custodian = references.custodians?.find((r) => String(r.id) === String(value))
    next.TO_CUSTODIAN_ID = value
    next.TO_CUSTODIAN_NAME = custodian?.custodianName || custodian?.label || ''
    next.TO_SUB_CUSTODIAN_ID = ''
    next.TO_SUB_CUSTODIAN_NAME = ''
    next.TO_LOCATION = ''
    next.TO_LOCATION_NAME = ''
    next.TO_BUILDING = ''
    next.TO_FLOOR = ''
    next.TO_ROOM = ''
  }

  if (name === 'TO_SUB_CUSTODIAN_ID') {
    const custodian = references.custodians?.find((r) => String(r.id) === String(current.TO_CUSTODIAN_ID))
    const sub = (custodian?.subCustodians || []).find((s) => String(s.id) === String(value))
    next.TO_SUB_CUSTODIAN_ID = value
    next.TO_SUB_CUSTODIAN_NAME = sub?.subCustodianName || sub?.label || ''
    next.TO_LOCATION = ''
    next.TO_LOCATION_NAME = ''
    next.TO_BUILDING = ''
    next.TO_FLOOR = ''
    next.TO_ROOM = ''
  }

  if (name === 'TO_DEPARTMENT_ID') {
    const dept = references.departments?.find((d) => String(d.id) === String(value))
    next.TO_DEPARTMENT_ID = value
    next.TO_DEPARTMENT_NAME = dept?.departmentName || dept?.label || ''
  }

  if (name === 'TO_LOCATION') {
    const loc = references.locations?.find((l) => String(l.id) === String(value))
    next.TO_LOCATION = value
    next.TO_LOCATION_NAME = loc?.locationName || loc?.label || ''
    next.TO_BUILDING = loc?.building || ''
    next.TO_FLOOR = loc?.floor || ''
    next.TO_ROOM = loc?.room || ''
  }

  return next
}

export function applyCurrentAssetTransferState(current, sourceRecord, references) {
  if (!sourceRecord) return current

  const fromCustId = String(sourceRecord.toCustodianId || sourceRecord.fromCustodianId || '')
  const fromSubCustId = String(sourceRecord.toSubCustodianId || sourceRecord.fromSubCustodianId || '')
  const fromDeptId = String(sourceRecord.toDepartmentId || sourceRecord.fromDepartmentId || '')
  const fromLocId = String(sourceRecord.toLocationId || sourceRecord.fromLocationId || '')

  const cust = references.custodians?.find((c) => String(c.id) === fromCustId)
  const sub = (cust?.subCustodians || []).find((s) => String(s.id) === fromSubCustId)
  const dept = references.departments?.find((d) => String(d.id) === fromDeptId)
  const loc = references.locations?.find((l) => String(l.id) === fromLocId)

  return {
    ...current,
    FROM_CUSTODIAN_ID: fromCustId,
    FROM_CUSTODIAN_NAME: cust?.custodianName || cust?.label || '',
    FROM_SUB_CUSTODIAN_ID: fromSubCustId,
    FROM_SUB_CUSTODIAN_NAME: sub?.subCustodianName || sub?.label || '',
    FROM_DEPARTMENT_ID: fromDeptId,
    FROM_DEPARTMENT_NAME: dept?.departmentName || dept?.label || '',
    FROM_LOCATION: fromLocId,
    FROM_LOCATION_NAME: loc?.locationName || loc?.label || '',
    FROM_BUILDING: loc?.building || '',
    FROM_FLOOR: loc?.floor || '',
    FROM_ROOM: loc?.room || '',
    FROM_ASSIGN_DATE: sourceRecord.toAssignDate || sourceRecord.fromAssignDate || '',
    FROM_CONDITION_ON_ISSUE: sourceRecord.toConditionOnIssue || sourceRecord.fromConditionOnIssue || '',
    FROM_REMARKS: sourceRecord.toRemarks || sourceRecord.fromRemarks || '',
    TO_CONDITION_ON_ISSUE: sourceRecord.toConditionOnIssue || sourceRecord.fromConditionOnIssue || current.TO_CONDITION_ON_ISSUE || '',
  }
}
