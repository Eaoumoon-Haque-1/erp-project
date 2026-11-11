/**
 * @file Data mapper for Item Master and Attribute Details between API and UI state.
 */
import { createDefaultAttributeRow } from '../validation/itemValidation'

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

export function csvToArray(val) {
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean)
  if (!val || typeof val !== 'string') return []
  return val.split(',').map((s) => s.trim()).filter(Boolean)
}

export function arrayToCsv(val) {
  if (Array.isArray(val)) {
    const cleaned = val.map(String).map((s) => s.trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned.join(',') : null
  }
  if (typeof val === 'string' && val.trim()) return val.trim()
  return null
}

export function mapItemDetailFromApi(detail = {}, attributeMap = new Map()) {
  if (!detail) return null

  const attrIdStr = detail.attributeId != null ? String(detail.attributeId) : ''
  const attrName =
    detail.attributeName || (attrIdStr ? attributeMap.get(attrIdStr) : '') || ''

  return createDefaultAttributeRow({
    ID: detail.id != null ? String(detail.id) : '',
    ATTRIBUTE_ID: attrIdStr,
    ATTRIBUTE_NAME: attrName,
    PRICE: detail.price != null ? String(detail.price) : '',
    OPENING_STOCK: detail.openingStock != null ? String(detail.openingStock) : '',
    STATUS: detail.status !== undefined && detail.status !== null ? String(detail.status) : '1',
  })
}

export function mapItemFromApi(
  item = {},
  userNames = new Map(),
  employeeNames = new Map(),
  categoryMap = new Map(),
  brandMap = new Map(),
  uomMap = new Map(),
  storeMap = new Map(),
  attributeMap = new Map(),
) {
  if (!item) return null

  const createdUserId =
    item.createdUserId ?? item.createdByUserId ?? item.CREATED_USER_ID ?? ''
  const createdEmpId =
    item.createdEmpId ?? item.createdEmployeeId ?? item.CREATED_EMP_ID ?? ''
  const updatedUserId =
    item.updatedUserId ?? item.updatedByUserId ?? item.UPDATED_USER_ID ?? ''
  const updatedEmpId =
    item.updatedEmpId ?? item.updatedEmployeeId ?? item.UPDATED_EMP_ID ?? ''

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    item.createdEmployeeCode ?? item.createdEmpCode ?? item.CREATED_EMPLOYEE_CODE,
    item.createdEmployeeName ?? item.createdEmpName ?? item.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    item.updatedEmployeeCode ?? item.updatedEmpCode ?? item.UPDATED_EMPLOYEE_CODE,
    item.updatedEmployeeName ?? item.updatedEmpName ?? item.UPDATED_EMPLOYEE_NAME,
  )

  const createdUserName = resolveAuditActor(
    createdUserId,
    item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
    userNames,
  )
  const createdEmpName = resolveAuditActor(
    createdEmpId,
    directCreatedEmpDisplay,
    employeeNames,
  )
  const updatedUserName = resolveAuditActor(
    updatedUserId,
    item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
    userNames,
  )
  const updatedEmpName = resolveAuditActor(
    updatedEmpId,
    directUpdatedEmpDisplay,
    employeeNames,
  )

  const createdDatetime =
    item.createdDatetime ??
    item.createdDateTime ??
    item.createdAt ??
    item.CREATED_DATETIME ??
    ''
  const updatedDatetime =
    item.updatedDatetime ??
    item.updatedDateTime ??
    item.updatedAt ??
    item.UPDATED_DATETIME ??
    ''

  const createdApp = item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '-'
  const updatedApp = item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '-'
  const statusStr = item.status !== undefined && item.status !== null ? String(item.status) : '1'

  const catIdStr = item.categoryId != null ? String(item.categoryId) : ''
  const catDisplay = item.categoryName || (catIdStr ? categoryMap.get(catIdStr) : '') || ''

  const brandIdStr = item.brandId != null ? String(item.brandId) : ''
  const brandDisplay = item.brandName || (brandIdStr ? brandMap.get(brandIdStr) : '') || ''

  const uomIdStr = item.uomId != null ? String(item.uomId) : ''
  const uomDisplay = item.uomName || (uomIdStr ? uomMap.get(uomIdStr) : '') || ''

  const storeIds = Array.isArray(item.storeIds)
    ? item.storeIds.map(String)
    : csvToArray(item.storeId)
  const resolvedStoreNames = storeIds
    .map((id) => storeMap.get(String(id)))
    .filter(Boolean)
  const storeDisplay =
    item.storeName ||
    (Array.isArray(item.storeNames) && item.storeNames.length > 0
      ? item.storeNames.join(', ')
      : '') ||
    (resolvedStoreNames.length > 0 ? resolvedStoreNames.join(', ') : '') ||
    ''

  const isWarranty =
    item.isWarrantyApplicable != null ? String(item.isWarrantyApplicable) : '0'

  const attributeDetails = Array.isArray(item.attributeDetails)
    ? item.attributeDetails.map((dtl) => mapItemDetailFromApi(dtl, attributeMap))
    : []

  return {
    ID: item.id != null ? String(item.id) : '',
    BG_ID: item.bgId != null ? String(item.bgId) : '',
    BU_ID: item.buId != null ? String(item.buId) : '',
    GROUP_NAME: item.groupName || item.businessGroupName || item.GROUP_NAME || '',
    BUSINESS_UNIT: item.businessUnitName || item.businessUnit || item.BUSINESS_UNIT || '',
    ITEM_NAME: item.itemName || '',
    ITEM_CODE: item.itemCode || '',
    CATEGORY_ID: catIdStr,
    CATEGORY_NAME: catDisplay,
    BRAND_ID: brandIdStr,
    BRAND_NAME: brandDisplay,
    UOM_ID: uomIdStr,
    UOM_NAME: uomDisplay,
    STORE_ID: storeIds,
    STORE_NAME: storeDisplay,
    ITEM_IMAGE: item.itemImage || '',
    IS_WARRANTY_APPLICABLE: isWarranty,
    WARRANTY_DAY: item.warrantyDay != null ? String(item.warrantyDay) : '',
    WARRANTY_CRITERIA: item.warrantyCriteria || '',
    STATUS: statusStr,

    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: createdUserName,
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: createdEmpName,
    CREATED_DATETIME: createdDatetime,
    CREATED_APP: createdApp,
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: updatedUserName,
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: updatedEmpName,
    UPDATED_DATETIME: updatedDatetime,
    UPDATED_APP: updatedApp,

    AUDIT_LOG: {
      CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
      CREATED_USER_NAME: createdUserName,
      CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
      CREATED_EMP_NAME: createdEmpName,
      CREATED_DATETIME: createdDatetime,
      CREATED_APP: createdApp,
      UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
      UPDATED_USER_NAME: updatedUserName,
      UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
      UPDATED_EMP_NAME: updatedEmpName,
      UPDATED_DATETIME: updatedDatetime,
      UPDATED_APP: updatedApp,
      STATUS: statusStr,
    },
    ATTRIBUTE_DETAILS: attributeDetails,
    API_RECORD: item,
  }
}

