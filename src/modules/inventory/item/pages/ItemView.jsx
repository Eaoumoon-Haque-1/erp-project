/**
 * @file Item View (Read-Only) page with child Item Attributes.
 */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { assetUnitsOfMeasureApi } from '../../../procure-to-pay/asset-unit-of-measure/api/assetUnitOfMeasureApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { itemAttributeApi } from '../../item-attribute/api/itemAttributeApi'
import { itemBrandApi } from '../../item-brand/api/itemBrandApi'
import { itemCategoryApi } from '../../item-category/api/itemCategoryApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemApi } from '../api/itemApi'
import ItemForm from '../components/ItemForm'
import { mapItemFromApi } from '../data/itemApiMapper'
import { initialItemValues } from '../validation/itemValidation'

const defaultListPath = '/procure-to-pay/procurement-settings/item'

function ItemView() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item'
    : defaultListPath

  const [values, setValues] = useState(initialItemValues)
  const [rows, setRows] = useState([])
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  const [categoryOptions, setCategoryOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])
  const [uomOptions, setUomOptions] = useState([])
  const [storeOptions, setStoreOptions] = useState([])
  const [attributeOptions, setAttributeOptions] = useState([])

  useEffect(() => {
    let active = true

    Promise.all([
      itemApi.get(itemId),
      itemCategoryApi.list().catch(() => []),
      itemBrandApi.list().catch(() => []),
      assetUnitsOfMeasureApi.list().catch(() => []),
      itemStoreApi.list().catch(() => []),
      itemAttributeApi.list().catch(() => []),
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

        setValues(mapped)
        setRows(mapped.ATTRIBUTE_DETAILS || [])
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
  }, [itemId])

  if (loading) {
    return (
      <FormPage title={'View Item'} listTo={listPath} hideActions>
        <div className={'py-12 text-center text-xs text-gray-500'}>
          Loading item data...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Item: ${values.ITEM_NAME || ''}`}
      listTo={listPath}
      hideActions
    >
      <ItemForm
        values={values}
        rows={rows}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        uomOptions={uomOptions}
        storeOptions={storeOptions}
        attributeOptions={attributeOptions}
        auditLog={auditLog}
        readOnly={true}
        onEdit={() => navigate(`${listPath}/${itemId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default ItemView

