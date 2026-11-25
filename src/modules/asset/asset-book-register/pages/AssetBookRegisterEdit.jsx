/** @file API-backed Asset Book Register edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetBookRegisterApi } from '../api/assetBookRegisterApi'
import AssetBookRegisterForm from '../components/AssetBookRegisterForm'
import {
  mapAssetBookRegisterFromApi,
  mapAssetBookRegisterToApi,
} from '../data/assetBookRegisterApiMapper'
import { loadAssetBookRegisterReferences } from '../data/assetBookRegisterOptions'
import {
  ASSET_BOOK_REGISTER_TABLE,
  initialAssetBookRegisterValues,
  validateAssetBookRegister,
} from '../validation/assetBookRegisterValidation'

const listPath = '/asset/asset-book-register'
const fieldMap = {
  assetNo: 'ASSET_NO',
  assetItemId: 'ASSET_ITEM_ID',
  assetUnit: 'ASSET_UNIT',
  assetMajorCategoryId: 'ASSET_MAJOR_CATEGORY_ID',
  assetOwnerId: 'ASSET_OWNER_ID',
  allocationType: 'ALLOCATION_TYPE',
  allocationRefId: 'ALLOCATION_REF_ID',
  usageStatus: 'USAGE_STATUS',
  assetCondition: 'ASSET_CONDITION',
  assetStatus: 'ASSET_STATUS',
  allocationDate: 'ALLOCATION_DATE',
  status: 'STATUS',
}

function AssetBookRegisterEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const assetNoRef = useRef(null)

  const [values, setValues] = useState(initialAssetBookRegisterValues)
  const [originalValues, setOriginalValues] = useState(initialAssetBookRegisterValues)
  const [auditLog, setAuditLog] = useState(null)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState({})
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetBookRegisterReferences(sessionBusinessUnitId, sessionGroupId),
      assetBookRegisterApi.get(id),
      assetBookRegisterApi.list(sessionBusinessUnitId).catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([loadedReferences, record, records, users, employees]) => {
        if (!active) return

        const userMap = new Map(
          (users || []).map((u) => {
            const uId = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? uId
            return [uId, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const eId = String(e.id ?? e.ID ?? '')
            const code = String(e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '').trim()
            const name = String(e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '').trim()
            const display = code && name ? `${code}: ${name}` : code || name || eId
            return [eId, display]
          }),
        )

        const mapped = mapAssetBookRegisterFromApi(record, loadedReferences, userMap, empMap)
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
        setExistingRecords(
          (records || [])
            .filter((item) => String(item.id) !== String(id))
            .map((item) => mapAssetBookRegisterFromApi(item, loadedReferences, userMap, empMap)),
        )
      })
      .catch((error) => {
        if (active) {
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Book Register.'))
        }
      })
    return () => {
      active = false
    }
  }, [id, sessionBusinessUnitId, sessionGroupId])

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
    const result = validateAssetBookRegister(values, existingRecords, id)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetBookRegisterApi.update(
        id,
        mapAssetBookRegisterToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to update Asset Book Register.', fieldMap),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetNoRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Book Register Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_BOOK_REGISTER_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetBookRegisterForm
        values={values}
        errors={errors}
        references={references}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        assetNoRef={assetNoRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetBookRegisterEdit
