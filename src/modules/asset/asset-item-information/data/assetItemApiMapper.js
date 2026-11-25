/** @file Converts Asset Item and Asset Item Set records between API and form field names. */
import { createInitialAssetItemSetRow } from '../validation/assetItemInformationValidation'

const text = (value) => (value == null ? '' : String(value))
const nullableNumber = (value) => (value === '' || value == null ? null : Number(value))

function resolveAuditActor(id, directDisplay, lookupMap) {
  if (directDisplay) return String(directDisplay)
  if (id == null || id === '') return ''
  const key = String(id)
  return lookupMap?.get?.(key) || key
}

function formatEmployeeAuditDisplay(code, name) {
  const cleanCode = String(code ?? '').trim()
  const cleanName = String(name ?? '').trim()
  if (cleanCode && cleanName) return `${cleanCode}: ${cleanName}`
  return cleanCode || cleanName || ''
}

export function mapAssetItemSetRowFromApi(row = {}, index = 1, parent = {}) {
  const id = text(row.id ?? row.ID)
  return createInitialAssetItemSetRow(
    {
      _ROW_ID: id ? `item-set-row-${id}` : row._ROW_ID,
      ID: id,
      BG_ID: text(row.bgId ?? row.BG_ID ?? parent.bgId ?? parent.BG_ID),
      BU_ID: text(row.buId ?? row.BU_ID ?? parent.buId ?? parent.BU_ID),
      ITEM_ID: text(row.itemId ?? row.ITEM_ID ?? parent.id ?? parent.ID),
      ITEM_NAME: row.itemName ?? row.ITEM_NAME ?? '',
      ITEM_DETAILS: row.itemDetails ?? row.ITEM_DETAILS ?? '',
      SORT_ORDER: text(row.sortOrder ?? row.SORT_ORDER ?? index),
      STATUS: text(row.status ?? row.STATUS ?? 1),
      CREATED_USER_ID: text(row.createdUserId ?? row.CREATED_USER_ID),
      CREATED_EMP_ID: text(row.createdEmpId ?? row.CREATED_EMP_ID),
      CREATED_DATETIME: text(row.createdDatetime ?? row.CREATED_DATETIME),
      UPDATED_USER_ID: text(row.updatedUserId ?? row.UPDATED_USER_ID),
      UPDATED_EMP_ID: text(row.updatedEmpId ?? row.UPDATED_EMP_ID),
      UPDATED_DATETIME: text(row.updatedDatetime ?? row.UPDATED_DATETIME),
      CREATED_APP: text(row.createdApp ?? row.CREATED_APP),
      UPDATED_APP: text(row.updatedApp ?? row.UPDATED_APP),
    },
    index,
  )
}

