/**
 * @file Item Create page with child Item Attributes support.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { assetUnitsOfMeasureApi } from '../../../procure-to-pay/asset-unit-of-measure/api/assetUnitOfMeasureApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { itemAttributeApi } from '../../item-attribute/api/itemAttributeApi'
import { itemBrandApi } from '../../item-brand/api/itemBrandApi'
import { itemCategoryApi } from '../../item-category/api/itemCategoryApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemApi } from '../api/itemApi'
import ItemForm from '../components/ItemForm'
import { mapItemToApi } from '../data/itemApiMapper'
import {
  createDefaultAttributeRow,
  initialItemValues,
  validateItem,
} from '../validation/itemValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item'

function ItemCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item'
    : defaultListPath

  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupName = session?.groupName || session?.businessGroupName || ''
  const sessionBuName = session?.businessUnitName || session?.buName || ''

  const [values, setValues] = useState(() => ({
    ...initialItemValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBuId,
    GROUP_NAME: sessionGroupName,
    BUSINESS_UNIT: sessionBuName,
  }))

  const [rows, setRows] = useState([createDefaultAttributeRow()])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])
  const [uomOptions, setUomOptions] = useState([])
  const [storeOptions, setStoreOptions] = useState([])
  const [attributeOptions, setAttributeOptions] = useState([])

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Ensure BG_ID is populated even if only buId is in session
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

  // Fetch dropdown options for the BU
  useEffect(() => {
    if (sessionBuId) {
      Promise.all([
        itemCategoryApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
        itemBrandApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
        assetUnitsOfMeasureApi.list(sessionBuId).catch(() => []),
        itemStoreApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
        itemAttributeApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
      ]).then(([cats, brands, uoms, stores, attrs]) => {
        setCategoryOptions(
          (cats || []).map((c) => ({
            value: String(c.id),
            label: c.categoryName ? `${c.categoryName} (${c.categoryCode})` : c.categoryCode,
            code: c.categoryCode,
          })),
        )
        setBrandOptions(
          (brands || []).map((b) => ({
            value: String(b.id),
            label: b.brandName ? `${b.brandName} (${b.brandCode})` : b.brandCode,
            code: b.brandCode,
          })),
        )
        setUomOptions(
          (uoms || []).map((u) => ({
            value: String(u.id),
            label: u.unitName || String(u.id),
          })),
        )
        setStoreOptions(
          (stores || []).map((s) => ({
            value: String(s.id),
            label: s.storeName ? `${s.storeName} (${s.storeCode})` : s.storeCode,
            code: s.storeCode,
          })),
        )
        setAttributeOptions(
          (attrs || []).map((a) => ({
            value: String(a.id),
            label: a.attributeName ? `${a.attributeName} (${a.attributeCode})` : a.attributeCode,
            code: a.attributeCode,
          })),
        )
      })
    }
  }, [sessionBuId])

  // Try fetching preview code
  useEffect(() => {
    if (sessionBuId) {
      itemApi
        .getNextCode(sessionBuId)
        .then((res) => {
          if (res?.itemCode) {
            setValues((prev) => (prev.ITEM_CODE ? prev : { ...prev, ITEM_CODE: res.itemCode }))
          }
        })
        .catch(() => {})
    }
  }, [sessionBuId])

  const handleChange = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'IS_WARRANTY_APPLICABLE' && String(value) !== '1') {
        next.WARRANTY_DAY = ''
        next.WARRANTY_CRITERIA = ''
      }
      return next
    })
    setErrors((prev) => {
      const copy = { ...prev }
      if (copy[field]) delete copy[field]
      if (field === 'IS_WARRANTY_APPLICABLE' && String(value) !== '1') {
        delete copy.WARRANTY_DAY
      }
      return copy
    })
  }

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r._ROW_ID === rowId ? { ...r, [field]: value } : r)),
    )
    if (errors.subRows?.[rowId]?.[field]) {
      setErrors((prev) => {
        const subRows = { ...(prev.subRows || {}) }
        const rowErr = { ...(subRows[rowId] || {}) }
        delete rowErr[field]
        if (Object.keys(rowErr).length === 0) {
          delete subRows[rowId]
        } else {
          subRows[rowId] = rowErr
        }
        return { ...prev, subRows }
      })
    }
  }

  const handleAddRow = () => {
    setRows((prev) => [...prev, createDefaultAttributeRow()])
  }

  const handleRemoveRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r._ROW_ID !== rowId))
    if (errors.subRows?.[rowId]) {
      setErrors((prev) => {
        const subRows = { ...(prev.subRows || {}) }
        delete subRows[rowId]
        return { ...prev, subRows }
      })
    }
  }

  const handleValidate = () => {
    const activeRows = rows.filter((r) => r.ATTRIBUTE_ID || r.PRICE || r.OPENING_STOCK)
    const validation = validateItem(values, activeRows, { isEdit: false })
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

    const validRows = rows.filter((r) => r.ATTRIBUTE_ID)

    setSubmitting(true)
    try {
      const payload = mapItemToApi(submitValues, validRows)
      await itemApi.create(payload)
      showSuccess('Item created successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to create item.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialItemValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBuId,
    })
    setRows([createDefaultAttributeRow()])
    setErrors({})
  }

  return (
    <FormPage
      title={'New Item'}
      listTo={listPath}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={handleValidate}
      submitting={submitting}
    >
      <ItemForm
        values={values}
        rows={rows}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        uomOptions={uomOptions}
        storeOptions={storeOptions}
        attributeOptions={attributeOptions}
        errors={errors}
        submitting={submitting}
        onChange={handleChange}
        onRowChange={handleRowChange}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemCreate

