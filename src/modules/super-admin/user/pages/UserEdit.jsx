/** @file API-backed User edit page using documented User CRUD fields. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import { businessUnitsApi, rolesApi, usersApi, userTypesApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserForm from '../components/UserForm'
import { mapUserFromApi, mapUserToApi } from '../data/userApiMapper'
import {
  USER_TABLE,
  createInitialUserValues,
  getUserValidityToDate,
  validateUser,
} from '../validation/userValidation'

const listPath = '/super-admin/user-creation/user'

function UserEdit() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const userNameRef = useRef(null)
  const initialValues = createInitialUserValues(currentUser.businessGroup.id)
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [originalRecord, setOriginalRecord] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      usersApi.get(userId),
      businessUnitsApi.listByGroup(currentUser.businessGroup.id),
      rolesApi.list(),
      userTypesApi.list(),
    ])
      .then(([user, units, roles, userTypes]) => {
        if (!active) return
        const mapped = mapUserFromApi(user, {
          businessGroupId: currentUser.businessGroup.id,
        })
        setValues(mapped)
        setOriginalValues(mapped)
        setOriginalRecord(user)
        setBusinessUnitOptions(units.map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.userType })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User.'))
      })
    return () => {
      active = false
    }
  }, [userId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'FROM_DATE'
        ? { TO_DATE: getUserValidityToDate(nextValue) }
        : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUser(values, [], [], { requirePassword: false })
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return
    setSubmitting(true)
    setMessage('')
    try {
      await usersApi.update(userId, mapUserToApi(result.values, originalRecord))
      navigate(listPath)
    } catch (error) {
      const apiMessage = getApiErrorMessage(error, 'Unable to update User.')
      if (/email/i.test(apiMessage)) {
        setErrors((current) => ({ ...current, EMAIL: apiMessage }))
        requestAnimationFrame(() => document.querySelector('[name="EMAIL"]')?.focus())
      } else {
        setMessage(apiMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Edit'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} message={message} messageTone={'error'} submitting={submitting}>
      <UserForm values={values} errors={errors} groupName={currentUser.businessGroup.name} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} onChange={handleChange} />
    </FormPage>
  )
}

export default UserEdit
