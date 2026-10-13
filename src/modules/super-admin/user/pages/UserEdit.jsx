/** @file API-backed User edit page using documented User CRUD fields. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { usersApi } from '../api/userApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
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
  const initialValues = createInitialUserValues()
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [originalRecord, setOriginalRecord] = useState({})
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  } = useBusinessOptions(values.BG_ID, {
    preserveGroupId: originalValues.BG_ID,
    preserveUnitId: originalValues.BU_ID,
  })

  useEffect(() => {
    let active = true
    Promise.all([
      usersApi.get(userId),
      rolesApi.list(),
      userTypesApi.list(),
    ])
      .then(async ([user, roles, userTypes]) => {
        const unit = user.buId ? await businessUnitsApi.get(user.buId) : null
        if (!active) return
        const mapped = mapUserFromApi(user, {
          businessGroupId: unit?.bgId,
        })
        setValues(mapped)
        setOriginalValues(mapped)
        setOriginalRecord(user)
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.typeName })))
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
      ...(name === 'BG_ID' ? { BU_ID: '' } : {}),
      ...(name === 'FROM_DATE'
        ? { TO_DATE: getUserValidityToDate(nextValue) }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BG_ID' ? { BU_ID: undefined } : {}),
    }))
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
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update User.', {
        userName: 'USER_NAME',
        fullName: 'FULL_NAME',
        bgId: 'BG_ID',
        buId: 'BU_ID',
        businessGroup: 'BG_ID',
        businessUnit: 'BU_ID',
        email: 'EMAIL',
        mobileNo: 'MOBILE_NO',
        password: 'PASSWORD',
        fromDate: 'FROM_DATE',
        toDate: 'TO_DATE',
        roleId: 'ROLE_ID',
        userTypeId: 'USER_TYPE_ID',
        androidId: 'ANDROID_ID',
      }))
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
      <UserForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} unitsLoading={unitsLoading} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} requirePassword={false} onChange={handleChange} />
    </FormPage>
  )
}

export default UserEdit
