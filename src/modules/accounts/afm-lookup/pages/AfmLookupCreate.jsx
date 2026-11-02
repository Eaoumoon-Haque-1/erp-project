/**
 * @file AFM Lookup Type Create page.
 * Manages lookup type master creation and repeatable lookup value detail rows.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { afmLookupApi } from '../api/afmLookupApi'
import AfmLookupForm from '../components/AfmLookupForm'
import { mapLookupTypeToApi } from '../data/afmLookupApiMapper'
import useAfmLookupForm from '../data/useAfmLookupForm'
import {
  AFM_LOOKUP_TYPE_TABLE,
  createInitialLookupValueRow,
  initialLookupTypeValues,
} from '../validation/afmLookupValidation'

const listPath = '/accounts/voucher-setup/lookup'

function AfmLookupCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const sessionValues = { BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }
  const form = useAfmLookupForm(
    { ...initialLookupTypeValues, ...sessionValues },
    [createInitialLookupValueRow({}, 1)],
  )
  const { setValues } = form

  // Group Name (BG_ID) and Business Unit (BU_ID) come from the logged-in session
  useEffect(() => {
    setValues((current) => {
      const nextBgId = sessionGroupId || current.BG_ID
      const nextBuId = sessionBusinessUnitId || current.BU_ID
      if (current.BG_ID === nextBgId && current.BU_ID === nextBuId) return current
      return { ...current, BG_ID: nextBgId, BU_ID: nextBuId }
    })
  }, [sessionBusinessUnitId, sessionGroupId, setValues])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate(sessionValues)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await afmLookupApi.create(mapLookupTypeToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Lookup Type.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(
      {
        ...initialLookupTypeValues,
        ...sessionValues,
      },
      [createInitialLookupValueRow({}, 1)],
    )
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Lookup Type'}
      listTo={listPath}
      tableName={AFM_LOOKUP_TYPE_TABLE}
      submitLabel={'Save'}
      onSubmit={handleSubmit}
      onValidate={() => form.validate(sessionValues).isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <AfmLookupForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        typeNameRef={typeNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default AfmLookupCreate
