/** @file API-backed list controller for Asset Specification Mapping. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
import { mapAssetSpecificationMapFromApi, mapAssetSpecificationMapToApi } from '../data/assetSpecificationMapApiMapper'
import { loadAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'

const basePath = '/asset/asset-specification-map'
const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item Name' },
  { key: 'SPECIFICATION_NAME', label: 'Specification' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetSpecificationMapList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState({ assetItems: [], specificationOptions: [] })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetSpecificationMapReferences(sessionBusinessUnitId),
      assetSpecificationMapsApi.list({ businessUnitId: sessionBusinessUnitId }),
    ])
      .then(([refs, records]) => {
        if (!active) return
        setReferences(refs)
        setRows(records
          .map((record) => mapAssetSpecificationMapFromApi(record, refs))
          .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Specification Mappings.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

  // Asset Item Name options for searchable dropdown with write enable option
  const assetItemOptions = useMemo(() => {
    const itemMap = new Map()
    ;(references.assetItems || []).forEach((item) => {
      const name = String(item.ITEM_NAME ?? '').trim()
      if (name && !itemMap.has(name.toLowerCase())) {
        itemMap.set(name.toLowerCase(), { value: name, label: name, code: item.ID })
      }
    })
    rows.forEach((row) => {
      const name = String(row.ITEM_NAME_LABEL ?? '').trim()
      if (name && !itemMap.has(name.toLowerCase())) {
        itemMap.set(name.toLowerCase(), { value: name, label: name, code: row.ITEM_NAME })
      }
    })
    return Array.from(itemMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [references.assetItems, rows])

  // Specification options for searchable dropdown with write enable option
  const specificationOptions = useMemo(() => {
    const specMap = new Map()
    ;(references.specificationOptions || []).forEach((spec) => {
      const name = String(spec.label ?? spec.value ?? '').trim()
      if (name && !specMap.has(name.toLowerCase())) {
        specMap.set(name.toLowerCase(), { value: name, label: name })
      }
    })
    rows.forEach((row) => {
      const name = String(row.SPECIFICATION_NAME ?? '').trim()
      if (name && !specMap.has(name.toLowerCase())) {
        specMap.set(name.toLowerCase(), { value: name, label: name })
      }
    })
    return Array.from(specMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [references.specificationOptions, rows])

  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME_LABEL',
      label: 'Search by Asset Item Name',
      placeholder: '--Select/Write Asset Item Name--',
      searchable: true,
      options: assetItemOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return (
          String(row.ITEM_NAME_LABEL ?? '').toLowerCase().includes(q) ||
          String(row.ITEM_NAME ?? '').toLowerCase() === q
        )
      },
    },
    {
      key: 'SPECIFICATION_NAME',
      label: 'Search by Specification',
      placeholder: '--Select/Write Specification--',
      searchable: true,
      options: specificationOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return (
          String(row.SPECIFICATION_NAME ?? '').toLowerCase().includes(q) ||
          String(row.SPECIFICATION ?? '').toLowerCase() === q
        )
      },
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [assetItemOptions, specificationOptions])

  const handleDelete = async (row) => {
    try {
      await assetSpecificationMapsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Specification Mapping.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetSpecificationMapsApi.update(row.ID, mapAssetSpecificationMapToApi({
        ...row, STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID
          ? mapAssetSpecificationMapFromApi(updated, {
            assetItems: [{ ID: row.ITEM_NAME, ITEM_NAME: row.ITEM_NAME_LABEL }],
          })
          : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Specification Mapping status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Specification Mapping List'}
      createLabel={'New'}
      createTo={`${basePath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetSpecificationMapList
