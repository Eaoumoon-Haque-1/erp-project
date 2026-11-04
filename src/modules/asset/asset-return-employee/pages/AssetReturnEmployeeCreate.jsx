/** @file API-backed create controller for Asset Return from Employee. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import AssetReturnEmployeeForm from '../components/AssetReturnEmployeeForm'
import { assetReturnApi } from '../api/assetReturnApi'
import { updateAssetReturnField } from '../data/assetReturnEmployeeFormState'
import { mapAssetReturnToApi } from '../data/assetReturnEmployeeApiMapper'
import { getInitialAssetReturnReferences, loadAssetReturnReferences } from '../data/assetReturnEmployeeOptions'
import {
  ASSET_ITEM_RETURN_TABLE,
  createInitialAssetReturnValues,
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

function AssetReturnEmployeeCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')

  const [values, setValues] = useState(createInitialAssetReturnValues)
  const [references, setReferences] = useState(getInitialAssetReturnReferences)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    loadAssetReturnReferences(sessionBusinessUnitId)
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
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      })
      await assetReturnApi.create(payload)
      navigate(listPath)
    } catch (error) {
      const applied = applyApiFormErrors(error, setErrors, fieldMap)
      if (!applied) {
        setMessage(getApiErrorMessage(error, 'Unable to create Asset Return.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialAssetReturnValues())
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => document.getElementById('ASSET_ASSIGNMENT_ID')?.focus())
  }

  return (
    <FormPage
      title={'Asset Return from Employee Create'}
      listTo={listPath}
      tableName={ASSET_ITEM_RETURN_TABLE}
      submitting={submitting}
      message={message}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssetReturnEmployeeForm
        values={values}
        errors={errors}
        references={references}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetReturnEmployeeCreate
