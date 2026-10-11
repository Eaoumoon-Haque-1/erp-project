/**
 * @file Dropdown option builders for Asset Receive. Only active records are
 * offered, but the currently selected value is always kept so an edit page can
 * still display it (label from loaded data, or "Inactive" if not found).
 */
function buildOptions(records, selectedId, getLabel, loading) {
  const options = records
    .filter((record) => record.STATUS === '1')
    .map((record) => ({ value: record.ID, label: getLabel(record) }))
  const selected = String(selectedId ?? '')

  if (selected && !loading && !options.some((option) => option.value === selected)) {
    const found = records.find((record) => record.ID === selected)
    options.push({ value: selected, label: found ? getLabel(found) : 'Inactive' })
  }
  return options
}

const byName = (record) => record.NAME

export function buildAssetReceiveOptions(refs, values) {
  const { loading } = refs
  const item = refs.items.find((record) => record.ID === values.ITEM_NAME_ID)
  const custodian = refs.custodians.find((record) => record.ID === values.CUSTODIAN_ID)
  // The backend rejects a category other than the item's: offer only that one.
  const itemCategories = item?.CATEGORY_ID
    ? refs.categories.filter((record) => record.ID === item.CATEGORY_ID)
    : []

  return {
    supplier: buildOptions(refs.suppliers, values.SUPPLIER_ID, byName, loading),
    item: buildOptions(refs.items, values.ITEM_NAME_ID, byName, loading),
    uom: buildOptions(refs.uoms, values.UOM_ID, byName, loading),
    currency: buildOptions(refs.currencies, values.CURRENCY_ID, byName, loading),
    warrantyType: buildOptions(refs.warrantyTypes, values.WG_TYPE_ID, byName, loading),
    method: buildOptions(refs.lookupValues, values.DEPRI_METHOD_ID, byName, loading),
    assetType: buildOptions(refs.lookupValues, values.ASSET_TYPE_ID, byName, loading),
    custodian: buildOptions(refs.custodians, values.CUSTODIAN_ID, (record) => record.CUSTODIAN_NAME, loading),
    subCustodian: buildOptions(custodian?.SUB_CUSTODIANS ?? [], values.SUB_CUSTODIAN_ID, (row) => row.SUB_CUSTODIAN_NAME, loading),
    location: buildOptions(
      refs.locations.filter((record) => (
        record.CUSTODIAN_ID === values.CUSTODIAN_ID && record.SUB_CUSTODIAN_ID === values.SUB_CUSTODIAN_ID
      )),
      values.LOCATION_ID,
      (record) => record.LOCATION_NAME,
      loading,
    ),
    category: buildOptions(
      itemCategories.length > 0 ? itemCategories : refs.categories,
      values.DEPRI_CATEGORY_ID,
      byName,
      loading,
    ),
    owner: buildOptions(refs.departments, values.ASSET_OWNER_ID, byName, loading),
  }
}

// Building/Floor/Room come from the selected location and are display only.
export const findSelectedLocation = (refs, locationId) =>
  refs.locations.find((record) => record.ID === locationId)
