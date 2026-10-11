/** @file Edit-page controller for Custodian and its Sub Custodian rows. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { custodiansApi } from '../../../../api/custodian'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import CustodianForm from '../components/CustodianForm'
import {
  createSubCustodianRow,
  mapCustodianFromApi,
  mapCustodianToApi,
} from '../data/custodianApiMapper'
import { custodianBusinessGroup } from '../data/custodianScope'
import useCustodianForm from '../data/useCustodianForm'
import { ASSET_CUSTODIAN_TABLE, createInitialCustodianValues } from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianEdit() {
  const { custodianId } = useParams()
  const navigate = useNavigate()
  const custodianNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const form = useCustodianForm(createInitialCustodianValues())
  const { reset } = form
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(custodianBusinessGroup.ID, {
    preserveUnitId: form.values.BU_ID,
  })

  useEffect(() => {
    let active = true
    custodiansApi.get(custodianId)
      .then((record) => {
        if (!active) return
        const mapped = mapCustodianFromApi(record)
        const loaded = {
          values: {
            BG_ID: mapped.BG_ID,
            BU_ID: mapped.BU_ID,
            CUSTODIAN_NAME: mapped.CUSTODIAN_NAME,
            STATUS: mapped.STATUS,
          },
          rows: mapped.SUB_CUSTODIANS.map(createSubCustodianRow),
        }
        setOriginal(loaded)
        reset(loaded.values, loaded.rows)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Custodian.')
        navigate(listPath, { replace: true })
      })
    return () => {
      active = false
    }
  }, [custodianId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await custodiansApi.update(custodianId, mapCustodianToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Custodian.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Custodian Edit'}
      listTo={listPath}
      tableName={ASSET_CUSTODIAN_TABLE}
      submitLabel={'Update'}
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
        businessUnitLocked
        custodianNameRef={custodianNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default CustodianEdit
