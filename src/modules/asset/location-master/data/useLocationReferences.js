/**
 * @file Loads reference data for Location Master: custodians and departments.
 * Strictly scopes data to the provided `buId` and `groupId` from the logged-in user's session.
 * For departments, it checks HR_DEPT_GROUP (DepartmentGroup) to ensure only departments
 * mapped to the user's Business Group (bgId) and Business Unit (buId) are offered.
 */
import { useEffect, useState } from 'react'
import { custodiansApi } from '../../../../api/custodian'
import { departmentsApi } from '../../../../api/department'
import { getApiErrorMessage } from '../../../../api/errors'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { mapCustodianFromApi } from '../../custodian/data/custodianApiMapper'
import { mapDepartmentFromApi } from './locationMasterApiMapper'

export default function useLocationReferences({ buId = '', groupId = '' } = {}) {
  const targetBuId = String(buId ?? '').trim()
  const [resolvedGroupId, setResolvedGroupId] = useState(String(groupId ?? '').trim())
  const [loadedCustodians, setLoadedCustodians] = useState({ key: null, records: [] })
  const [loadedDepartments, setLoadedDepartments] = useState({ key: null, records: [] })
  const [custodiansLoading, setCustodiansLoading] = useState(false)
  const [departmentsLoading, setDepartmentsLoading] = useState(false)

  // 1. If groupId is not supplied but buId is known, resolve bgId from Business Unit API
  useEffect(() => {
    if (groupId) {
      setResolvedGroupId(String(groupId).trim())
    } else if (targetBuId) {
      let active = true
      businessUnitsApi
        .get(targetBuId)
        .then((bu) => {
          if (active && bu?.bgId) {
            setResolvedGroupId(String(bu.bgId).trim())
          }
        })
        .catch(() => {})
      return () => {
        active = false
      }
    }
  }, [groupId, targetBuId])

  // 2. Fetch Custodians strictly filtered by targetBuId and resolvedGroupId
  useEffect(() => {
    if (!targetBuId) {
      setLoadedCustodians({ key: '', records: [] })
      setCustodiansLoading(false)
      return undefined
    }

    let active = true
    setCustodiansLoading(true)

    custodiansApi
      .list(targetBuId)
      .then((records) => {
        if (!active) return
        const mapped = (records || []).map((r) => mapCustodianFromApi(r))
        // Extra safeguard: ensure records strictly match targetBuId and resolvedGroupId (if resolved)
        const filtered = mapped.filter((c) => {
          const matchBu = String(c.BU_ID) === targetBuId
          const matchBg = resolvedGroupId ? String(c.BG_ID) === resolvedGroupId : true
          return matchBu && matchBg
        })
        setLoadedCustodians({ key: `${targetBuId}-${resolvedGroupId}`, records: filtered })
      })
      .catch((error) => {
        if (!active) return
        setLoadedCustodians({ key: targetBuId, records: [] })
        getApiErrorMessage(error, 'Unable to load Custodians.')
      })
      .finally(() => {
        if (active) setCustodiansLoading(false)
      })

    return () => {
      active = false
    }
  }, [targetBuId, resolvedGroupId])

  // 3. Fetch Departments strictly mapped to BG_ID and BU_ID via HR_DEPT_GROUP (DepartmentGroup)
  useEffect(() => {
    if (!targetBuId && !resolvedGroupId) {
      setLoadedDepartments({ key: '', records: [] })
      setDepartmentsLoading(false)
      return undefined
    }

    let active = true
    setDepartmentsLoading(true)

    Promise.allSettled([
      resolvedGroupId
        ? departmentsApi.listByGroup(Number(resolvedGroupId))
        : departmentsApi.list(),
      departmentGroupsApi.list(),
    ])
      .then(([deptRes, groupRes]) => {
        if (!active) return

        const depts =
          deptRes.status === 'fulfilled' && Array.isArray(deptRes.value)
            ? deptRes.value
            : []
        const deptGroups =
          groupRes.status === 'fulfilled' && Array.isArray(groupRes.value)
            ? groupRes.value
            : []

        // Filter HR_DEPT_GROUP records mapped to the user's business unit (buId) and group (bgId)
        const matchedGroups = deptGroups.filter((g) => {
          const matchBu = targetBuId ? String(g.buId ?? '') === targetBuId : true
          const matchBg = resolvedGroupId ? String(g.bgId ?? '') === resolvedGroupId : true
          const isActive = String(g.status ?? '1') === '1'
          return matchBu && matchBg && isActive
        })

        // Allowed Department IDs mapped to this BU and BG in HR_DEPT_GROUP
        const allowedDeptIds = new Set(matchedGroups.map((g) => String(g.deptId)))

        // Filter departments: must be in allowedDeptIds from HR_DEPT_GROUP
        const filteredDepts = depts.filter((d) => {
          const id = String(d.id ?? d.ID ?? '')
          const matchGroup = allowedDeptIds.has(id)
          const matchBg = resolvedGroupId
            ? String(d.bgId ?? d.BG_ID ?? '') === resolvedGroupId
            : true
          const isActive = String(d.status ?? '1') === '1'
          return matchGroup && matchBg && isActive
        })

        setLoadedDepartments({
          key: `${targetBuId}-${resolvedGroupId}`,
          records: filteredDepts.map(mapDepartmentFromApi),
        })
      })
      .catch((error) => {
        if (!active) return
        setLoadedDepartments({ key: `${targetBuId}-${resolvedGroupId}`, records: [] })
        getApiErrorMessage(error, 'Unable to load Departments.')
      })
      .finally(() => {
        if (active) setDepartmentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [targetBuId, resolvedGroupId])

  return {
    custodians: loadedCustodians.records,
    departments: loadedDepartments.records,
    custodiansLoading,
    departmentsLoading,
    resolvedGroupId,
  }
}
