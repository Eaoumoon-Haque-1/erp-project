/** Shared Sort Order rules used by create forms across the application. */
export function getNextSortOrder(records = []) {
  const highest = records.reduce((maximum, record) => {
    const value = Number(record?.sortOrder ?? record?.SORT_ORDER)
    return Number.isFinite(value) && value > maximum ? value : maximum
  }, 0)

  return String(Math.floor(highest) + 1)
}
