/** @file API-backed edit controller for Asset Assign to Employee. */
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetAssignEmployeeForm from '../components/AssetAssignEmployeeForm'
import { assetAssignmentApi } from '../api/assetAssignmentApi'
import { mapAssetAssignmentFromApi, mapAssetAssignmentToApi } from '../data/assetAssignEmployeeApiMapper'
import { getInitialAssetAssignReferences, loadAssetAssignReferences } from '../data/assetAssignEmployeeOptions'
import {
  ASSET_ASSIGN_TO_EMPLOYEE_TABLE,
  validateAssetAssignment,
} from '../validation/assetAssignEmployeeValidation'

const listPath = '/asset/asset-assign-to-employee'
const fieldMap = {
  assetDate: 'ASSET_DATE',
  itemId: 'ITEM_ID',
  emplId: 'HR_EMPL_ID',
  conditionOnIssue: 'CONDITION_ON_ISSUE',
  expectedReturnDate: 'EXPECTED_RETURN_DATE',
  actualReturnDate: 'ACTUAL_RETURN_DATE',
  remarks: 'REMARKS',
  status: 'STATUS',
}

function AssetAssignEmployeeEdit() {
  const { assetAssignmentId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(null)
  const [originalValues, setOriginalValues] = useState(null)
  const [references, setReferences] = useState(getInitialAssetAssignReferences)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      assetAssignmentApi.get(assetAssignmentId),
      loadAssetAssignReferences(sessionBusinessUnitId),
    ])
      .then(([record, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapAssetAssignmentFromApi(record, refs)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 404) {
          setNotFound(true)
        } else {
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Assignment.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [assetAssignmentId, sessionBusinessUnitId])

  if (notFound) {
    return <Navigate to={listPath} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = validateAssetAssignment(values, references)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    try {
      const payload = mapAssetAssignmentToApi(result.values, {
        bgId: originalValues?.BG_ID || sessionGroupId,
        buId: originalValues?.BU_ID || sessionBusinessUnitId,
      })
      await assetAssignmentApi.update(assetAssignmentId, payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to update Asset Assignment.'))
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
      requestAnimationFrame(() => document.getElementById('ASSET_DATE')?.focus())
    }
  }

  return (
    <FormPage
      title={'Asset Assign to Employee Edit'}
      listTo={listPath}
      tableName={ASSET_ASSIGN_TO_EMPLOYEE_TABLE}
      submitLabel={'Update'}
      loading={loading}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {values && (
        <AssetAssignEmployeeForm
          values={values}
          errors={errors}
          references={references}
          onChange={handleChange}
        />
      )}
    </FormPage>
  )
}

export default AssetAssignEmployeeEdit
