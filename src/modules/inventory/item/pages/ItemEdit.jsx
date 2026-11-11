/**
 * @file Item Edit page with master-detail child attributes.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { assetUnitsOfMeasureApi } from '../../../procure-to-pay/asset-unit-of-measure/api/assetUnitOfMeasureApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemAttributeApi } from '../../item-attribute/api/itemAttributeApi'
import { itemBrandApi } from '../../item-brand/api/itemBrandApi'
import { itemCategoryApi } from '../../item-category/api/itemCategoryApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemApi } from '../api/itemApi'
import ItemForm from '../components/ItemForm'
import { mapItemFromApi, mapItemToApi } from '../data/itemApiMapper'
import {
  createDefaultAttributeRow,
  initialItemValues,
  validateItem,
} from '../validation/itemValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item'

function ItemEdit() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item'
    : defaultListPath

  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [values, setValues] = useState(initialItemValues)
  const [rows, setRows] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [originalRecord, setOriginalRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  const [categoryOptions, setCategoryOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])
  const [uomOptions, setUomOptions] = useState([])
  const [storeOptions, setStoreOptions] = useState([])
  const [attributeOptions, setAttributeOptions] = useState([])

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      itemApi.get(itemId),
      itemCategoryApi.list({ buId: sessionBuId || undefined }).catch(() => []),
      itemBrandApi.list({ buId: sessionBuId || undefined }).catch(() => []),
      assetUnitsOfMeasureApi.list(sessionBuId || undefined).catch(() => []),
      itemStoreApi.list({ buId: sessionBuId || undefined }).catch(() => []),
      itemAttributeApi.list({ buId: sessionBuId || undefined }).catch(() => []),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, cats, brands, uoms, stores, attrs, users, employees]) => {
        if (!active) return

        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const catMap = new Map((cats || []).map((c) => [String(c.id), c.categoryName || '']))
        const brandMap = new Map((brands || []).map((b) => [String(b.id), b.brandName || '']))
        const uomMap = new Map((uoms || []).map((u) => [String(u.id), u.unitName || '']))
        const storeMap = new Map((stores || []).map((s) => [String(s.id), s.storeName || '']))
        const attrMap = new Map((attrs || []).map((a) => [String(a.id), a.attributeName || '']))

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

        setOriginalRecord(record)
        const mapped = mapItemFromApi(
          record,
          userMap,
          empMap,
          catMap,
          brandMap,
          uomMap,
          storeMap,
          attrMap,
        )

        setValues({
          ...mapped,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBuId || mapped.BU_ID,
        })
        setRows(
          mapped.ATTRIBUTE_DETAILS && mapped.ATTRIBUTE_DETAILS.length > 0
            ? mapped.ATTRIBUTE_DETAILS
            : [createDefaultAttributeRow()],
        )
        setAuditLog(mapped.AUDIT_LOG)
        setLoading(false)
      })
      .catch((err) => {
        if (active) {
          showError(getApiErrorMessage(err, 'Unable to load item.'))
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [itemId, sessionGroupId, sessionBuId])

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
    const validation = validateItem(values, activeRows, { isEdit: true })
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

    let submitBgId = sessionGroupId || values.BG_ID || originalRecord?.bgId
    const submitBuId = sessionBuId || values.BU_ID || originalRecord?.buId

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
      const payload = mapItemToApi(submitValues, validRows, originalRecord)
      await itemApi.update(itemId, payload)
      showSuccess('Item updated successfully!')
      navigate(listPath)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to update item.')
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalRecord) {
      const mapped = mapItemFromApi(originalRecord)
      setValues({
        ...mapped,
        BG_ID: sessionGroupId || mapped.BG_ID,
        BU_ID: sessionBuId || mapped.BU_ID,
      })
      setRows(
        mapped.ATTRIBUTE_DETAILS && mapped.ATTRIBUTE_DETAILS.length > 0
          ? mapped.ATTRIBUTE_DETAILS
          : [createDefaultAttributeRow()],
      )
      setAuditLog(mapped.AUDIT_LOG)
    }
    setErrors({})
  }

  if (loading) {
    return (
      <FormPage title={'Edit Item Information'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading item data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Edit Item: ${values.ITEM_NAME || ''}`}
      listTo={listPath}
      submitLabel={'Update'}
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
        auditLog={auditLog}
        submitting={submitting}
        isEdit={true}
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

export default ItemEdit

