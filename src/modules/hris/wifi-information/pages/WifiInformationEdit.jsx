/** @file API-backed Wi-Fi Information edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { wifiInformationsApi } from '../api/wifiInformationApi'
import WifiInformationForm from '../components/WifiInformationForm'
import {
  mapWifiInformationFromApi,
  mapWifiInformationToApi,
} from '../data/wifiInformationApiMapper'
import {
  WIFI_INFORMATION_TABLE,
  initialWifiInformationValues,
  validateWifiInformation,
} from '../validation/wifiInformationValidation'

const listPath = '/hris/attendance-settings/wifi-information'

function WifiInformationEdit() {
  const { wifiInformationId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(initialWifiInformationValues)
  const [originalValues, setOriginalValues] = useState(initialWifiInformationValues)
  const [errors, setErrors] = useState({})
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [businessUnitsLoading, setBusinessUnitsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      wifiInformationsApi.get(wifiInformationId),
      businessUnitsApi.list(),
    ])
      .then(([record, businessUnits]) => {
        if (!active) return
        const mapped = mapWifiInformationFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setBusinessUnitOptions(businessUnits
          .filter((unit) => String(unit.status ?? 1) === '1' || String(unit.id) === mapped.BU_ID)
          .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Wi-Fi Information.')
      })
      .finally(() => {
        if (active) setBusinessUnitsLoading(false)
      })
    return () => { active = false }
  }, [wifiInformationId])

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
    const result = validateWifiInformation(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await wifiInformationsApi.update(
        wifiInformationId,
        mapWifiInformationToApi(result.values),
      )
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Wi-Fi Information.', {
        buId: 'BU_ID', wifiName: 'WIFI_NAME', macAddress: 'MAC_ADDRESS', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage
      title={'WiFi Information Edit'}
      listTo={listPath}
      tableName={WIFI_INFORMATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
    >
      <WifiInformationForm
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

export default WifiInformationEdit
