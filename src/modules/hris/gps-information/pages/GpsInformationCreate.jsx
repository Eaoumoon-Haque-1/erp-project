/** @file API-backed GPS Information create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { gpsInformationsApi } from '../api/gpsInformationApi'
import GpsInformationForm from '../components/GpsInformationForm'
import { mapGpsInformationToApi } from '../data/gpsInformationApiMapper'
import {
  GPS_INFO_TABLE,
  initialGpsInformationValues,
  validateGpsInformation,
} from '../validation/gpsInformationValidation'

const listPath = '/hris/attendance-settings/gps-information'

function GpsInformationCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(initialGpsInformationValues)
  const [errors, setErrors] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [businessUnitsLoading, setBusinessUnitsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    businessUnitsApi.list()
      .then((records) => {
        if (!active) return
        setBusinessUnitOptions(records
          .filter((unit) => String(unit.status ?? 1) === '1')
          .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Business Units.')
      })
      .finally(() => {
        if (active) setBusinessUnitsLoading(false)
      })
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateGpsInformation(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await gpsInformationsApi.create(mapGpsInformationToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create GPS Information.', {
        buId: 'BU_ID', locationName: 'LOCATION_NAME', latitude: 'LATITUDE', longitude: 'LONGITUDE', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialGpsInformationValues)
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage title={'GPS Information Create'} listTo={listPath} tableName={GPS_INFO_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <GpsInformationForm
        values={values}
        errors={errors}
        businessUnitOptions={businessUnitOptions}
        businessUnitsLoading={businessUnitsLoading}
        onChange={handleChange}
        businessUnitRef={businessUnitRef}
      />
    </FormPage>
  )
}

export default GpsInformationCreate
