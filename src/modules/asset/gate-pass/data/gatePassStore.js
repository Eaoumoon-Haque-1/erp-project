/**
 * @file Temporary in-memory repository for ASSET_GATE_PASS and ASSET_GATE_PASS_DTLS.
 * Replace this boundary when Gate Pass endpoints become available.
 */
let records = []

function cloneRecord(record) {
  if (!record) return null
  return { ...record, ITEMS: record.ITEMS.map((row) => ({ ...row })) }
}

export function listGatePasses() {
  return records.map(cloneRecord)
}

export function getGatePass(id) {
  return cloneRecord(records.find((record) => record.ID === String(id)))
}

export function generateGatePassNo() {
  const year = new Date().getFullYear()
  const prefix = `GP-${year}-`
  const nextSequence = records.reduce((highest, record) => {
    if (!record.GATE_PASS_NO.startsWith(prefix)) return highest
    const sequence = Number(record.GATE_PASS_NO.slice(prefix.length))
    return Number.isInteger(sequence) ? Math.max(highest, sequence) : highest
  }, 0) + 1
  return `${prefix}${String(nextSequence).padStart(5, '0')}`
}

export function createGatePass(values) {
  const id = String(Date.now())
  const record = {
    ID: id,
    ...values,
    ITEMS: values.ITEMS.map((row, index) => ({ ...row, ID: row.ID || `${id}-${index + 1}`, GATE_PASS_ID: id })),
  }
  records = [...records, record]
  return cloneRecord(record)
}

export function updateGatePass(id, values) {
  const normalizedId = String(id)
  records = records.map((record) => record.ID === normalizedId ? {
    ...record,
    ...values,
    ITEMS: values.ITEMS.map((row, index) => ({ ...row, ID: row.ID || `${normalizedId}-${index + 1}`, GATE_PASS_ID: normalizedId })),
  } : record)
  return getGatePass(normalizedId)
}

export function removeGatePass(id) {
  records = records.filter((record) => record.ID !== String(id))
}
