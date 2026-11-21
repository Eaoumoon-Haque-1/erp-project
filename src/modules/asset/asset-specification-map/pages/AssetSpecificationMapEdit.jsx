/**
 * @file API-backed edit controller for Asset Specification Mapping.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
import AssetSpecificationMapForm from '../components/AssetSpecificationMapForm'
import {
  mapAssetSpecificationMapFromApi,
  mapAssetSpecificationMapToApi,
} from '../data/assetSpecificationMapApiMapper'
import { loadAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'
import {
  ASSET_ITEM_SPEC_TABLE,
  initialAssetSpecificationMapValues,
  validateAssetSpecificationMap,
} from '../validation/assetSpecificationMapValidation'

const listPath = '/asset/asset-specification-map'
const emptyReferences = { assetItems: [], specificationOptions: [] }
const fieldMap = {
  itemNameId: 'ITEM_NAME',
  specName: 'SPECIFICATION',
  sortOrder: 'SORT_ORDER',
  status: 'STATUS',
}

function AssetSpecificationMapEdit() {
  const { assetSpecificationMapId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const assetItemRef = useRef(null)
  const [values, setValues] = useState(initialAssetSpecificationMapValues)
  const [originalValues, setOriginalValues] = useState(initialAssetSpecificationMapValues)
  const [auditLog, setAuditLog] = useState(null)
  const [references, setReferences] = useState(emptyReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Ensure BG_ID is resolved if session has only buId
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setValues((prev) => ({
              ...prev,
              BG_ID: String(bu.bgId),
            }))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetSpecificationMapReferences(sessionBusinessUnitId),
      assetSpecificationMapsApi.get(assetSpecificationMapId),
      assetSpecificationMapsApi.list({ businessUnitId: sessionBusinessUnitId }),
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

        const mapped = mapAssetSpecificationMapFromApi(record, loadedReferences, userMap, empMap)
        const specificationExists = loadedReferences.specificationOptions.some(
          (option) => option.value === mapped.SPECIFICATION,
        )
        const editReferences =
          specificationExists || !mapped.SPECIFICATION
            ? loadedReferences
            : {
                ...loadedReferences,
                specificationOptions: [
                  ...loadedReferences.specificationOptions,
                  {
                    value: mapped.SPECIFICATION,
                    label: mapped.SPECIFICATION_NAME || mapped.SPECIFICATION,
                  },
                ],
              }

        const resolvedValues = {
          ...mapped,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBusinessUnitId || mapped.BU_ID,
        }

        setReferences(editReferences)
        setValues(resolvedValues)
        setOriginalValues(resolvedValues)
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
          records
            .filter((item) => String(item.id) !== String(assetSpecificationMapId))
            .map((item) => mapAssetSpecificationMapFromApi(item, editReferences, userMap, empMap)),
        )
      })
      .catch((error) => {
        if (active)
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Specification Mapping.'))
      })
    return () => {
      active = false
    }
  }, [assetSpecificationMapId, sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME'
        ? {
            ITEM_NAME_LABEL:
              references.assetItems.find((item) => item.ID === value)?.ITEM_NAME || '',
          }
        : {}),
      ...(name === 'SPECIFICATION' ? { SPECIFICATION_NAME: value } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetSpecificationMap(values, existingRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetSpecificationMapsApi.update(
        assetSpecificationMapId,
        mapAssetSpecificationMapToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to update Asset Specification Mapping.', fieldMap),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetItemRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Specification Mapping Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_ITEM_SPEC_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetSpecificationMapForm
        values={values}
        errors={errors}
        references={references}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        assetItemRef={assetItemRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetSpecificationMapEdit
