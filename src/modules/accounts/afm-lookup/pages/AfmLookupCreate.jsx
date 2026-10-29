/**
 * @file AFM Lookup Type Create page.
 * Manages lookup type master creation and repeatable lookup value detail rows.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
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
  const form = useAfmLookupForm(initialLookupTypeValues, [createInitialLookupValueRow({}, 1)])
  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } =
    useBusinessOptions(form.values.BG_ID, { loadUnits: true })

  // Auto-select first Business Group and Business Unit when available if not already selected
  useEffect(() => {
    if (!form.values.BG_ID && groupOptions.length > 0) {
      form.setValues((current) => ({
        ...current,
        BG_ID: groupOptions[0].value,
      }))
    }
  }, [form, groupOptions])

  useEffect(() => {
    if (form.values.BG_ID && !form.values.BU_ID && businessUnitOptions.length > 0) {
      form.setValues((current) => ({
        ...current,
        BU_ID: businessUnitOptions[0].value,
      }))
    }
  }, [form, businessUnitOptions])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
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
        BG_ID: groupOptions[0]?.value || '',
        BU_ID: businessUnitOptions[0]?.value || '',
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
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <AfmLookupForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
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
