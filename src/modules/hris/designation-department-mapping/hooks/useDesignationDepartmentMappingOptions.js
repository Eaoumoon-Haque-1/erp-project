/** @file Loads and derives API-backed options for Department–Designation mapping forms. */
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import { departmentGroupsApi } from '../../department-group/api/departmentGroupApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationGroupsApi } from '../../designation-group/api/designationGroupApi'
import { designationsApi } from '../../designation/api/designationApi'

export default function useDesignationDepartmentMappingOptions(values, preserve = {}) {
  const [records, setRecords] = useState({
    departments: [],
    departmentGroups: [],
    designations: [],
    designationGroups: [],
  })
  const [optionsLoading, setOptionsLoading] = useState(true)

  useEffect(() => {
    if (!values.BG_ID || !values.BU_ID) return undefined

    let active = true
    Promise.all([
      departmentsApi.list(values.BG_ID),
      departmentGroupsApi.list(),
      designationsApi.list(values.BG_ID),
      designationGroupsApi.list(),
    ])
      .then(([departments, departmentGroups, designations, designationGroups]) => {
        if (active) setRecords({ departments, departmentGroups, designations, designationGroups })
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Department and Designation options.')
      })
      .finally(() => { if (active) setOptionsLoading(false) })
    return () => { active = false }
  }, [values.BG_ID, values.BU_ID])

  const departmentOptions = useMemo(() => {
    const eligibleIds = new Set(records.departmentGroups
      .filter((row) => String(row.buId) === String(values.BU_ID) && (String(row.status ?? 1) === '1' || String(row.deptId) === String(preserve.DEPT_ID)))
      .map((row) => String(row.deptId)))
    return records.departments
      .filter((row) => String(row.bgId) === String(values.BG_ID) && eligibleIds.has(String(row.id)) && (String(row.status ?? 1) === '1' || String(row.id) === String(preserve.DEPT_ID)))
      .map((row) => ({ value: String(row.id), label: row.departmentName }))
  }, [preserve.DEPT_ID, records.departmentGroups, records.departments, values.BG_ID, values.BU_ID])

  const designationOptions = useMemo(() => {
    const eligibleIds = new Set(records.designationGroups
      .filter((row) => String(row.buId) === String(values.BU_ID) && (String(row.status ?? 1) === '1' || String(row.desigId) === String(preserve.DESIG_ID)))
      .map((row) => String(row.desigId)))
    return records.designations
      .filter((row) => String(row.bgId) === String(values.BG_ID) && eligibleIds.has(String(row.id)) && (String(row.status ?? 1) === '1' || String(row.id) === String(preserve.DESIG_ID)))
      .map((row) => ({ value: String(row.id), label: row.designationName }))
  }, [preserve.DESIG_ID, records.designationGroups, records.designations, values.BG_ID, values.BU_ID])

  return { departmentOptions, designationOptions, optionsLoading }
}
