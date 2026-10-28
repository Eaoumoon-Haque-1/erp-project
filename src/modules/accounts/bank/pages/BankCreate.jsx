/**
 * @file Bank Information Create page.
 * Manages bank master creation and repeatable branch/account rows.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { bankApi } from '../api/bankApi'
import BankForm from '../components/BankForm'
import { mapBankToApi } from '../data/bankApiMapper'
import useBankForm from '../data/useBankForm'
import {
  AFM_BANK_TABLE,
  createInitialBankDetailRow,
  initialBankValues,
} from '../validation/bankValidation'

const listPath = '/accounts/voucher-setup/bank'

function BankCreate() {
  const navigate = useNavigate()
  const bankNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const form = useBankForm(initialBankValues, [createInitialBankDetailRow()])
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
      await bankApi.create(mapBankToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Bank Information.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(
      {
        ...initialBankValues,
        BG_ID: groupOptions[0]?.value || '',
        BU_ID: businessUnitOptions[0]?.value || '',
      },
      [createInitialBankDetailRow()],
    )
    requestAnimationFrame(() => bankNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Bank Information'}
      listTo={listPath}
      tableName={AFM_BANK_TABLE}
      submitLabel={'Submit'}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <BankForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        bankNameRef={bankNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default BankCreate
