/** Common value selectors used by API record presentation. */
export const getRecordStatus = (record) => record.isActive ?? record.status ?? 0
