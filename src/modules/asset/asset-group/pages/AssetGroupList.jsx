/** @file API-backed list controller for Asset Group records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { assetGroupsApi } from '../api/assetGroupApi'
import {
  mapAssetGroupFromApi,
  mapAssetGroupToApi,
} from '../data/assetGroupApiMapper'

const columns = [
  { key: 'ASSET_GROUP', label: 'Asset Group' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetGroupList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetGroupsApi.list(sessionBusinessUnitId),
      departmentsApi.listByGroup(sessionGroupId),
    ])
      .then(([records, departments]) => {
        if (!active) return
        const departmentNames = new Map(departments.map((department) => [
          String(department.id),
          department.departmentName,
        ]))
        setRows(records.map((record) => mapAssetGroupFromApi(record, departmentNames)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Groups.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const filters = useMemo(() => [
    {
      key: 'ASSET_GROUP',
      label: 'Search by Asset Group',
      placeholder: '--Search by Asset Group--',
      matches: (row, value) => String(row.ASSET_GROUP ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'ASSET_OWNER_ID',
      label: 'Search by Asset Owner',
      placeholder: '--Search by Asset Owner--',
      options: [...new Map(rows.map((row) => [row.ASSET_OWNER_ID, {
        value: row.ASSET_OWNER_ID,
        label: row.ASSET_OWNER_NAME || `Department ${row.ASSET_OWNER_ID}`,
      }])).values()],
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [rows])

  const handleDelete = async (row) => {
    try {
      await assetGroupsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Group.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetGroupsApi.update(row.ID, mapAssetGroupToApi({
        ...row,
        STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID
          ? mapAssetGroupFromApi(updated, new Map([[row.ASSET_OWNER_ID, row.ASSET_OWNER_NAME]]))
          : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Group status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Group List'}
      createLabel={'New'}
      createTo={'/asset/asset-group/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-group/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-group/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetGroupList
