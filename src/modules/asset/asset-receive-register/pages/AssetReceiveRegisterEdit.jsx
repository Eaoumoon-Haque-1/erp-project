/** @file Edit-page controller for the API-backed Asset Receive Register. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assetReceivesApi } from '../../../../api/assetReceive'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { formatIsoDate } from '../../../../utils/dateFormat'
import AssetReceiveApiForm from '../components/AssetReceiveApiForm'
import {
  createSpecRow,
  mapAssetReceiveFromApi,
  mapAssetReceiveToApi,
} from '../data/assetReceiveApiMapper'
import { buildAssetReceiveOptions, findSelectedLocation } from '../data/assetReceiveOptions'
import { receiveBusinessGroup } from '../data/assetReceiveScope'
import useAssetReceiveForm from '../data/useAssetReceiveForm'
import useAssetReceiveReferences from '../data/useAssetReceiveReferences'
import {
  ASSET_RECEIVE_TABLE,
  calculateAmounts,
  createInitialAssetReceiveValues,
} from '../validation/assetReceiveApiValidation'

const listPath = '/asset/asset-receive-register'

function AssetReceiveRegisterEdit() {
  const { assetReceiveId } = useParams()
  const navigate = useNavigate()
  const firstFieldRef = useRef(null)
  const refsRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const form = useAssetReceiveForm(createInitialAssetReceiveValues(), refsRef)
  const { reset } = form
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(receiveBusinessGroup.ID, {
    preserveUnitId: form.values.BU_ID,
  })
  const refs = useAssetReceiveReferences({ buId: form.values.BU_ID })
  useEffect(() => {
    refsRef.current = refs
  })
  const location = findSelectedLocation(refs, form.values.LOCATION_ID)

  useEffect(() => {
    let active = true
    assetReceivesApi.get(assetReceiveId)
      .then((record) => {
        if (!active) return
        const { ID, SPECS, CAPITALIZED_COST, ...values } = mapAssetReceiveFromApi(record)
        void ID
        void CAPITALIZED_COST
        const loaded = { values, rows: SPECS.map(createSpecRow) }
        setOriginal(loaded)
        reset(loaded.values, loaded.rows)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Asset Receive.')
        navigate(listPath, { replace: true })
      })
    return () => {
      active = false
    }
  }, [assetReceiveId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetReceivesApi.update(assetReceiveId, mapAssetReceiveToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Asset Receive.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => firstFieldRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Receive Register Edit'}
      listTo={listPath}
      tableName={ASSET_RECEIVE_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <AssetReceiveApiForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        isEdit
        groupName={receiveBusinessGroup.GROUP_NAME}
        options={buildAssetReceiveOptions(refs, form.values)}
        referencesLoading={refs.loading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        businessUnitLocked
        amounts={calculateAmounts(form.values)}
        place={{ building: location?.BUILDING ?? '', floor: location?.FLOOR ?? '', room: location?.ROOM ?? '' }}
        today={formatIsoDate(new Date())}
        firstFieldRef={firstFieldRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default AssetReceiveRegisterEdit
