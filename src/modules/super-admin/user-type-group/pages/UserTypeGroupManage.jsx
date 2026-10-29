/** @file Shared create/edit workflow for bulk User Type to Business Unit assignments. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { userTypeGroupsApi } from '../api/userTypeGroupApi'
import BusinessUnitAssignment from '../components/BusinessUnitAssignment'
import BusinessUnitAssignmentTable from '../components/BusinessUnitAssignmentTable'
import UserTypeGroupForm from '../components/UserTypeGroupForm'
import { mapUserTypeGroupFromApi, mapUserTypeGroupToApi } from '../data/userTypeGroupApiMapper'
import {
  USER_TYPE_GROUP_TABLE,
  createInitialUserTypeGroupValues,
  initialBusinessUnitAssignment,
  validateBusinessUnitAssignment,
  validateUserTypeGroup,
} from '../validation/userTypeGroupValidation'

const listPath = '/super-admin/user-creation/user-type-group'

async function getMappingOrEmpty(userTypeId, bgId) {
  try {
    return await userTypeGroupsApi.getByUserType(userTypeId)
  } catch (error) {
    if (error?.response?.status === 404) {
      return { userTypeId: Number(userTypeId), bgId: Number(bgId), businessUnits: [] }
    }
    throw error
  }
}

function UserTypeGroupManage({ editing = false }) {
  const navigate = useNavigate()
  const { userTypeGroupId = '' } = useParams()
  const typeRef = useRef(null)
  const [values, setValues] = useState(() => createInitialUserTypeGroupValues(''))
  const [errors, setErrors] = useState({})
  const [assignment, setAssignment] = useState(initialBusinessUnitAssignment)
  const [assignmentErrors, setAssignmentErrors] = useState({})
  const [rows, setRows] = useState([])
  const [removedRows, setRemovedRows] = useState([])
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState([])
  const [userTypes, setUserTypes] = useState([])
  const [businessUnits, setBusinessUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [mappingLoading, setMappingLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const groupOptions = useMemo(() => groups
    .filter((group) => String(group.status ?? 1) === '1' || String(group.id) === values.BG_ID)
    .map((group) => ({ value: String(group.id), label: group.groupName })), [groups, values.BG_ID])

  const userTypeOptions = useMemo(() => userTypes
    .filter((type) => String(type.status ?? 1) === '1' || String(type.id) === values.USER_TYPE_ID)
    .map((type) => ({ value: String(type.id), label: type.typeName })), [userTypes, values.USER_TYPE_ID])

  const businessUnitOptions = useMemo(() => businessUnits
    .filter((unit) => String(unit.status ?? 1) === '1' || rows.some((row) => row.BU_ID === String(unit.id)))
    .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })), [businessUnits, rows])
  const selectedUserTypeName = userTypeOptions.find((type) => type.value === values.USER_TYPE_ID)?.label || ''
  const selectedGroupName = groupOptions.find((group) => group.value === values.BG_ID)?.label || ''

  const applyMapping = (record, units) => {
    const names = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
    setRows(mapUserTypeGroupFromApi(record, names).rows)
    setRemovedRows([])
  }

  const loadMapping = async (userTypeId, groupId, suppliedUnits = null) => {
    if (!userTypeId) {
      setRows([])
      setRemovedRows([])
      return
    }
    setMappingLoading(true)
    try {
      const units = suppliedUnits || await businessUnitsApi.listByGroup(groupId)
      if (!suppliedUnits) setBusinessUnits(units)
      const record = await getMappingOrEmpty(userTypeId, groupId)
      const recordGroupId = String(record.bgId ?? groupId)
      applyMapping(
        recordGroupId === String(groupId)
          ? record
          : { userTypeId: Number(userTypeId), bgId: Number(groupId), businessUnits: [] },
        units,
      )
    } catch (error) {
      setRows([])
      setRemovedRows([])
      getApiErrorMessage(error, 'Unable to load User Type Business Units.')
    } finally {
      setMappingLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([businessGroupsApi.list(), userTypesApi.list()])
      .then(async ([groupRecords, typeRecords]) => {
        if (!active) return
        setGroups(groupRecords)
        setUserTypes(typeRecords)
        if (editing) {
          const selectedType = typeRecords.find((type) => String(type.id) === String(userTypeGroupId))
          if (!selectedType) throw new Error('The selected User Type was not found.')
          const record = await userTypeGroupsApi.getByUserType(selectedType.id)
          if (!active) return
          const bgId = String(record.bgId ?? '')
          setValues({ BG_ID: bgId, USER_TYPE_ID: String(selectedType.id), STATUS: '1' })
          const units = await businessUnitsApi.listByGroup(bgId)
          if (!active) return
          setBusinessUnits(units)
          applyMapping(record, units)
        }
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load User Type Group data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [editing, userTypeGroupId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (name === 'BG_ID') {
      setRows([])
      setRemovedRows([])
      setAssignment(initialBusinessUnitAssignment)
      setBusinessUnits([])
      if (value) {
        setUnitsLoading(true)
        businessUnitsApi.listByGroup(value)
          .then((units) => {
            setBusinessUnits(units)
            if (editing && values.USER_TYPE_ID) {
              loadMapping(values.USER_TYPE_ID, value, units).catch(() => {})
            }
          })
          .catch((error) => getApiErrorMessage(error, 'Unable to load Business Units.'))
          .finally(() => setUnitsLoading(false))
      }
    }
    if (name === 'USER_TYPE_ID') {
      if (editing && value && values.BG_ID) loadMapping(value, values.BG_ID).catch(() => {})
      else if (!editing) {
        setRows([])
        setRemovedRows([])
        setAssignment(initialBusinessUnitAssignment)
      }
    }
  }

  const appendBusinessUnit = (nextAssignment) => {
    const contextErrors = {}
    if (!values.USER_TYPE_ID) contextErrors.USER_TYPE_ID = 'Type Name is required.'
    if (!values.BG_ID) contextErrors.BG_ID = 'Business Group is required.'
    if (Object.keys(contextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...contextErrors }))
      return false
    }

    const assignmentResult = validateBusinessUnitAssignment(nextAssignment, rows)
    setAssignment(assignmentResult.values)
    setAssignmentErrors(assignmentResult.errors)
    if (!assignmentResult.isValid) return false

    const removed = removedRows.find((row) => row.BU_ID === assignmentResult.values.BU_ID)
    const option = businessUnitOptions.find((item) => item.value === assignmentResult.values.BU_ID)
    setRows((current) => [...current, removed
      ? { ...removed, STATUS: assignmentResult.values.STATUS }
      : { ID: `new-${assignmentResult.values.BU_ID}-${Date.now()}`, MAPPING_ID: null, ...assignmentResult.values, BUSINESS_UNIT_NAME: option?.label || '' }])
    if (removed) setRemovedRows((current) => current.filter((row) => row.ID !== removed.ID))
    setErrors((current) => ({ ...current, BUSINESS_UNITS: undefined }))
    return true
  }

  const handleAssignmentChange = (event) => {
    const { name, type, value, checked } = event.target

    if (name === 'BU_ID') {
      if (!value) {
        setAssignment(initialBusinessUnitAssignment)
        setAssignmentErrors((current) => ({ ...current, BU_ID: undefined }))
        return
      }

      const nextAssignment = {
        BU_ID: String(value),
        STATUS: assignment.STATUS,
      }
      if (appendBusinessUnit(nextAssignment)) {
        setAssignment(initialBusinessUnitAssignment)
        setAssignmentErrors({})
      }
      return
    }

    setAssignment((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleNewRow = () => {
    setAssignment(initialBusinessUnitAssignment)
    setAssignmentErrors({})
    requestAnimationFrame(() => document.getElementById('BU_ID')?.focus())
  }

  const handleDelete = (id) => {
    const selected = rows.find((row) => row.ID === id)
    if (selected?.MAPPING_ID != null) setRemovedRows((current) => [...current, selected])
    setRows((current) => current.filter((row) => row.ID !== id))
  }

  const handleStatusChange = (id) => {
    setRows((current) => current.map((row) => row.ID === id
      ? { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }
      : row))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUserTypeGroup(values)
    const nextErrors = { ...result.errors }
    if (rows.length === 0) nextErrors.BUSINESS_UNITS = 'Add at least one Business Unit.'
    setValues(result.values)
    setErrors(nextErrors)
    if (!result.isValid || rows.length === 0) return

    setSubmitting(true)
    try {
      await userTypeGroupsApi.save(values.USER_TYPE_ID, mapUserTypeGroupToApi(result.values, rows))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to save User Type Business Units.', {
        userTypeId: 'USER_TYPE_ID', bgId: 'BG_ID', businessUnits: 'BUSINESS_UNITS', buId: 'BU_ID',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (editing) loadMapping(values.USER_TYPE_ID, values.BG_ID).catch(() => {})
    else {
      setValues(createInitialUserTypeGroupValues(''))
      setRows([])
      setBusinessUnits([])
    }
    setErrors({})
    setAssignment(initialBusinessUnitAssignment)
    setAssignmentErrors({})
    setRemovedRows([])
    setQuery('')
    requestAnimationFrame(() => typeRef.current?.focus())
  }

  return (
    <FormPage
      title={editing ? 'Manage User Type Business Units' : 'User Type Business Unit Assignment'}
      listTo={listPath}
      tableName={USER_TYPE_GROUP_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      submitLabel={editing ? 'Update' : 'Save'}
    >
      <UserTypeGroupForm values={values} errors={errors} userTypeOptions={userTypeOptions} typesLoading={loading} fieldsDisabled={mappingLoading || (editing && loading)} typeReadOnly={editing} typeRef={typeRef} onChange={handleChange} />
      <div className={'erp-role-divider'} />
      <BusinessUnitAssignment values={assignment} errors={{ ...assignmentErrors, BU_ID: assignmentErrors.BU_ID || errors.BUSINESS_UNITS }} groupId={values.BG_ID} groupError={errors.BG_ID} groupOptions={groupOptions} businessUnitOptions={businessUnitOptions} groupsLoading={loading} unitsLoading={unitsLoading || mappingLoading} groupSelected={Boolean(values.BG_ID)} groupReadOnly={editing} hasAssignments={rows.length > 0} onGroupChange={handleChange} onChange={handleAssignmentChange} onNewRow={handleNewRow} />
      <BusinessUnitAssignmentTable rows={rows} userTypeName={selectedUserTypeName} businessGroupName={selectedGroupName} query={query} onQueryChange={setQuery} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    </FormPage>
  )
}

export default UserTypeGroupManage
