/**
 * @file Bank Information Edit page.
 * Loads bank master and its detail accounts by ID, allowing edits and row modifications.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { bankApi } from '../api/bankApi'
import BankForm from '../components/BankForm'
import { mapBankFromApi, mapBankToApi } from '../data/bankApiMapper'
import useBankForm from '../data/useBankForm'
import { AFM_BANK_TABLE, initialBankValues } from '../validation/bankValidation'

const listPath = '/accounts/voucher-setup/bank'

function BankEdit() {
  const { bankId } = useParams()
  const navigate = useNavigate()
  const bankNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const form = useBankForm(initialBankValues, [])
  const { reset } = form

  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } =
    useBusinessOptions(form.values.BG_ID, {
      preserveUnitId: form.values.BU_ID,
      loadUnits: true,
    })

  useEffect(() => {
    let active = true
    bankApi
      .get(bankId)
      .then((record) => {
        if (!active) return
        const mapped = mapBankFromApi(record)
        const loaded = {
          values: {
            ID: mapped.ID,
            BG_ID: mapped.BG_ID,
            BU_ID: mapped.BU_ID,
            BANK_NAME: mapped.BANK_NAME,
            SHORT_NAME: mapped.SHORT_NAME,
            STATUS: mapped.STATUS,
          },
          rows: mapped.BANK_DETAILS,
        }
        setOriginal(loaded)
        reset(loaded.values, loaded.rows)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Bank Information.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [bankId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await bankApi.update(bankId, mapBankToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Bank Information.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => bankNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Bank Information Edit'}
      listTo={listPath}
      tableName={AFM_BANK_TABLE}
      submitLabel={'Update'}
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

export default BankEdit
