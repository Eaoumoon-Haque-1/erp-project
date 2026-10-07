/** @file Create-page controller for Location Master. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import LocationMasterForm from '../components/LocationMasterForm'
import { getLocationMasterReferences, getSubCustodianOptions } from '../data/locationMasterOptions'
import { createLocationMaster, listLocationMasters } from '../data/locationMasterStore'
import { ASSET_LOCATION_TABLE, initialLocationMasterValues, validateLocationMaster } from '../validation/locationMasterValidation'

const listPath = '/asset/location-master'

function LocationMasterCreate() {
  const navigate = useNavigate()
  const locationNameRef = useRef(null)
  const [values, setValues] = useState(initialLocationMasterValues)
  const [errors, setErrors] = useState({})
  const references = getLocationMasterReferences()

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => {
      if (name === 'CUSTODIAN_ID') {
        const custodian = references.custodians.find((record) => record.ID === value)
        return { ...current, CUSTODIAN_ID: value, CUSTODIAN_NAME: custodian?.CUSTODIAN_NAME || '', SUB_CUSTODIAN_ID: '', SUB_CUSTODIAN_NAME: '' }
      }
      if (name === 'SUB_CUSTODIAN_ID') {
        const subCustodian = getSubCustodianOptions(current.CUSTODIAN_ID, references.custodians).find((record) => record.ID === value)
        return { ...current, SUB_CUSTODIAN_ID: value, SUB_CUSTODIAN_NAME: subCustodian?.SUB_CUSTODIAN_NAME || '' }
      }
      return { ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }
    })
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'CUSTODIAN_ID' ? { SUB_CUSTODIAN_ID: undefined } : {}),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateLocationMaster(values, listLocationMasters(), references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createLocationMaster(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialLocationMasterValues)
    setErrors({})
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage title={'Location Master Create'} listTo={listPath} tableName={ASSET_LOCATION_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <LocationMasterForm values={values} errors={errors} references={references} locationNameRef={locationNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default LocationMasterCreate
