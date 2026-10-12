/** @file Create-page controller for the API-backed Asset Receive Register. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetReceivesApi } from '../../../../api/assetReceive'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { formatIsoDate } from '../../../../utils/dateFormat'
import AssetReceiveApiForm from '../components/AssetReceiveApiForm'
import { mapAssetReceiveToApi } from '../data/assetReceiveApiMapper'
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

function AssetReceiveRegisterCreate() {
  const navigate = useNavigate()
  const firstFieldRef = useRef(null)
  const refsRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const form = useAssetReceiveForm(createInitialAssetReceiveValues(), refsRef)
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(receiveBusinessGroup.ID)
  const refs = useAssetReceiveReferences({ buId: form.values.BU_ID })
  useEffect(() => {
    refsRef.current = refs
  })
  const location = findSelectedLocation(refs, form.values.LOCATION_ID)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetReceivesApi.create(mapAssetReceiveToApi(result.values, result.rows))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Asset Receive.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(createInitialAssetReceiveValues(), [])
    requestAnimationFrame(() => firstFieldRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Receive Register Create'}
      listTo={listPath}
      tableName={ASSET_RECEIVE_TABLE}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <AssetReceiveApiForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        groupName={receiveBusinessGroup.GROUP_NAME}
        options={buildAssetReceiveOptions(refs, form.values)}
        referencesLoading={refs.loading}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
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

export default AssetReceiveRegisterCreate
