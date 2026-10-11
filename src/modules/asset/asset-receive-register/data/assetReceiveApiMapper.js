/**
 * @file Converts between the Asset Receive API schema (camelCase, numeric ids,
 * yyyy-MM-dd dates) and the UPPER_SNAKE form state (strings), plus tolerant
 * mappers for the reference lists (field names vary between endpoints).
 */
let specSequence = 0

const idToString = (value) => (value === null || value === undefined ? '' : String(value))
const textOf = (value) => (value === null || value === undefined ? '' : String(value))
const pick = (record, keys) => {
  const key = keys.find((name) => record[name] !== undefined && record[name] !== null)
  return key ? record[key] : ''
}

export function createSpecRow(row = {}) {
  specSequence += 1
  return {
    _ROW_ID: `spec-${specSequence}`,
    ID: row.ID ?? '',
    EQUIPMENT_NAME: row.EQUIPMENT_NAME ?? '',
    EQUIPMENT_VALUE: row.EQUIPMENT_VALUE ?? '',
    STATUS: row.STATUS ?? '1',
  }
}

// ---- reference lists (ID/NAME/STATUS, status defaults to active) ----
const named = (record, nameKeys) => ({
  ID: idToString(record.id),
  NAME: textOf(pick(record, nameKeys)),
  STATUS: String(record.status ?? 1),
})

export const mapSupplierRef = (record) => named(record, ['supplierName', 'name'])
export const mapUomRef = (record) => named(record, ['unitName', 'uomName', 'name'])
export const mapLookupTypeRef = (record) => named(record, ['typeName', 'lookupTypeName', 'lookupType', 'name'])
export const mapLookupValueRef = (record) => named(record, ['value', 'lookupValue', 'valueName', 'name'])

export const mapItemRef = (record) => ({
  ...named(record, ['itemName', 'assetItemName', 'name']),
  GROUP_ID: idToString(pick(record, ['itemGroupId', 'groupId'])),
  CATEGORY_ID: idToString(pick(record, ['assetDepriCatId', 'depriCategoryId', 'depriCatId'])),
})

// The category carries the depreciation defaults copied into the form.
export const mapCategoryRef = (record) => ({
  ...named(record, ['categoryName', 'depriCategoryName', 'depriCategory', 'name']),
  METHOD_ID: idToString(pick(record, ['depriMethodId', 'depreciationMethodId', 'methodId'])),
  ASSET_TYPE_ID: idToString(pick(record, ['assetTypeId', 'typeId'])),
  LIFE: idToString(pick(record, ['depriLife', 'depriPeriod', 'depreciationLife', 'usefulLife', 'life'])),
  PERCENTAGE: idToString(pick(record, ['depriPercentage', 'depreciationPercentage', 'rate', 'percentage'])),
  OWNER_ID: idToString(pick(record, ['assetOwnerId', 'ownerId', 'deptId'])),
})

// ---- Asset Receive record ----
function mapWarrantyFromApi(value) {
  const text = String(value ?? '').toLowerCase()
  if (text.includes('warr')) return 'Warranty'
  if (text.includes('guar')) return 'Guaranty'
  return 'N/A'
}