export function mapAssetItemFromApi(
  record = {},
  references = {},
  userNames = new Map(),
  employeeNames = new Map(),
  groupMap = new Map(),
  unitMap = new Map(),
) {
  const groupId = text(record.itemGroupId)
  const categoryId = text(record.assetDepriCatId)
  const uomId = text(record.uomId)
  const bgId = text(record.bgId)
  const buId = text(record.buId)
  const group = references.assetGroups?.find((item) => item.ID === groupId)
  const category = references.depreciationCategories?.find((item) => item.ID === categoryId)
  const uom = references.uomOptions?.find((item) => item.value === uomId)

  const rawPieceOrSet = String(
    record.itemPieceOrSet ?? record.ITEM_PIECE_OR_SET ?? '',
  ).trim()
  const rawSetList =
    record.itemSets ??
    record.assetItemSets ??
    record.ITEM_SETS ??
    record.ASSET_ITEM_SETS ??
    []
  const mappedSets = Array.isArray(rawSetList)
    ? [...rawSetList]
        .sort(
          (a, b) =>
            Number(a.sortOrder ?? a.SORT_ORDER ?? 0) -
            Number(b.sortOrder ?? b.SORT_ORDER ?? 0),
        )
        .map((row, idx) =>
          mapAssetItemSetRowFromApi(row, idx + 1, {
            id: record.id,
            bgId,
            buId,
          }),
        )
        .map((row, idx) => ({ ...row, SORT_ORDER: String(idx + 1) }))
    : []

  const pieceOrSet =
    rawPieceOrSet.toLowerCase() === 'set' ||
    (!rawPieceOrSet && mappedSets.length > 0)
      ? 'Set'
      : 'Piece'

  const createdUserId = text(record.createdUserId ?? record.CREATED_USER_ID ?? record.CREATED_BY)
  const createdEmpId = text(record.createdEmpId ?? record.CREATED_EMP_ID)
  const updatedUserId = text(record.updatedUserId ?? record.UPDATED_USER_ID ?? record.UPDATED_BY)
  const updatedEmpId = text(record.updatedEmpId ?? record.UPDATED_EMP_ID)

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    record.createdEmployeeCode ?? record.createdEmpCode,
    record.createdEmployeeName ?? record.createdEmpName,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    record.updatedEmployeeCode ?? record.updatedEmpCode,
    record.updatedEmployeeName ?? record.updatedEmpName,
  )

  return {
    ID: text(record.id),
    BG_ID: bgId,
    BU_ID: buId,
    GROUP_NAME: groupMap?.get?.(bgId) || record.groupName || record.GROUP_NAME || '',
    BUSINESS_UNIT: unitMap?.get?.(buId) || record.businessUnit || record.BUSINESS_UNIT || '',
    ITEM_NAME: record.itemName ?? '',
    ITEM_GROUP: groupId,
    ITEM_GROUP_NAME: record.itemGroupName ?? group?.ASSET_GROUP ?? '',
    ITEM_PIECE_OR_SET: pieceOrSet,
    ITEM_SETS: mappedSets,
    ASSET_DEPRI_CATE_ID: categoryId,
    DEPRI_CATEGORY_NAME: record.depriCategoryName ?? category?.DEPRI_CATEGORY ?? '',
    CATEGORY_TYPE: record.assetTypeName ?? category?.ASSET_TYPE_NAME ?? '',
    DEPRI_METHOD: record.depriMethodName ?? category?.DEPRI_METHOD_NAME ?? '',
    DEPRI_LIFE: text(record.depriLife ?? category?.DEPRI_LIFE ?? ''),
    DEPRI_PERCENTAGE: text(record.depriPercentage ?? category?.DEPRI_PERCENTAGE ?? ''),
    UOM: uomId,
    UOM_NAME: record.uomName ?? uom?.label ?? '',
    ASSET_OWNER: record.assetOwnerName ?? category?.ASSET_OWNER_NAME ?? group?.ASSET_OWNER_NAME ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: createdUserId,
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME: resolveAuditActor(createdUserId, record.createdUserName, userNames),
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME: resolveAuditActor(createdEmpId, directCreatedEmpDisplay, employeeNames),
    CREATED_AT: text(record.createdDatetime ?? record.createdAt ?? record.CREATED_AT),
    CREATED_DATETIME: text(record.createdDatetime ?? record.createdAt ?? record.CREATED_AT),
    CREATED_APP: text(record.createdApp ?? record.CREATED_APP ?? ''),
    UPDATED_BY: updatedUserId,
    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME: resolveAuditActor(updatedUserId, record.updatedUserName, userNames),
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME: resolveAuditActor(updatedEmpId, directUpdatedEmpDisplay, employeeNames),
    UPDATED_AT: text(record.updatedDatetime ?? record.updatedAt ?? record.UPDATED_AT),
    UPDATED_DATETIME: text(record.updatedDatetime ?? record.updatedAt ?? record.UPDATED_AT),
    UPDATED_APP: text(record.updatedApp ?? record.UPDATED_APP ?? ''),
  }
}

export function mapAssetItemToApi(values, scope = {}, setRows = []) {
  const bgId = nullableNumber(scope.bgId ?? values.BG_ID)
  const buId = nullableNumber(scope.buId ?? values.BU_ID)
  const itemPieceOrSet = values.ITEM_PIECE_OR_SET === 'Set' ? 'Set' : 'Piece'
  const itemId = nullableNumber(values.ID)

  const itemSets =
    itemPieceOrSet === 'Set' && Array.isArray(setRows)
      ? setRows.map((row, index) => ({
          id: nullableNumber(row.ID),
          bgId: nullableNumber(row.BG_ID) ?? bgId,
          buId: nullableNumber(row.BU_ID) ?? buId,
          itemId: nullableNumber(row.ITEM_ID) ?? itemId,
          itemName: String(row.ITEM_NAME ?? '').trim(),
          itemDetails: String(row.ITEM_DETAILS ?? '').trim(),
          sortOrder: Number(row.SORT_ORDER || index + 1),
          status: Number(row.STATUS ?? 1),
        }))
      : []

  return {
    bgId,
    buId,
    itemName: values.ITEM_NAME,
    itemGroupId: nullableNumber(values.ITEM_GROUP),
    itemPieceOrSet,
    assetDepriCatId: nullableNumber(values.ASSET_DEPRI_CATE_ID),
    uomId: nullableNumber(values.UOM),
    status: Number(values.STATUS),
    itemSets,
    assetItemSets: itemSets,
  }
}
