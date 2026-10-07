/** @file Active assets and dependent destination references for Asset Transfer. */
import { departmentOptions, reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetAssignments } from '../../asset-assign-employee/data/assetAssignEmployeeStore'
import { assetConditionOptions } from '../../asset-assign-employee/data/assetAssignEmployeeOptions'
import { listAssetReceives } from '../../asset-receive-register/data/assetReceiveRegisterStore'
import { listBulkAssetReceives } from '../../bulk-asset-receive-for-split/data/bulkAssetReceiveStore'
import { listCustodians } from '../../custodian/data/custodianStore'
import { listLocationMasters } from '../../location-master/data/locationMasterStore'

export const transferConditionOptions = [
  ...assetConditionOptions,
  { value: 'LOST', label: 'Lost' },
  { value: 'BEYOND_REPAIR', label: 'Beyond Repair' },
]

function findReceiveRecord(assignment) {
  const records = assignment.ASSET_SOURCE === 'BULK'
    ? listBulkAssetReceives()
    : listAssetReceives()
  return records.find((record) => record.ID === assignment.ASSET_RECEIVE_ID)
}

function currentState(assignment, transfers) {
  const latestTransfer = [...transfers]
    .reverse()
    .find((record) => record.ASSET_ASSIGNMENT_ID === assignment.ID && record.STATUS === '1')
  if (latestTransfer) {
    return {
      custodianId: latestTransfer.TO_CUSTODIAN_ID,
      custodianName: latestTransfer.TO_CUSTODIAN_NAME,
      subCustodianId: latestTransfer.TO_SUB_CUSTODIAN_ID,
      subCustodianName: latestTransfer.TO_SUB_CUSTODIAN_NAME,
      departmentId: latestTransfer.TO_DEPARTMENT_ID,
      departmentName: latestTransfer.TO_DEPARTMENT_NAME,
      locationId: latestTransfer.TO_LOCATION,
      locationName: latestTransfer.TO_LOCATION_NAME,
      building: latestTransfer.TO_BUILDING,
      floor: latestTransfer.TO_FLOOR,
      room: latestTransfer.TO_ROOM,
      assignDate: latestTransfer.TO_ASSIGN_DATE,
      condition: latestTransfer.TO_CONDITION_ON_ISSUE,
      remarks: latestTransfer.TO_REMARKS,
    }
  }

  const receive = findReceiveRecord(assignment)
  const employee = reportingOfficerOptions.find((record) => record.value === assignment.HR_EMPL_ID)
  const department = departmentOptions.find((option) => option.label === employee?.department)
  return {
    custodianId: receive?.CUSTODIAN_ID || '',
    custodianName: receive?.CUSTODIAN_NAME || '',
    subCustodianId: receive?.SUB_CUSTODIAN_ID || '',
    subCustodianName: receive?.SUB_CUSTODIAN_NAME || '',
    departmentId: department?.value || '',
    departmentName: department?.label || employee?.department || '',
    locationId: receive?.LOCATION || '',
    locationName: receive?.LOCATION_NAME || '',
    building: receive?.BUILDING || '',
    floor: receive?.FLOOR || '',
    room: receive?.ROOM || '',
    assignDate: assignment.ASSET_DATE,
    condition: assignment.CONDITION_ON_ISSUE,
    remarks: assignment.REMARKS,
  }
}

export function getAssetTransferReferences(transfers = [], currentTransferId = '') {
  const history = transfers.filter((record) => record.ID !== String(currentTransferId))
  const transferableAssets = listAssetAssignments()
    .filter((record) => record.STATUS === '1' && !record.ACTUAL_RETURN_DATE)
    .map((assignment) => ({
      value: assignment.ID,
      label: `${assignment.ASSET_NO} - ${assignment.ITEM_NAME_LABEL}`,
      assignment,
      current: currentState(assignment, history),
    }))

  return {
    transferableAssets,
    custodians: listCustodians().filter((record) => record.STATUS === '1'),
    locations: listLocationMasters().filter((record) => record.STATUS === '1'),
    departments: departmentOptions,
    conditions: transferConditionOptions,
  }
}

export function getTransferSubCustodians(custodianId, references) {
  return references.custodians
    .find((record) => record.ID === String(custodianId))
    ?.SUB_CUSTODIANS.filter((record) => record.STATUS === '1') ?? []
}

export function getTransferLocations(custodianId, subCustodianId, references) {
  return references.locations.filter((record) => (
    record.CUSTODIAN_ID === String(custodianId)
    && record.SUB_CUSTODIAN_ID === String(subCustodianId)
  ))
}
