/** @file API-backed Business Unit role assignment form. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { rolesApi } from '../../role/api/roleApi'
import { businessUnitRolesApi } from '../api/businessUnitRoleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import AssignRoleBusinessUnitForm from '../components/AssignRoleBusinessUnitForm'
import {
  BUSINESS_UNIT_ROLE_MAP_TABLE,
  createInitialRoleBusinessUnitValues,
  validateRoleBusinessUnitMapping,
} from '../validation/assignRoleBusinessUnitValidation'

const listPath = '/super-admin/role-creation/assign-role-business-unit'

function AssignRoleBusinessUnitCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedBusinessUnitId = searchParams.get('buId') || ''
  const roleRef = useRef(null)
  const [values, setValues] = useState(() =>
    createInitialRoleBusinessUnitValues(requestedBusinessUnitId),
  )
  const [errors, setErrors] = useState({})
  const [businessUnits, setBusinessUnits] = useState([])
  const [groups, setGroups] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [assignedRoles, setAssignedRoles] = useState([])
  const [removedMappings, setRemovedMappings] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const groupOptions = groups.map((group) => ({
    value: String(group.id),
    label: group.groupName,
  }))
  const businessUnitOptions = businessUnits
    .filter((unit) => String(unit.bgId) === values.BG_ID)
    .map((unit) => ({
      value: String(unit.id),
      label: unit.businessUnit,
    }))

  const loadAssignedRoles = async (businessUnitId) => {
    if (!businessUnitId) {
      setAssignedRoles([])
      return
    }
    const response = await businessUnitRolesApi.list(businessUnitId)
    setAssignedRoles(
      (response.assignedRoles || []).map((role) => ({
        MAPPING_ID: String(role.id),
        BU_ID: String(businessUnitId),
        ROLE_ID: String(role.roleId),
        ROLE_NAME: role.roleName,
        EXISTING: true,
      })),
    )
  }

  useEffect(() => {
    let active = true
    Promise.all([
      businessUnitsApi.list(),
      businessGroupsApi.list(),
      rolesApi.list(),
    ])
      .then(async ([units, groupRows, roles]) => {
        if (!active) return
        setBusinessUnits(units)
        setGroups(groupRows)
        setRoleOptions(
          roles.map((role) => ({
            value: String(role.id),
            label: role.roleName,
          })),
        )
        const initialBuId = requestedBusinessUnitId || String(units[0]?.id || '')
        const initialUnit = units.find(
          (unit) => String(unit.id) === initialBuId,
        )
        setValues(
          createInitialRoleBusinessUnitValues(initialBuId, initialUnit?.bgId),
        )
        await loadAssignedRoles(initialBuId)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load assignment data.'))
      })
    return () => {
      active = false
    }
  }, [requestedBusinessUnitId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'BG_ID' ? { BU_ID: '', ROLE_ID: '' } : {}),
      ...(name === 'BU_ID' ? { ROLE_ID: '' } : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BG_ID'
        ? { BU_ID: undefined, ROLE_ID: undefined, ASSIGNED_ROLES: undefined }
        : {}),
      ...(name === 'BU_ID'
        ? { ROLE_ID: undefined, ASSIGNED_ROLES: undefined }
        : {}),
    }))
    if (name === 'BG_ID') {
      setAssignedRoles([])
      setRemovedMappings([])
    }
    if (name === 'BU_ID') {
      setRemovedMappings([])
      loadAssignedRoles(value).catch((error) =>
        setMessage(getApiErrorMessage(error, 'Unable to load assigned Roles.')),
      )
    }
  }

  const handleAddRole = () => {
    const role = roleOptions.find((option) => option.value === values.ROLE_ID)
    if (!role) {
      setErrors((current) => ({ ...current, ROLE_ID: 'Role is required.' }))
      return
    }
    if (assignedRoles.some((item) => item.ROLE_ID === role.value)) {
      setErrors((current) => ({ ...current, ROLE_ID: 'This Role is already assigned.' }))
      return
    }
    setAssignedRoles((current) => [
      ...current,
      {
        BU_ID: values.BU_ID,
        ROLE_ID: role.value,
        ROLE_NAME: role.label,
        EXISTING: false,
      },
    ])
    setValues((current) => ({ ...current, ROLE_ID: '' }))
    setErrors((current) => ({ ...current, ROLE_ID: undefined, ASSIGNED_ROLES: undefined }))
  }

  const handleRemoveRole = (role) => {
    if (role.EXISTING) {
      setRemovedMappings((current) => [...current, role.MAPPING_ID])
    }
    setAssignedRoles((current) =>
      current.filter((item) =>
        (item.MAPPING_ID || item.ROLE_ID) !== (role.MAPPING_ID || role.ROLE_ID),
      ),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateRoleBusinessUnitMapping(values, assignedRoles)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await Promise.all([
        ...assignedRoles
          .filter((role) => !role.EXISTING)
          .map((role) =>
            businessUnitRolesApi.assign(values.BU_ID, Number(role.ROLE_ID)),
          ),
        ...removedMappings.map((mappingId) =>
          businessUnitRolesApi.remove(values.BU_ID, mappingId),
        ),
      ])
      navigate(listPath)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to save Role assignments.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    const businessUnitId = requestedBusinessUnitId || String(businessUnits[0]?.id || '')
    const unit = businessUnits.find(
      (businessUnit) => String(businessUnit.id) === businessUnitId,
    )
    setValues(createInitialRoleBusinessUnitValues(businessUnitId, unit?.bgId))
    setErrors({})
    setRemovedMappings([])
    loadAssignedRoles(businessUnitId).catch(() => {})
    requestAnimationFrame(() => roleRef.current?.focus())
  }

  return (
    <FormPage title={'Assign Role to Business Unit Create'} listTo={listPath} tableName={BUSINESS_UNIT_ROLE_MAP_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <AssignRoleBusinessUnitForm
        values={values}
        errors={errors}
        assignedRoles={assignedRoles}
        groupOptions={groupOptions}
        businessUnitOptions={businessUnitOptions}
        roleOptions={roleOptions}
        roleRef={roleRef}
        onChange={handleChange}
        onAddRole={handleAddRole}
        onRemoveRole={handleRemoveRole}
      />
    </FormPage>
  )
}

export default AssignRoleBusinessUnitCreate
