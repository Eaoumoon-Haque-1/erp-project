/** @file API-backed edit controller for Asset Group. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { assetGroupsApi } from '../api/assetGroupApi'
import AssetGroupForm from '../components/AssetGroupForm'
import { mapAssetGroupFromApi, mapAssetGroupToApi } from '../data/assetGroupApiMapper'
import {
  ASSET_GROUP_TABLE,
  initialAssetGroupValues,
  validateAssetGroup,
} from '../validation/assetGroupValidation'

const listPath = '/asset/asset-group'
const fieldMap = { assetGroup: 'ASSET_GROUP', assetOwnerId: 'ASSET_OWNER_ID', status: 'STATUS' }

function AssetGroupEdit() {
  const { assetGroupId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const assetGroupRef = useRef(null)
  const [values, setValues] = useState(initialAssetGroupValues)
  const [originalValues, setOriginalValues] = useState(initialAssetGroupValues)
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      assetGroupsApi.get(assetGroupId),
      assetGroupsApi.list(sessionBusinessUnitId),
      departmentsApi.listByGroup(sessionGroupId),
    ])
      .then(([record, records, departments]) => {
        if (!active) return
        const options = departments
          .filter((department) => Number(department.status) === 1)
          .map((department) => ({ value: String(department.id), label: department.departmentName }))
        const departmentNames = new Map(options.map((option) => [option.value, option.label]))
        const mapped = mapAssetGroupFromApi(record, departmentNames)
        setDepartmentOptions(options)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records
          .filter((item) => String(item.id) !== String(assetGroupId))
          .map((item) => mapAssetGroupFromApi(item, departmentNames)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Group.'))
      })
    return () => { active = false }
  }, [assetGroupId, sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ASSET_OWNER_ID' ? {
        ASSET_OWNER_NAME: departmentOptions.find((option) => option.value === value)?.label || '',
      } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetGroup(values, existingRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetGroupsApi.update(assetGroupId, mapAssetGroupToApi(result.values, {
        bgId: sessionGroupId || values.BG_ID,
        buId: sessionBusinessUnitId || values.BU_ID,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Asset Group.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetGroupRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Group Edit'}
      listTo={listPath}
      tableName={ASSET_GROUP_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetGroupForm values={values} errors={errors} departmentOptions={departmentOptions} assetGroupRef={assetGroupRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetGroupEdit
