/**
 * @file Shared API-backed Business Group and dependent Business Unit options.
 * Use this instead of feature-level fixtures whenever a form stores BG_ID/BU_ID.
 */
import { useEffect, useState } from 'react'
import { businessGroupsApi } from '../modules/super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../modules/super-admin/business-unit/api/businessUnitApi'
import { getApiErrorMessage } from '../api/errors'

export default function useBusinessOptions(
  selectedGroupId,
  { loadUnits = true, preserveGroupId = '', preserveUnitId = '' } = {},
) {
  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [loadedUnits, setLoadedUnits] = useState({ groupId: '', records: [] })

  useEffect(() => {
    let active = true

    businessGroupsApi.list()
      .then((groups) => {
        if (!active) return
        setGroups(groups)
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Business Groups.')
      })
      .finally(() => {
        if (active) setGroupsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!loadUnits || !selectedGroupId) {
      return undefined
    }

    let active = true

    businessUnitsApi.listByGroup(selectedGroupId)
      .then((units) => {
        if (!active) return
        setLoadedUnits({ groupId: String(selectedGroupId), records: units })
      })
      .catch((error) => {
        if (active) {
          setLoadedUnits({ groupId: String(selectedGroupId), records: [] })
          getApiErrorMessage(error, 'Unable to load Business Units.')
        }
      })

    return () => {
      active = false
    }
  }, [loadUnits, selectedGroupId])

  const groupOptions = groups
    .filter(
      (group) =>
        String(group.status ?? 1) === '1' ||
        String(group.id) === String(preserveGroupId),
    )
    .map((group) => ({
      value: String(group.id),
      label: group.groupName,
    }))

  const unitsAreCurrent = loadedUnits.groupId === String(selectedGroupId)
  const businessUnitOptions = !loadUnits || !selectedGroupId || !unitsAreCurrent
    ? []
    : loadedUnits.records
      .filter(
        (unit) =>
          String(unit.status ?? 1) === '1' ||
          String(unit.id) === String(preserveUnitId),
      )
      .map((unit) => ({
        value: String(unit.id),
        label: unit.businessUnit,
      }))
  const unitsLoading = Boolean(loadUnits && selectedGroupId && !unitsAreCurrent)

  return {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  }
}
