/** @file API-backed list controller for Asset Book Register. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { assetBookRegisterApi } from '../api/assetBookRegisterApi'
import {
  mapAssetBookRegisterFromApi,
  mapAssetBookRegisterToApi,
} from '../data/assetBookRegisterApiMapper'
import { loadAssetBookRegisterReferences } from '../data/assetBookRegisterOptions'

const basePath = '/asset/asset-book-register'

const columns = [
  { key: 'ASSET_NO', label: 'Asset No', render: (val) => val || 'N/A' },
  { key: 'ASSET_ITEM_NAME', label: 'Asset Item' },
  { key: 'ASSET_UNIT', label: 'Unit' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner' },
  { key: 'ALLOCATION_REF_NAME', label: 'Employee Name' },
  { key: 'USAGE_STATUS', label: 'Usages Status' },
  { key: 'ASSET_CONDITION', label: 'Condition' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm ${
          String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'
        }`}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetBookRegisterList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  const effectiveGroupId = resolvedGroupId || sessionGroupId

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      loadAssetBookRegisterReferences(sessionBusinessUnitId, effectiveGroupId),
      assetBookRegisterApi.list(sessionBusinessUnitId),
    ])
      .then(([refs, records]) => {
        if (!active) return
        setReferences(refs)
        const mapped = (records || []).map((r) => mapAssetBookRegisterFromApi(r, refs))
        setRows(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Book Registers.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, effectiveGroupId])

  const filters = useMemo(
    () => [
      {
        key: 'ASSET_ITEM_ID',
        label: 'Filter by Asset Item',
        placeholder: '--Select Asset Item--',
        searchable: true,
        options: references.itemOptions || [],
        matches: (row, value) => {
          if (!value) return true
          return String(row.ASSET_ITEM_ID) === String(value)
        },
      },
      {
        key: 'ALLOCATION_REF_ID',
        label: 'Filter by Employee',
        placeholder: '--Select Employee--',
        searchable: true,
        options: references.employeeOptions || [],
        matches: (row, value) => {
          if (!value) return true
          return String(row.ALLOCATION_REF_ID) === String(value)
        },
      },
      {
        key: 'STATUS',
        label: 'Filter by Status',
        placeholder: '--Search by Status--',
        options: [
          { label: 'Active', value: '1' },
          { label: 'Inactive', value: '0' },
        ],
      },
    ],
    [references.itemOptions, references.employeeOptions],
  )

  const handleDelete = async (row) => {
    try {
      await assetBookRegisterApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Book Register.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const nextStatus = row.STATUS === '1' ? '0' : '1'
      const updated = await assetBookRegisterApi.changeStatus(row.ID, Number(nextStatus))
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? mapAssetBookRegisterFromApi(updated, references)
            : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Book Register List'}
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

export default AssetBookRegisterList
