/** @file API-backed Depreciation Category edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { depreciationCategoriesApi } from '../api/depreciationCategoryApi'
import DepreciationCategoryForm from '../components/DepreciationCategoryForm'
import { mapDepreciationCategoryFromApi, mapDepreciationCategoryToApi } from '../data/depreciationCategoryApiMapper'
import { loadDepreciationCategoryReferences } from '../data/depreciationCategoryOptions'
import { DEPRECIATION_CATEGORY_TABLE, initialDepreciationCategoryValues, validateDepreciationCategory } from '../validation/depreciationCategoryValidation'

const listPath = '/asset/depreciation-category'
const emptyReferences = { methodOptions: [], assetTypeOptions: [], departmentOptions: [] }
const fieldMap = {
  depriCategory: 'DEPRI_CATEGORY', depriMethodId: 'DEPRI_METHOD', assetTypeId: 'ASSET_TYPE',
  depriLife: 'DEPRI_LIFE', depriPercentage: 'DEPRI_PERCENTAGE', assetOwnerId: 'ASSET_OWNER', status: 'STATUS',
}

function DepreciationCategoryEdit() {
  const { depreciationCategoryId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const categoryRef = useRef(null)
  const [values, setValues] = useState(initialDepreciationCategoryValues)
  const [originalValues, setOriginalValues] = useState(initialDepreciationCategoryValues)
  const [auditLog, setAuditLog] = useState(null)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(emptyReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadDepreciationCategoryReferences(sessionBusinessUnitId, sessionGroupId),
      depreciationCategoriesApi.get(depreciationCategoryId),
      depreciationCategoriesApi.list(sessionBusinessUnitId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([loadedReferences, record, records, users, employees]) => {
        if (!active) return

        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const mapped = mapDepreciationCategoryFromApi(record, loadedReferences, userMap, empMap)
        setReferences(loadedReferences)
        setValues(mapped)
        setOriginalValues(mapped)
        setAuditLog({
          CREATED_USER_ID: mapped.CREATED_USER_ID,
          CREATED_USER_NAME: mapped.CREATED_USER_NAME,
          CREATED_EMP_ID: mapped.CREATED_EMP_ID,
          CREATED_EMP_NAME: mapped.CREATED_EMP_NAME,
          CREATED_DATETIME: mapped.CREATED_DATETIME,
          CREATED_APP: mapped.CREATED_APP,
          UPDATED_USER_ID: mapped.UPDATED_USER_ID,
          UPDATED_USER_NAME: mapped.UPDATED_USER_NAME,
          UPDATED_EMP_ID: mapped.UPDATED_EMP_ID,
          UPDATED_EMP_NAME: mapped.UPDATED_EMP_NAME,
          UPDATED_DATETIME: mapped.UPDATED_DATETIME,
          UPDATED_APP: mapped.UPDATED_APP,
          STATUS: mapped.STATUS,
        })
        setExistingRecords(records
          .filter((item) => String(item.id) !== String(depreciationCategoryId))
          .map((item) => mapDepreciationCategoryFromApi(item, loadedReferences, userMap, empMap)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Depreciation Category.'))
      })
    return () => { active = false }
  }, [depreciationCategoryId, sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'DEPRI_METHOD' ? { DEPRI_METHOD_NAME: references.methodOptions.find((option) => option.value === value)?.label || '' } : {}),
      ...(name === 'ASSET_TYPE' ? { ASSET_TYPE_NAME: references.assetTypeOptions.find((option) => option.value === value)?.label || '' } : {}),
      ...(name === 'ASSET_OWNER' ? { ASSET_OWNER_NAME: references.departmentOptions.find((option) => option.value === value)?.label || '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDepreciationCategory(values, existingRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      await depreciationCategoriesApi.update(depreciationCategoryId, mapDepreciationCategoryToApi(result.values, {
        bgId: sessionGroupId || values.BG_ID,
        buId: sessionBusinessUnitId || values.BU_ID,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Depreciation Category.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => categoryRef.current?.focus())
  }

  return (
    <FormPage
      title={'Depreciation Category Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={DEPRECIATION_CATEGORY_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <DepreciationCategoryForm
        values={values}
        errors={errors}
        methodOptions={references.methodOptions}
        assetTypeOptions={references.assetTypeOptions}
        departmentOptions={references.departmentOptions}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        categoryRef={categoryRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default DepreciationCategoryEdit