export function mapItemToApi(values, rows = [], original = null) {
  const isWarranty = String(values.IS_WARRANTY_APPLICABLE) === '1' ? 1 : 0
  const warrantyDay =
    isWarranty === 1 && values.WARRANTY_DAY !== '' && values.WARRANTY_DAY != null
      ? Number(values.WARRANTY_DAY)
      : null

  const attributeDetails = rows.map((r) => ({
    id: r.ID ? Number(r.ID) : null,
    attributeId: r.ATTRIBUTE_ID ? Number(r.ATTRIBUTE_ID) : null,
    price: r.PRICE !== '' && r.PRICE != null ? Number(r.PRICE) : null,
    openingStock:
      r.OPENING_STOCK !== '' && r.OPENING_STOCK != null
        ? Number(r.OPENING_STOCK)
        : null,
    status: r.STATUS != null ? Number(r.STATUS) : 1,
  }))

  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : original?.bgId || null,
    buId: values.BU_ID ? Number(values.BU_ID) : original?.buId || null,
    itemName: values.ITEM_NAME ? String(values.ITEM_NAME).trim() : '',
    itemCode: values.ITEM_CODE ? String(values.ITEM_CODE).trim() : null,
    categoryId: values.CATEGORY_ID ? Number(values.CATEGORY_ID) : null,
    brandId: values.BRAND_ID ? Number(values.BRAND_ID) : null,
    uomId: values.UOM_ID ? Number(values.UOM_ID) : null,
    storeId: arrayToCsv(values.STORE_ID),
    itemImage: values.ITEM_IMAGE ? String(values.ITEM_IMAGE) : null,
    isWarrantyApplicable: isWarranty,
    warrantyDay,
    warrantyCriteria: values.WARRANTY_CRITERIA ? String(values.WARRANTY_CRITERIA).trim() : null,
    status: values.STATUS != null ? Number(values.STATUS) : 1,
    attributeDetails,
  }
}

