/** @file Pure helpers for the frontend Employee assignment history rows. */
export function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function previousDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)
  return localDateString(date)
}

export function applyUserStatusToEmployeeRows(rows, userStatus) {
  if (rows.length === 0) return rows
  const today = localDateString()

  return rows.map((row) => {
    if (row.IS_CURRENT !== '1') return row
    return userStatus === '0'
      ? { ...row, ACTIVE_TO: today, STATUS: '0' }
      : { ...row, ACTIVE_TO: '', STATUS: '1' }
  })
}

export function closeCurrentEmployee(rows, nextBusinessUnitId = '') {
  const today = localDateString()
  return rows.map((row) => (
    row.IS_CURRENT === '1'
    && (!nextBusinessUnitId || row.BU_ID !== nextBusinessUnitId)
      ? { ...row, IS_CURRENT: '0', ACTIVE_TO: today, STATUS: '0' }
      : row
  ))
}

export function addEmployeeHistoryRow(rows, row, userStatus) {
  const activeFrom = localDateString()
  return [
    ...rows.map((employee) => employee.IS_CURRENT === '1'
      ? {
        ...employee,
        IS_CURRENT: '0',
        ACTIVE_TO: previousDate(activeFrom),
        STATUS: '0',
      }
      : employee),
    {
      ...row,
      IS_CURRENT: '1',
      ACTIVE_FROM: activeFrom,
      ACTIVE_TO: userStatus === '1' ? '' : activeFrom,
      STATUS: userStatus === '1' ? '1' : '0',
    },
  ]
}
