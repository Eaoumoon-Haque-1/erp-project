/** @file Create-page controller for Location Master. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import LocationMasterForm from '../components/LocationMasterForm'
import { mapLocationMasterToApi } from '../data/locationMasterApiMapper'
import {
  buildCustodianOptions,
  buildDepartmentOptions,
  buildSubCustodianOptions,
} from '../data/locationMasterOptions'
import { locationBusinessGroup } from '../data/locationMasterScope'
import useLocationMasterForm from '../data/useLocationMasterForm'
import useLocationReferences from '../data/useLocationReferences'
import { ASSET_LOCATION_TABLE, createInitialLocationMasterValues } from '../validation/locationMasterValidation'

const listPath = '/asset/location-master'

function LocationMasterCreate() {
  const navigate = useNavigate()
  const locationNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const form = useLocationMasterForm(createInitialLocationMasterValues())
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(locationBusinessGroup.ID)
  const refs = useLocationReferences({ buId: form.values.BU_ID, requireBu: true })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetLocationsApi.create(mapLocationMasterToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(createInitialLocationMasterValues())
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Location Master Create'}
      listTo={listPath}
      tableName={ASSET_LOCATION_TABLE}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <LocationMasterForm
        values={form.values}
        errors={form.errors}
        groupName={locationBusinessGroup.GROUP_NAME}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        custodianOptions={buildCustodianOptions(refs.custodians, form.values.CUSTODIAN_ID, refs.custodiansLoading)}
        custodiansLoading={refs.custodiansLoading}
        subCustodianOptions={buildSubCustodianOptions(refs.custodians, form.values.CUSTODIAN_ID, form.values.SUB_CUSTODIAN_ID, refs.custodiansLoading)}
        departmentOptions={buildDepartmentOptions(refs.departments, form.values.DEPT_ID, refs.departmentsLoading)}
        departmentsLoading={refs.departmentsLoading}
        locationNameRef={locationNameRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default LocationMasterCreate
