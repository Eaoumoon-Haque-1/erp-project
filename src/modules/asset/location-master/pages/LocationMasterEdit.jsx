/** @file Edit-page controller for Location Master. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import LocationMasterForm from '../components/LocationMasterForm'
import { mapLocationMasterFromApi, mapLocationMasterToApi } from '../data/locationMasterApiMapper'
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

function LocationMasterEdit() {
  const { locationMasterId } = useParams()
  const navigate = useNavigate()
  const locationNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const form = useLocationMasterForm(createInitialLocationMasterValues())
  const { reset } = form
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(locationBusinessGroup.ID, {
    preserveUnitId: form.values.BU_ID,
  })
  const refs = useLocationReferences({ buId: form.values.BU_ID, requireBu: true })

  useEffect(() => {
    let active = true
    assetLocationsApi.get(locationMasterId)
      .then((record) => {
        if (!active) return
        const { ID, ...values } = mapLocationMasterFromApi(record)
        void ID
        setOriginal(values)
        reset(values)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Location.')
        navigate(listPath, { replace: true })
      })
    return () => {
      active = false
    }
  }, [locationMasterId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetLocationsApi.update(locationMasterId, mapLocationMasterToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original)
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Location Master Edit'}
      listTo={listPath}
      tableName={ASSET_LOCATION_TABLE}
      submitLabel={'Update'}
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
        businessUnitLocked
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

export default LocationMasterEdit
