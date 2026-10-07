/**
 * @file Temporary in-memory ASSET_REPAIR repository.
 * An active repair remains open until Delivery Date and temporarily disables
 * the linked received asset. Completing/reverting the repair resynchronizes it.
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
  const hasOpenRepair = records.some((record) => (
    record.ASSET_SOURCE === source
    && record.ASSET_RECEIVE_ID === String(receiveId)
    && record.STATUS === '1'
    && !record.DELIVERY_DATE
  ))
  updateReceive(source, receiveId, { ...receive, STATUS: hasOpenRepair ? '0' : '1' })
}

export function listAssetRepairs() {
  return records.map((record) => ({ ...record }))
}

export function getAssetRepair(id) {
  const record = records.find((item) => item.ID === String(id))
  return record ? { ...record } : null
}

export function createAssetRepair(values) {
  const record = { ID: String(Date.now()), ...values }
  records = [...records, record]
  syncAsset(record.ASSET_SOURCE, record.ASSET_RECEIVE_ID)
  return { ...record }
}

export function updateAssetRepair(id, values) {
  const previous = getAssetRepair(id)
  records = records.map((record) => record.ID === String(id) ? { ...record, ...values } : record)
  if (previous && (previous.ASSET_SOURCE !== values.ASSET_SOURCE || previous.ASSET_RECEIVE_ID !== values.ASSET_RECEIVE_ID)) syncAsset(previous.ASSET_SOURCE, previous.ASSET_RECEIVE_ID)
  syncAsset(values.ASSET_SOURCE, values.ASSET_RECEIVE_ID)
  return getAssetRepair(id)
}

export function removeAssetRepair(id) {
  const previous = getAssetRepair(id)
  records = records.filter((record) => record.ID !== String(id))
  if (previous) syncAsset(previous.ASSET_SOURCE, previous.ASSET_RECEIVE_ID)
}
