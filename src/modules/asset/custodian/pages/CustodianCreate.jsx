/** @file Create-page controller for Custodian and its Sub Custodian rows. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { custodiansApi } from '../../../../api/custodian'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import CustodianForm from '../components/CustodianForm'
import { mapCustodianToApi } from '../data/custodianApiMapper'
import { custodianBusinessGroup } from '../data/custodianScope'
import useCustodianForm from '../data/useCustodianForm'
import { ASSET_CUSTODIAN_TABLE, createInitialCustodianValues } from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianCreate() {
  const navigate = useNavigate()
  const custodianNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const form = useCustodianForm(createInitialCustodianValues())
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(custodianBusinessGroup.ID)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await custodiansApi.create(mapCustodianToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Custodian.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(createInitialCustodianValues(), [])
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Custodian Create'}
      listTo={listPath}
      tableName={ASSET_CUSTODIAN_TABLE}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <CustodianForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        groupName={custodianBusinessGroup.GROUP_NAME}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        custodianNameRef={custodianNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default CustodianCreate
