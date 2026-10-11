/**
 * @file Loads the reference data Location Master needs: custodians (with their
 * sub custodians) and departments. The form passes `buId` with `requireBu` so
 * custodians load per Business Unit; the list loads all of them.
 */
import { useEffect, useState } from 'react'
import { custodiansApi } from '../../../../api/custodian'
import { departmentsApi } from '../../../../api/department'
import { getApiErrorMessage } from '../../../../api/errors'
import { mapCustodianFromApi } from '../../custodian/data/custodianApiMapper'
import { mapDepartmentFromApi } from './locationMasterApiMapper'
import { locationBusinessGroup } from './locationMasterScope'

export default function useLocationReferences({ buId = '', requireBu = false } = {}) {
  const key = String(buId ?? '')
  const skipCustodians = requireBu && !key
  const [loadedCustodians, setLoadedCustodians] = useState({ key: null, records: [] })
  const [loadedDepartments, setLoadedDepartments] = useState(null)

  useEffect(() => {
    if (skipCustodians) return undefined
    let active = true
    custodiansApi.list(key || undefined)
      .then((records) => {
        if (active) setLoadedCustodians({ key, records: records.map(mapCustodianFromApi) })
      })
      .catch((error) => {
        if (!active) return
        setLoadedCustodians({ key, records: [] })
        getApiErrorMessage(error, 'Unable to load Custodians.')
      })
    return () => {
      active = false
    }
  }, [key, skipCustodians])

  useEffect(() => {
    let active = true
    departmentsApi.listByGroup(Number(locationBusinessGroup.ID))
      .then((records) => {
        if (active) setLoadedDepartments(records.map(mapDepartmentFromApi))
      })
      .catch((error) => {
        if (!active) return
        setLoadedDepartments([])
        getApiErrorMessage(error, 'Unable to load Departments.')
      })
    return () => {
      active = false
    }
  }, [])

  const custodiansCurrent = loadedCustodians.key === key
  return {
    custodians: custodiansCurrent ? loadedCustodians.records : [],
    departments: loadedDepartments ?? [],
    custodiansLoading: !skipCustodians && !custodiansCurrent,
    departmentsLoading: loadedDepartments === null,
  }
}
