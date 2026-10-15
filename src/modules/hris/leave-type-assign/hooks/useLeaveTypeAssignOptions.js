/** @file Loads Business Group, Business Unit, and Leave Type options for assignment forms. */
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { leaveTypesApi } from '../../leave-type/api/leaveTypeApi'

export default function useLeaveTypeAssignOptions(values, preserve = {}) {
  const businessOptions = useBusinessOptions(values.BG_ID, {
    preserveGroupId: preserve.BG_ID,
    preserveUnitId: preserve.BU_ID,
  })
  const [leaveTypes, setLeaveTypes] = useState([])
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(true)

  useEffect(() => {
    let active = true
    leaveTypesApi.list()
      .then((records) => { if (active) setLeaveTypes(records) })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Leave Types.')
      })
      .finally(() => { if (active) setLeaveTypesLoading(false) })
    return () => { active = false }
  }, [])

  const leaveTypeOptions = useMemo(() => leaveTypes
    .filter((record) =>
      String(record.bgId) === String(values.BG_ID) &&
      (String(record.status ?? 1) === '1' || String(record.id) === String(preserve.LEAVE_TYPE_ID)))
    .map((record) => ({ value: String(record.id), label: record.typeName })), [leaveTypes, preserve.LEAVE_TYPE_ID, values.BG_ID])

  return { ...businessOptions, leaveTypeOptions, leaveTypesLoading }
}
