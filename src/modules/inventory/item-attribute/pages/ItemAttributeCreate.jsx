/**
 * @file Item Attribute Create page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { itemAttributeApi } from '../api/itemAttributeApi'
import ItemAttributeForm from '../components/ItemAttributeForm'
import { mapItemAttributeToApi } from '../data/itemAttributeApiMapper'
import {
  initialItemAttributeValues,
  validateItemAttribute,
} from '../validation/itemAttributeValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-attribute'

function ItemAttributeCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-attribute'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = session?.groupName || session?.businessGroupName || ''
  const sessionBuName = session?.businessUnitName || session?.buName || ''

  const [values, setValues] = useState(() => ({
    ...initialItemAttributeValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
    GROUP_NAME: sessionGroupName,
    BUSINESS_UNIT: sessionBuName,
  }))

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Ensure BG_ID is populated even if only buId is present in session
  useEffect(() => {
    if (!sessionGroupId && sessionBuId) {
      businessUnitsApi
        .get(sessionBuId)
        .then((bu) => {
          if (bu?.bgId) {
            setValues((prev) => ({
              ...prev,
              BG_ID: String(bu.bgId),
              GROUP_NAME: bu.groupName || prev.GROUP_NAME,
            }))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBuId])

  // Try fetching the next available attribute code as preview
  useEffect(() => {
    if (sessionBuId) {
      itemAttributeApi
        .getNextCode(sessionBuId)
        .then((res) => {
          if (res?.attributeCode) {
            setValues((prev) => (prev.ATTRIBUTE_CODE ? prev : { ...prev, ATTRIBUTE_CODE: res.attributeCode }))
          }
        })
        .catch(() => {})
    }
  }, [sessionBuId])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleValidate = () => {
    const validation = validateItemAttribute(values, { isEdit: false })
    if (!validation.isValid) {
      setErrors(validation.errors)
      showError('Please correct the highlighted form errors.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    if (!handleValidate()) return

    let submitBgId = sessionGroupId || values.BG_ID
    const submitBuId = sessionBuId || values.BU_ID

    if (!submitBgId && submitBuId) {
      try {
        const bu = await businessUnitsApi.get(submitBuId)
        if (bu?.bgId) {
          submitBgId = String(bu.bgId)
        }
      } catch {
        // proceed
      }
    }

    const submitValues = {
      ...values,
      BG_ID: submitBgId,
      BU_ID: submitBuId,
    }

    setSubmitting(true)
    try {
      const payload = mapItemAttributeToApi(submitValues)
      await itemAttributeApi.create(payload)
      showSuccess('Item Attribute created successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create item attribute.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialItemAttributeValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    })
    setErrors({})
  }

  return (
    <FormPage
      title={'New Item Attribute'}
      listTo={listPath}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemAttributeForm
        values={values}
        errors={errors}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemAttributeCreate

