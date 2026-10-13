/**
 * @file Create-page controller for User Type.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import { userTypesApi } from '../api/userTypeApi'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import UserTypeForm from '../components/UserTypeForm'
import { mapUserTypeToApi } from '../data/userTypeApiMapper'
import { USER_TYPE_TABLE, createInitialUserTypeValues, validateUserType } from '../validation/userTypeValidation'

const existingTypeNames = []
const existingShortNames = []
const listPath = '/super-admin/user-creation/user-type'

function UserTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const initialValues = createInitialUserTypeValues(currentUser.businessGroup.id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions('', {
    loadUnits: false,
    preserveGroupId: currentUser.businessGroup.id,
  })

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUserType(values, existingTypeNames, existingShortNames)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await userTypesApi.create(mapUserTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create User Type.', {
        typeName: 'TYPE_NAME',
        shortName: 'SHORT_NAME',
        sortOrder: 'SORT_ORDER',
        bgId: 'BG_ID',
        businessGroup: 'BG_ID',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialUserTypeValues(currentUser.businessGroup.id))
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Type Create'} listTo={listPath} tableName={USER_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <UserTypeForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default UserTypeCreate
