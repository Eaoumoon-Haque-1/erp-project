/**
 * @file Item Category Create page.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { itemCategoryApi } from '../api/itemCategoryApi'
import ItemCategoryForm from '../components/ItemCategoryForm'
import { mapItemCategoryToApi } from '../data/itemCategoryApiMapper'
import {
  initialItemCategoryValues,
  validateItemCategory,
} from '../validation/itemCategoryValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item-category'

function ItemCategoryCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-category'
    : defaultListPath
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = session?.groupName || session?.businessGroupName || ''
  const sessionBuName = session?.businessUnitName || session?.buName || ''

  const [values, setValues] = useState(() => ({
    ...initialItemCategoryValues,
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

  // Try fetching the next available category code as preview
  useEffect(() => {
    if (sessionBuId) {
      itemCategoryApi
        .getNextCode(sessionBuId)
        .then((res) => {
          if (res?.categoryCode) {
            setValues((prev) => (prev.CATEGORY_CODE ? prev : { ...prev, CATEGORY_CODE: res.categoryCode }))
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
    const validation = validateItemCategory(values, { isEdit: false })
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
      const payload = mapItemCategoryToApi(submitValues)
      await itemCategoryApi.create(payload)
      showSuccess('Item Category created successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create item category.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialItemCategoryValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    })
    setErrors({})
  }

  return (
    <FormPage
      title={'New Item Category'}
      listTo={listPath}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemCategoryForm
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

export default ItemCategoryCreate

