/**
 * @file Bank Information Create page.
 * Manages bank master creation and repeatable branch/account rows.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
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
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const sessionValues = { BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }
  const form = useBankForm(
    { ...initialBankValues, ...sessionValues },
    [createInitialBankDetailRow()],
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
        ...sessionValues,
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
      onValidate={() => form.validate(sessionValues).isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <BankForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
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
