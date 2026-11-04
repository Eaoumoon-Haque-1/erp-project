/** @file API-backed create controller for Asset Assign to Employee. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetAssignEmployeeForm from '../components/AssetAssignEmployeeForm'
import { assetAssignmentApi } from '../api/assetAssignmentApi'
import { mapAssetAssignmentToApi } from '../data/assetAssignEmployeeApiMapper'
import { getInitialAssetAssignReferences, loadAssetAssignReferences } from '../data/assetAssignEmployeeOptions'
import {
  ASSET_ASSIGN_TO_EMPLOYEE_TABLE,
  initialAssetAssignmentValues,
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

function AssetAssignEmployeeCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(initialAssetAssignmentValues)
  const [references, setReferences] = useState(getInitialAssetAssignReferences)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadAssetAssignReferences(sessionBusinessUnitId)
      .then((refs) => {
        if (active) setReferences(refs)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load references.'))
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

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
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      })
      await assetAssignmentApi.create(payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to create Asset Assignment.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialAssetAssignmentValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ASSET_DATE')?.focus())
  }

  return (
    <FormPage
      title={'Asset Assign to Employee Create'}
      listTo={listPath}
      tableName={ASSET_ASSIGN_TO_EMPLOYEE_TABLE}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssetAssignEmployeeForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetAssignEmployeeCreate
