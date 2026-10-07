/**
 * @file Temporary in-memory ASSET_DISPOSAL repository.
 * Approved/Completed disposal records deactivate the linked receive record;
 * reverting or deleting that disposal restores availability.
 */
import { getAssetReceive, updateAssetReceive } from '../../asset-receive-register/data/assetReceiveRegisterStore.js'
import { getBulkAssetReceive, updateBulkAssetReceive } from '../../bulk-asset-receive-for-split/data/bulkAssetReceiveStore.js'

let records = []

function getReceive(source, id) {
  return source === 'BULK' ? getBulkAssetReceive(id) : getAssetReceive(id)
}

function updateReceive(source, id, values) {
  return source === 'BULK' ? updateBulkAssetReceive(id, values) : updateAssetReceive(id, values)
}

function syncAsset(source, receiveId) {
  if (!source || !receiveId) return
  const receive = getReceive(source, receiveId)
  if (!receive) return
  const disposed = records.some((record) => (
    record.ASSET_SOURCE === source
    && record.ASSET_RECEIVE_ID === String(receiveId)
    && record.STATUS === '1'
    && ['APPROVED', 'COMPLETED'].includes(record.DISPOSAL_STATUS)
  ))
  updateReceive(source, receiveId, { ...receive, STATUS: disposed ? '0' : '1' })
}

export function listAssetDisposals() {
  return records.map((record) => ({ ...record }))
}

export function getAssetDisposal(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetDisposal(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  syncAsset(record.ASSET_SOURCE, record.ASSET_RECEIVE_ID)
  return { ...record }
}

export function updateAssetDisposal(id, values) {
  const previous = getAssetDisposal(id)
  records = records.map((record) => record.ID === String(id) ? { ...record, ...values } : record)
  if (previous && (previous.ASSET_SOURCE !== values.ASSET_SOURCE || previous.ASSET_RECEIVE_ID !== values.ASSET_RECEIVE_ID)) {
    syncAsset(previous.ASSET_SOURCE, previous.ASSET_RECEIVE_ID)
  }
  syncAsset(values.ASSET_SOURCE, values.ASSET_RECEIVE_ID)
  return getAssetDisposal(id)
}

export function removeAssetDisposal(id) {
  const previous = getAssetDisposal(id)
  records = records.filter((record) => record.ID !== String(id))
  if (previous) syncAsset(previous.ASSET_SOURCE, previous.ASSET_RECEIVE_ID)
}
