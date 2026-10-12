/** @file API-backed HR Lookup Value list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../api/hrLookupValueApi'
import {
  mapHrLookupValueFromApi,
  mapHrLookupValueToApi,
} from '../data/hrLookupValueApiMapper'

const basePath = '/hris/hr-lookup-settings/hr-lookup-value'

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'TYPE_NAME', label: 'Type' },
  { key: 'VALUE', label: 'Value' },
  { key: 'SORT_ORDER', label: 'Sort Order' },
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

function HrLookupValueList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const filters = useMemo(() => [
    {
      key: 'TYPE_ID',
      label: 'Search by Type',
      placeholder: '--Search by Type--',
      options: typeOptions,
    },
    {
      key: 'VALUE',
      label: 'Search by Value',
      placeholder: '--Search by Value--',
      matches: (row, value) => String(row.VALUE ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
    },
  ], [typeOptions])

  useEffect(() => {
    let active = true
    Promise.all([
      hrLookupValuesApi.list(),
      businessGroupsApi.list(),
      hrLookupTypesApi.list(),
    ])
      .then(([records, groups, types]) => {
        if (!active) return
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        const typeNames = new Map(types.map((type) => [String(type.id), type.typeName]))
        setTypeOptions(types.map((type) => ({ value: String(type.id), label: type.typeName })))
        setRows(records.map((record) => ({
          ...mapHrLookupValueFromApi(record),
          GROUP_NAME: groupNames.get(String(record.bgId)) || String(record.bgId ?? 'N/A'),
          TYPE_NAME: typeNames.get(String(record.typeId)) || String(record.typeId ?? 'N/A'),
        })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load HR Lookup Values.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (row) => {
    try {
      await hrLookupValuesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete HR Lookup Value.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await hrLookupValuesApi.update(
        row.ID,
        mapHrLookupValueToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID
          ? { ...item, ...mapHrLookupValueFromApi(updated) }
          : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update HR Lookup Value status.'))
    }
  }

  return (
    <ListPage
      title={'HR Lookup Value List'}
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

export default HrLookupValueList
