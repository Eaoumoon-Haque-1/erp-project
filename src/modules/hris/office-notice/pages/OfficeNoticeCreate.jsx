/** @file API-backed Office Notice create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { officeNoticesApi } from '../api/officeNoticeApi'
import OfficeNoticeForm from '../components/OfficeNoticeForm'
import { mapOfficeNoticeToApi, officeNoticeFieldMap } from '../data/officeNoticeApiMapper'
import { OFFICE_NOTICE_TABLE, createInitialOfficeNoticeValues, validateOfficeNotice } from '../validation/officeNoticeValidation'

const listPath = '/hris/hris-forms/office-notice'

function OfficeNoticeCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(createInitialOfficeNoticeValues)
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
    const result = validateOfficeNotice(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return false
    }

    setSubmitting(true)
    try {
      await officeNoticesApi.create(mapOfficeNoticeToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Office Notice.', officeNoticeFieldMap)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialOfficeNoticeValues())
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage title={'Office Notice Create'} listTo={listPath} tableName={OFFICE_NOTICE_TABLE}
      onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <OfficeNoticeForm values={values} errors={errors} businessUnitOptions={businessUnitOptions}
        businessUnitsLoading={businessUnitsLoading} businessUnitRef={businessUnitRef} onChange={handleChange} />
    </FormPage>
  )
}

export default OfficeNoticeCreate
