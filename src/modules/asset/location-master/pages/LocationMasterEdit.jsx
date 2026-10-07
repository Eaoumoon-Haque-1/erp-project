/** @file Edit-page controller for temporary Location Master records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import LocationMasterForm from '../components/LocationMasterForm'
import { getLocationMasterReferences, getSubCustodianOptions } from '../data/locationMasterOptions'
import { getLocationMaster, listLocationMasters, updateLocationMaster } from '../data/locationMasterStore'
import { ASSET_LOCATION_TABLE, validateLocationMaster } from '../validation/locationMasterValidation'

const listPath = '/asset/location-master'

function LocationMasterEdit() {
  const { locationMasterId } = useParams()
  const navigate = useNavigate()
  const locationNameRef = useRef(null)
  const record = getLocationMaster(locationMasterId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getLocationMasterReferences()

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => {
      if (name === 'CUSTODIAN_ID') {
        const custodian = references.custodians.find((item) => item.ID === value)
        return { ...current, CUSTODIAN_ID: value, CUSTODIAN_NAME: custodian?.CUSTODIAN_NAME || '', SUB_CUSTODIAN_ID: '', SUB_CUSTODIAN_NAME: '' }
      }
      if (name === 'SUB_CUSTODIAN_ID') {
        const subCustodian = getSubCustodianOptions(current.CUSTODIAN_ID, references.custodians).find((item) => item.ID === value)
        return { ...current, SUB_CUSTODIAN_ID: value, SUB_CUSTODIAN_NAME: subCustodian?.SUB_CUSTODIAN_NAME || '' }
      }
      return { ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }
    })
    setErrors((current) => ({ ...current, [name]: undefined, ...(name === 'CUSTODIAN_ID' ? { SUB_CUSTODIAN_ID: undefined } : {}) }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listLocationMasters().filter((item) => item.ID !== record.ID)
    const result = validateLocationMaster(values, otherRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateLocationMaster(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage title={'Location Master Edit'} listTo={listPath} tableName={ASSET_LOCATION_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <LocationMasterForm values={values} errors={errors} references={references} locationNameRef={locationNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default LocationMasterEdit
