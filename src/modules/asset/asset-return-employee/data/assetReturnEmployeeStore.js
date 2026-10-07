/**
 * @file Temporary in-memory ASSET_ITEM_RETURN repository.
 * Saving or removing an active return synchronizes ACTUAL_RETURN_DATE on the
 * linked assignment, which controls whether the asset is currently available.
 */
import { getAssetAssignment, updateAssetAssignment } from '../../asset-assign-employee/data/assetAssignEmployeeStore.js'

let records = []

function syncAssignment(assignmentId) {
  const assignment = getAssetAssignment(assignmentId)
  if (!assignment) return
  const activeReturn = [...records].reverse().find((record) => (
    record.ASSET_ASSIGNMENT_ID === String(assignmentId) && record.STATUS === '1'
  ))
  updateAssetAssignment(assignmentId, {
    ...assignment,
    ACTUAL_RETURN_DATE: activeReturn?.ACTUAL_RETURN_DATE || '',
  })
}

export function listAssetReturns() {
  return records.map((record) => ({ ...record }))
}

export function getAssetReturn(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetReturn(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  syncAssignment(record.ASSET_ASSIGNMENT_ID)
  return { ...record }
}

export function updateAssetReturn(id, values) {
  const previous = getAssetReturn(id)
  records = records.map((record) => (
    record.ID === String(id) ? { ...record, ...values } : record
  ))
  if (previous?.ASSET_ASSIGNMENT_ID !== values.ASSET_ASSIGNMENT_ID) syncAssignment(previous?.ASSET_ASSIGNMENT_ID)
  syncAssignment(values.ASSET_ASSIGNMENT_ID)
  return getAssetReturn(id)
}

export function removeAssetReturn(id) {
  const previous = getAssetReturn(id)
  records = records.filter((record) => record.ID !== String(id))
  syncAssignment(previous?.ASSET_ASSIGNMENT_ID)
}
