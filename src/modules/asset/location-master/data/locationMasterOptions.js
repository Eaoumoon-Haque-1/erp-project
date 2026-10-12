/**
 * @file Dropdown option builders for Location Master. Only active records are
 * offered, but the currently saved selection is always kept so an edit page
 * can still display it (label from loaded data, or "Inactive" if not found).
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

export const buildCustodianOptions = (custodians, selectedId, loading) =>
  buildOptions(custodians, selectedId, (record) => record.CUSTODIAN_NAME, loading)

export function buildSubCustodianOptions(custodians, custodianId, selectedId, loading) {
  const custodian = custodians.find((record) => record.ID === String(custodianId))
  return buildOptions(custodian?.SUB_CUSTODIANS ?? [], selectedId, (row) => row.SUB_CUSTODIAN_NAME, loading)
}

export const buildDepartmentOptions = (departments, selectedId, loading) =>
  buildOptions(departments, selectedId, (record) => record.NAME, loading)
