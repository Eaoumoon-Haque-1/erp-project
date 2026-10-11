/**
 * @file Create-page controller for User Type Group.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import BusinessUnitAssignment from '../components/BusinessUnitAssignment'
import BusinessUnitAssignmentTable from '../components/BusinessUnitAssignmentTable'
import UserTypeGroupForm from '../components/UserTypeGroupForm'
import {
  USER_TYPE_GROUP_TABLE,
  createInitialUserTypeGroupValues,
  initialBusinessUnitAssignment,
  validateBusinessUnitAssignment,
  validateUserTypeGroup,
} from '../validation/userTypeGroupValidation'

const listPath = '/super-admin/user-creation/user-type-group'

function UserTypeGroupCreate() {
  const navigate = useNavigate()
  const typeRef = useRef(null)
  const [values, setValues] = useState(() => createInitialUserTypeGroupValues(currentUser.businessGroup.id))
  const [errors, setErrors] = useState({})
  const [assignment, setAssignment] = useState(initialBusinessUnitAssignment)
  const [assignmentErrors, setAssignmentErrors] = useState({})
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  } = useBusinessOptions(values.BG_ID, {
    preserveGroupId: currentUser.businessGroup.id,
  })

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (name === 'BG_ID') {
      setAssignment(initialBusinessUnitAssignment)
      setAssignmentErrors({})
      setRows([])
    }
  }

  const handleAssignmentChange = (event) => {
    const { name, type, value, checked } = event.target
    setAssignment((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setAssignmentErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleAdd = () => {
    const groupResult = validateUserTypeGroup(values)
    const assignmentResult = validateBusinessUnitAssignment(assignment, rows)
    setValues(groupResult.values)
    setErrors(groupResult.errors)
    setAssignment(assignmentResult.values)
    setAssignmentErrors(assignmentResult.errors)

    if (!groupResult.isValid || !assignmentResult.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setRows((current) => [
      ...current,
      {
        ID: `${Date.now()}-${current.length}`,
        ...assignmentResult.values,
        BUSINESS_UNIT_NAME:
          businessUnitOptions.find(
            (option) => option.value === assignmentResult.values.BU_ID,
          )?.label ?? '',
      },
    ])
    setAssignment(initialBusinessUnitAssignment)
    setAssignmentErrors({})
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateUserTypeGroup(values)
    setValues(result.values)
    setErrors(result.errors)
    if (rows.length === 0) {
      setAssignmentErrors({ BU_ID: 'Add at least one Business Unit.' })
    }
    if (!result.isValid || rows.length === 0) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(createInitialUserTypeGroupValues(currentUser.businessGroup.id))
    setErrors({})
    setAssignment(initialBusinessUnitAssignment)
    setAssignmentErrors({})
    setRows([])
    setQuery('')
    requestAnimationFrame(() => typeRef.current?.focus())
  }

  return (
    <FormPage
      title={'User Type Group Create'}
      listTo={listPath}
      tableName={USER_TYPE_GROUP_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <UserTypeGroupForm
        values={values}
        errors={errors}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        typeRef={typeRef}
        onChange={handleChange}
      />
      <div className={'erp-role-divider'} />
      <BusinessUnitAssignment
        values={assignment}
        errors={assignmentErrors}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        groupSelected={Boolean(values.BG_ID)}
        onChange={handleAssignmentChange}
        onAdd={handleAdd}
      />
      <BusinessUnitAssignmentTable
        rows={rows}
        query={query}
        onQueryChange={setQuery}
        onDelete={(id) => setRows((current) => current.filter((row) => row.ID !== id))}
      />
    </FormPage>
  )
}

export default UserTypeGroupCreate
