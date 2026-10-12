/**
 * @file List-page controller for HR Lookup Type.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { hrLookupTypesApi } from '../api/hrLookupTypeApi'
import {
  mapHrLookupTypeFromApi,
  mapHrLookupTypeToApi,
} from '../data/hrLookupTypeApiMapper'

const basePath = '/hris/hr-lookup-settings/hr-lookup-type'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'CODE',
    label: 'Search by Code',
    placeholder: '--Search by Code--',
    matches: (row, value) => String(row.CODE ?? '').toLowerCase().includes(value.toLowerCase()),
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
]

const columns = [
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'CODE', label: 'Code' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function HrLookupTypeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    hrLookupTypesApi.list()
      .then((records) => {
        if (active) setRows(records.map(mapHrLookupTypeFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load HR Lookup Types.'))
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
      await hrLookupTypesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete HR Lookup Type.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await hrLookupTypesApi.update(
        row.ID,
        mapHrLookupTypeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapHrLookupTypeFromApi(updated) : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update HR Lookup Type status.'))
    }
  }

  return (
    <ListPage
      title={'HR Lookup Type List'}
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

export default HrLookupTypeList
