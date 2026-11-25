/** @file Asset Item and Asset Item Set (ASSET_ITEM_SET) endpoint contract. */
import { readAuthSession } from '../../../../api/authStorage'
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-items'
const itemSetStorageKey = 'cloud_erp_asset_item_sets_v1'

function readLocalItemSetsStore() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(itemSetStorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocalItemSetsStore(store) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(itemSetStorageKey, JSON.stringify(store))
  } catch {
    // ignore storage quota errors
  }
}

function enrichRecordWithItemSets(record) {
  if (!record || record.id == null) return record
  const store = readLocalItemSetsStore()
  const stored = store[String(record.id)]
  if (!stored) return record

  const hasBackendPieceOrSet =
    record.itemPieceOrSet != null || record.ITEM_PIECE_OR_SET != null
  const hasBackendSets =
    Array.isArray(record.itemSets) ||
    Array.isArray(record.assetItemSets) ||
    Array.isArray(record.ITEM_SETS)

  return {
    ...record,
    itemPieceOrSet: hasBackendPieceOrSet
      ? record.itemPieceOrSet ?? record.ITEM_PIECE_OR_SET
      : stored.itemPieceOrSet || 'Piece',
    itemSets: hasBackendSets
      ? record.itemSets ?? record.assetItemSets ?? record.ITEM_SETS
      : stored.itemSets || [],
  }
}

function saveLocalItemSets(itemId, payload, existingRecord = {}) {
  if (itemId == null) return
  const store = readLocalItemSetsStore()
  const key = String(itemId)
  const prevEntry = store[key] || {}
  const prevById = new Map(
    (prevEntry.itemSets || []).map((r) => [String(r.id), r]),
  )

  const session = readAuthSession() || {}
  const nowIso = new Date().toISOString()
  const actorUserId = session.userId ?? existingRecord.updatedUserId ?? existingRecord.createdUserId ?? null
  const actorEmpId = session.userEmpId ?? existingRecord.updatedEmpId ?? existingRecord.createdEmpId ?? null

  const pieceOrSet = payload?.itemPieceOrSet === 'Set' ? 'Set' : 'Piece'
  const rawSets =
    pieceOrSet === 'Set' && Array.isArray(payload?.itemSets)
      ? payload.itemSets
      : []

  let nextIdCounter = Date.now()
  const persistedSets = rawSets.map((row, idx) => {
    const existingRow = row.id != null ? prevById.get(String(row.id)) : null
    const rowId = existingRow?.id ?? row.id ?? nextIdCounter++
    return {
      id: rowId,
      bgId: row.bgId ?? payload.bgId ?? existingRecord.bgId ?? null,
      buId: row.buId ?? payload.buId ?? existingRecord.buId ?? null,
      itemId: Number(itemId),
      itemName: String(row.itemName ?? '').trim(),
      itemDetails: String(row.itemDetails ?? '').trim(),
      sortOrder: Number(row.sortOrder || idx + 1),
      status: Number(row.status ?? 1),
      createdUserId: existingRow?.createdUserId ?? actorUserId,
      createdEmpId: existingRow?.createdEmpId ?? actorEmpId,
      createdDatetime: existingRow?.createdDatetime ?? nowIso,
      createdApp: existingRow?.createdApp ?? 'Web',
      updatedUserId: existingRow ? actorUserId : existingRow?.updatedUserId ?? null,
      updatedEmpId: existingRow ? actorEmpId : existingRow?.updatedEmpId ?? null,
      updatedDatetime: existingRow ? nowIso : existingRow?.updatedDatetime ?? null,
      updatedApp: existingRow ? 'Web' : existingRow?.updatedApp ?? '',
    }
  })

  store[key] = {
    itemPieceOrSet: pieceOrSet,
    itemSets: persistedSets,
  }
  writeLocalItemSetsStore(store)
}

function removeLocalItemSets(itemId) {
  if (itemId == null) return
  const store = readLocalItemSetsStore()
  delete store[String(itemId)]
  writeLocalItemSetsStore(store)
}

const baseCrud = createCrudApi(resourcePath)

export const assetItemsApi = {
  ...baseCrud,
  list: async (buId) => {
    const list = await unwrapApiResponse(
      apiClient.get(resourcePath, {
        params: buId ? { buId } : undefined,
      }),
    )
    return Array.isArray(list) ? list.map(enrichRecordWithItemSets) : []
  },
  get: async (id) => {
    const record = await baseCrud.get(id)
    return enrichRecordWithItemSets(record)
  },
  create: async (payload) => {
    const created = await baseCrud.create(payload)
    if (created?.id != null) {
      saveLocalItemSets(created.id, payload, created)
    }
    return enrichRecordWithItemSets(created)
  },
  update: async (id, payload) => {
    const updated = await baseCrud.update(id, payload)
    if (payload?.itemPieceOrSet !== undefined || payload?.itemSets !== undefined) {
      saveLocalItemSets(id, payload, updated)
    }
    return enrichRecordWithItemSets(updated)
  },
  remove: async (id) => {
    const res = await baseCrud.remove(id)
    removeLocalItemSets(id)
    return res
  },
}
