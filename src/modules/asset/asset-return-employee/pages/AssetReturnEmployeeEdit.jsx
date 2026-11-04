/** @file API-backed edit controller for Asset Return from Employee. */
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetReturnEmployeeForm from '../components/AssetReturnEmployeeForm'
import { assetReturnApi } from '../api/assetReturnApi'
import { updateAssetReturnField } from '../data/assetReturnEmployeeFormState'
import { mapAssetReturnFromApi, mapAssetReturnToApi } from '../data/assetReturnEmployeeApiMapper'
import { getInitialAssetReturnReferences, loadAssetReturnReferences } from '../data/assetReturnEmployeeOptions'
import {
  ASSET_ITEM_RETURN_TABLE,
  validateAssetReturn,
} from '../validation/assetReturnEmployeeValidation'

const listPath = '/asset/asset-return-from-employee'
const fieldMap = {
  assignId: 'ASSET_ASSIGNMENT_ID',
  assetDate: 'ASSET_DATE',
  itemId: 'ITEM_ID',
  emplId: 'HR_EMPL_ID',
  expectedReturnDate: 'EXPECTED_RETURN_DATE',
  actualReturnDate: 'ACTUAL_RETURN_DATE',
  conditionOnReturn: 'CONDITION_ON_RETURN',
  remarks: 'REMARKS',
  status: 'STATUS',
}

function AssetReturnEmployeeEdit() {
  const { assetReturnId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(null)
  const [originalValues, setOriginalValues] = useState(null)
  const [references, setReferences] = useState(getInitialAssetReturnReferences)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      assetReturnApi.get(assetReturnId),
      loadAssetReturnReferences(sessionBusinessUnitId),
    ])
      .then(([record, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetReturnFromApi(record, refs)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 404) {
          setNotFound(true)
        } else {
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Return.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetReturnId, sessionBusinessUnitId])

  if (notFound) {
    return <Navigate to={listPath} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => updateAssetReturnField(current, name, value, references))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetReturn(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetReturnToApi(result.values, {
        bgId: originalValues?.BG_ID || sessionGroupId,
        buId: originalValues?.BU_ID || sessionBusinessUnitId,
      })
      await assetReturnApi.update(assetReturnId, payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to update Asset Return.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalValues) {
      setValues(originalValues)
      setErrors({})
      setMessage('')
      requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
    }
  }

  return (
    <FormPage
      title={'Asset Return from Employee Edit'}
      listTo={listPath}
      tableName={ASSET_ITEM_RETURN_TABLE}
      submitLabel={'Update'}
      loading={loading}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {values && (
        <AssetReturnEmployeeForm
          values={values}
          errors={errors}
          references={references}
          onChange={handleChange}
        />
      )}
    </FormPage>
  )
}

export default AssetReturnEmployeeEdit
