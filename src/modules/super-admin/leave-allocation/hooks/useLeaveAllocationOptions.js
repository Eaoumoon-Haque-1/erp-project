/** @file Loads and filters API-backed options used by Leave Allocation forms. */
import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import { employmentTypesApi } from '../../../hris/employment-type/api/employmentTypeApi'
import { leaveTypesApi } from '../../../hris/leave-type/api/leaveTypeApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'

export default function useLeaveAllocationOptions(
  selectedBusinessUnitId,
  { preserveBusinessUnitId = '', preserveEmploymentTypeId = '', preserveLeaveCategoryId = '' } = {},
) {
  const [records, setRecords] = useState({ businessUnits: [], employmentTypes: [], leaveTypes: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      businessUnitsApi.list(),
      employmentTypesApi.list(),
      leaveTypesApi.list(),
    ])
      .then(([businessUnits, employmentTypes, leaveTypes]) => {
        if (active) setRecords({ businessUnits, employmentTypes, leaveTypes })
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Leave Allocation options.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const selectedBusinessUnit = records.businessUnits.find(
    (unit) => String(unit.id) === String(selectedBusinessUnitId),
  )
  const selectedBusinessGroupId = String(selectedBusinessUnit?.bgId ?? '')

  return {
    loading,
    businessUnitOptions: records.businessUnits
      .filter((unit) => String(unit.status ?? 1) === '1' || String(unit.id) === String(preserveBusinessUnitId))
      .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })),
    employmentTypeOptions: records.employmentTypes
      .filter((type) => String(type.status ?? 1) === '1' || String(type.id) === String(preserveEmploymentTypeId))
      .map((type) => ({ value: String(type.id), label: type.typeName })),
    leaveCategoryOptions: records.leaveTypes
      .filter((type) =>
        String(type.bgId) === selectedBusinessGroupId &&
        (String(type.status ?? 1) === '1' || String(type.id) === String(preserveLeaveCategoryId)),
      )
      .map((type) => ({ value: String(type.id), label: type.typeName })),
  }
}
