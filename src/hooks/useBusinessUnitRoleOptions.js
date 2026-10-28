/** @file Loads the Roles assigned to the selected Business Unit. */
import { useEffect, useState } from 'react'
import { businessUnitRolesApi } from '../modules/super-admin/assign-role-business-unit/api/businessUnitRoleApi'

function mapAssignedRoles(response) {
  const assignedRoles = Array.isArray(response) ? response : response?.assignedRoles || []
  return assignedRoles.map((role) => ({
    value: String(role.roleId),
    label: role.roleName || `Role #${role.roleId}`,
  }))
}

export default function useBusinessUnitRoleOptions(businessUnitId) {
  const [result, setResult] = useState({
    businessUnitId: '',
    roleOptions: [],
    error: null,
  })

  useEffect(() => {
    let active = true
    if (!businessUnitId) {
      return () => { active = false }
    }

    businessUnitRolesApi.list(businessUnitId)
      .then((response) => {
        if (!active) return
        setResult({
          businessUnitId: String(businessUnitId),
          roleOptions: mapAssignedRoles(response),
          error: null,
        })
      })
      .catch((error) => {
        if (!active) return
        setResult({
          businessUnitId: String(businessUnitId),
          roleOptions: [],
          error: error?.response?.status === 404 ? null : error,
        })
      })

    return () => { active = false }
  }, [businessUnitId])

  const loadedForSelectedUnit = result.businessUnitId === String(businessUnitId || '')
  return {
    roleOptions: loadedForSelectedUnit ? result.roleOptions : [],
    rolesLoading: Boolean(businessUnitId) && !loadedForSelectedUnit,
    rolesError: loadedForSelectedUnit ? result.error : null,
  }
}
