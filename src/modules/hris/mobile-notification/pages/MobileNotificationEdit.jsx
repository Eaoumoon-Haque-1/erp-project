/** @file API-backed single-record Mobile Notification edit page. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { mobileNotificationsApi } from '../api/mobileNotificationApi'
import MobileNotificationForm from '../components/MobileNotificationForm'
import { mapMobileNotificationFromApi, mapMobileNotificationUpdateToApi, mobileNotificationFieldMap } from '../data/mobileNotificationApiMapper'
import { getMobileNotificationOptions, loadMobileNotificationReferences } from '../data/mobileNotificationReferences'
import { MOBILE_NOTIFICATION_TABLE, createInitialMobileNotificationValues, validateMobileNotification } from '../validation/mobileNotificationValidation'

const listPath = '/hris/hris-forms/mobile-notification'

function MobileNotificationEdit() {
  const { mobileNotificationId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(createInitialMobileNotificationValues)
  const [original, setOriginal] = useState(createInitialMobileNotificationValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(null)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([mobileNotificationsApi.get(mobileNotificationId), loadMobileNotificationReferences()])
      .then(([record, loaded]) => {
        if (!active) return
        const mapped = mapMobileNotificationFromApi(record, loaded)
        setReferences(loaded); setValues(mapped); setOriginal(mapped)
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Mobile Notification.'))
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [mobileNotificationId])

  const options = useMemo(() => getMobileNotificationOptions(
    references, values.BU_ID, values.DEPT_ID,
  ), [references, values.BU_ID, values.DEPT_ID])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }
  const handleTargetChange = (name, nextValue) => {
    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BU_ID') { next.DEPT_ID = []; next.EMPL_ID = []; next.NOTIFICATION_TYPE = '' }
      if (name === 'DEPT_ID') next.EMPL_ID = []
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
      await mobileNotificationsApi.update(mobileNotificationId, mapMobileNotificationUpdateToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Mobile Notification.', mobileNotificationFieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(original); setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return <FormPage title={'Mobile Notification Edit'} listTo={listPath}
    tableName={MOBILE_NOTIFICATION_TABLE} onSubmit={handleSubmit} onReset={handleReset}
    submitLabel={'Update'} submitting={submitting}>
    <MobileNotificationForm values={values} errors={errors} businessUnits={options.businessUnits}
      departments={options.departments} employees={options.employees} notificationTypes={options.notificationTypes}
      referencesLoading={referencesLoading} allowMultipleTargets={false} businessUnitRef={businessUnitRef}
      onChange={handleChange} onMultiSelectChange={handleTargetChange} />
  </FormPage>
}

export default MobileNotificationEdit