export function mapAssetReceiveFromApi(record = {}) {
  return {
    ID: idToString(record.id),
    BG_ID: idToString(record.bgId),
    BU_ID: idToString(record.buId),
    GRN_NO: textOf(record.grnNo),
    GRN_DATE: textOf(record.grnDate),
    PURCHASE_DATE: textOf(record.purchaseDate),
    PURCHASE_THROUGH: textOf(record.purchaseThrough),
    RECEIVED_BY_ID: idToString(record.receivedById),
    SUPPLIER_ID: idToString(record.supplierId),
    ITEM_NAME_ID: idToString(record.itemNameId),
    ASSET_NO: textOf(record.assetNo),
    REQ_NO: textOf(record.reqNo),
    PO_NO: textOf(record.poNo),
    QTY: idToString(record.qty),
    UOM_ID: idToString(record.uomId),
    UNIT_PRICE: idToString(record.unitPrice),
    DISCOUNT: idToString(record.discount ?? 0),
    VAT_TAX: idToString(record.vatTax ?? 0),
    OTHER_CHARGES: idToString(record.otherCharges ?? 0),
    CURRENCY_ID: idToString(record.currencyId),
    WG_APPLICABLE: mapWarrantyFromApi(record.wgApplicable),
    WG_PERIOD: idToString(record.wgPeriod),
    WG_TYPE_ID: idToString(record.wgTypeId),
    WG_START_DATE: textOf(record.wgStartDate),
    WG_END_DATE: textOf(record.wgEndDate),
    WG_OTHER_INFO: textOf(record.wgOtherInfo),
    CUSTODIAN_ID: idToString(record.custodianId),
    SUB_CUSTODIAN_ID: idToString(record.subCustodianId),
    LOCATION_ID: idToString(record.locationId),
    RAC: textOf(record.rac),
    BIN: textOf(record.bin),
    DEPRI_CATEGORY_ID: idToString(record.depriCategoryId),
    DEPRI_METHOD_ID: idToString(record.depriMethodId),
    ASSET_TYPE_ID: idToString(record.assetTypeId),
    DEPRI_LIFE: idToString(record.depriLife),
    DEPRI_PERCENTAGE: idToString(record.depriPercentage),
    ASSET_OWNER_ID: idToString(record.assetOwnerId),
    REMARKS: textOf(record.remarks),
    STATUS: String(record.status ?? 1),
    CAPITALIZED_COST: idToString(record.capitalizedCost),
    SPECS: (record.specs ?? []).map((row) => ({
      ID: idToString(row.id),
      EQUIPMENT_NAME: textOf(row.equipmentName),
      EQUIPMENT_VALUE: textOf(row.equipmentValue),
      STATUS: String(row.status ?? 1),
    })),
  }
}

const idNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value))
const numberOrNull = (value) => (String(value ?? '').trim() === '' ? null : Number(value))
const textOrNull = (value) => (String(value ?? '').trim() === '' ? null : String(value).trim())

// Server-calculated fields (grnNo, grossAmount, capitalizedCost, building,
// floor, room) are never sent. Empty optional/relaxed values go out as null.
export function mapAssetReceiveToApi(values, rows) {
  return {
    bgId: Number(values.BG_ID),
    buId: Number(values.BU_ID),
    grnDate: textOrNull(values.GRN_DATE),
    purchaseDate: textOrNull(values.PURCHASE_DATE),
    purchaseThrough: textOrNull(values.PURCHASE_THROUGH),
    receivedById: idNumber(values.RECEIVED_BY_ID),
    supplierId: idNumber(values.SUPPLIER_ID),
    itemNameId: idNumber(values.ITEM_NAME_ID),
    assetNo: textOrNull(values.ASSET_NO),
    reqNo: textOrNull(values.REQ_NO),
    poNo: textOrNull(values.PO_NO),
    qty: numberOrNull(values.QTY),
    uomId: idNumber(values.UOM_ID),
    unitPrice: numberOrNull(values.UNIT_PRICE),
    discount: numberOrNull(values.DISCOUNT) ?? 0,
    vatTax: numberOrNull(values.VAT_TAX) ?? 0,
    otherCharges: numberOrNull(values.OTHER_CHARGES) ?? 0,
    currencyId: idNumber(values.CURRENCY_ID),
    wgApplicable: values.WG_APPLICABLE,
    wgPeriod: numberOrNull(values.WG_PERIOD),
    wgTypeId: idNumber(values.WG_TYPE_ID),
    wgStartDate: textOrNull(values.WG_START_DATE),
    wgEndDate: textOrNull(values.WG_END_DATE),
    wgOtherInfo: textOrNull(values.WG_OTHER_INFO),
    custodianId: idNumber(values.CUSTODIAN_ID),
    subCustodianId: idNumber(values.SUB_CUSTODIAN_ID),
    locationId: idNumber(values.LOCATION_ID),
    rac: textOrNull(values.RAC),
    bin: textOrNull(values.BIN),
    depriCategoryId: idNumber(values.DEPRI_CATEGORY_ID),
    depriMethodId: idNumber(values.DEPRI_METHOD_ID),
    assetTypeId: idNumber(values.ASSET_TYPE_ID),
    depriLife: numberOrNull(values.DEPRI_LIFE),
    depriPercentage: numberOrNull(values.DEPRI_PERCENTAGE),
    assetOwnerId: idNumber(values.ASSET_OWNER_ID),
    remarks: textOrNull(values.REMARKS),
    status: Number(values.STATUS),
    specs: rows.map((row) => ({
      id: row.ID ? Number(row.ID) : null,
      equipmentName: row.EQUIPMENT_NAME,
      equipmentValue: row.EQUIPMENT_VALUE,
      status: Number(row.STATUS),
    })),
  }
}
