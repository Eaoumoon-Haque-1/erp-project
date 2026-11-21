/**
 * @file Create-page controller for Custodian and its Sub Custodian rows.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { custodiansApi } from '../../../../api/custodian'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import CustodianForm from '../components/CustodianForm'
import { createSubCustodianRow, mapCustodianToApi } from '../data/custodianApiMapper'
import useCustodianForm from '../data/useCustodianForm'
import { ASSET_CUSTODIAN_TABLE, createInitialCustodianValues } from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const custodianNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)

  const form = useCustodianForm(
    {
      ...createInitialCustodianValues(),
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    },
    [createSubCustodianRow()],
  )

  // Ensure BG_ID is populated if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  // Sync session buId and bgId into form values
  useEffect(() => {
    if (sessionBusinessUnitId || resolvedGroupId) {
      form.handleChange({
        target: {
          name: 'BU_ID',
          value: sessionBusinessUnitId || form.values.BU_ID,
        },
      })
      if (resolvedGroupId) {
        form.handleChange({
          target: {
            name: 'BG_ID',
            value: resolvedGroupId,
          },
        })
      }
    }
  }, [sessionBusinessUnitId, resolvedGroupId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await custodiansApi.create(
        mapCustodianToApi(result.values, result.rows, {
          bgId: resolvedGroupId || sessionGroupId || result.values.BG_ID,
          buId: sessionBusinessUnitId || result.values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Custodian.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(
      {
        ...createInitialCustodianValues(),
        BG_ID: resolvedGroupId || sessionGroupId,
        BU_ID: sessionBusinessUnitId,
      },
      [createSubCustodianRow()],
    )
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Custodian Create'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      tableName={ASSET_CUSTODIAN_TABLE}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <CustodianForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        submitLabel={'Save'}
        submitting={submitting}
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
