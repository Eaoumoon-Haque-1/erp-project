/** @file API-backed bulk Mobile Notification create page. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { mobileNotificationsApi } from '../api/mobileNotificationApi'
import MobileNotificationForm from '../components/MobileNotificationForm'
import { mapMobileNotificationCreateToApi, mobileNotificationFieldMap } from '../data/mobileNotificationApiMapper'
import { getMobileNotificationOptions, loadMobileNotificationReferences } from '../data/mobileNotificationReferences'
import { MOBILE_NOTIFICATION_TABLE, createInitialMobileNotificationValues, validateMobileNotification } from '../validation/mobileNotificationValidation'

const listPath = '/hris/hris-forms/mobile-notification'

function MobileNotificationCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(createInitialMobileNotificationValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    loadMobileNotificationReferences()
      .then((loaded) => { if (active) setReferences(loaded) })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Mobile Notification options.'))
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [])

  const options = useMemo(() => getMobileNotificationOptions(
    references, values.BU_ID, values.DEPT_ID,
  ), [references, values.BU_ID, values.DEPT_ID])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleMultiSelectChange = (name, nextValue) => {
    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BU_ID') {
        const nextOptions = getMobileNotificationOptions(references, nextValue, current.DEPT_ID)
        const departmentIds = new Set(nextOptions.departments.map((item) => item.value))
        next.DEPT_ID = current.DEPT_ID.filter((id) => departmentIds.has(id))
        const employeeIds = new Set(getMobileNotificationOptions(references, nextValue, next.DEPT_ID)
          .employees.map((item) => item.value))
        next.EMPL_ID = current.EMPL_ID.filter((id) => employeeIds.has(id))
        const typeIds = new Set(nextOptions.notificationTypes.map((item) => item.value))
        if (!typeIds.has(current.NOTIFICATION_TYPE)) next.NOTIFICATION_TYPE = ''
      }
      if (name === 'DEPT_ID') {
        const employeeIds = new Set(getMobileNotificationOptions(references, current.BU_ID, nextValue)
          .employees.map((item) => item.value))
        next.EMPL_ID = current.EMPL_ID.filter((id) => employeeIds.has(id))
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateMobileNotification(values)
    setValues(result.values); setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return false
    }
    setSubmitting(true)
    try {
      await mobileNotificationsApi.create(mapMobileNotificationCreateToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Mobile Notifications.', mobileNotificationFieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(createInitialMobileNotificationValues()); setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return <FormPage title={'Mobile Notification Create'} listTo={listPath}
    tableName={MOBILE_NOTIFICATION_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
    <MobileNotificationForm values={values} errors={errors} businessUnits={options.businessUnits}
      departments={options.departments} employees={options.employees} notificationTypes={options.notificationTypes}
      referencesLoading={referencesLoading} businessUnitRef={businessUnitRef}
      onChange={handleChange} onMultiSelectChange={handleMultiSelectChange} />
  </FormPage>
}

export default MobileNotificationCreate
