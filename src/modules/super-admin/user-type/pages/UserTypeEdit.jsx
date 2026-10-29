/** @file API-backed User Type edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { userTypesApi } from '../api/userTypeApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserTypeForm from '../components/UserTypeForm'
import { mapUserTypeFromApi, mapUserTypeToApi } from '../data/userTypeApiMapper'
import {
  USER_TYPE_TABLE,
  createInitialUserTypeValues,
  validateUserType,
} from '../validation/userTypeValidation'

const listPath = '/super-admin/user-creation/user-type'

function UserTypeEdit() {
  const { userTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const initialValues = createInitialUserTypeValues()
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    let active = true
    userTypesApi.get(userTypeId)
      .then((record) => {
        if (!active) return
        const mapped = mapUserTypeFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User Type.'))
      })
    return () => {
      active = false
    }
  }, [userTypeId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUserType(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return
    setSubmitting(true)
    setMessage('')
    try {
      await userTypesApi.update(userTypeId, mapUserTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update User Type.', {
        typeName: 'TYPE_NAME',
        shortName: 'SHORT_NAME',
        sortOrder: 'SORT_ORDER',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Type Edit'} listTo={listPath} tableName={USER_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} message={message} submitting={submitting}>
      <UserTypeForm values={values} errors={errors} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default UserTypeEdit
