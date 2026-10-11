/**
 * @file List-page controller for Module.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { modulesApi } from '../api/moduleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mapModuleFromApi, mapModuleToApi } from '../data/moduleApiMapper'

const filters = [
  {
    key: 'MODULE_NAME',
    label: 'Search by Module Name',
    placeholder: '--Search by Module Name--',
    matches: (row, value) => String(row.MODULE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
  { key: 'MODULE_NAME', label: 'Module Name' },
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

function ModuleList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    modulesApi.list()
      .then((records) => {
        if (active) setRows(records.map(mapModuleFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Modules.'))
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
      await modulesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Module.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await modulesApi.update(
        row.ID,
        mapModuleToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID ? mapModuleFromApi(updated) : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Module status.'))
    }
  }

  return (
    <ListPage
      title={'Module List'}
      createLabel={'New'}
      createTo={'/super-admin/menu-creation/module/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/super-admin/menu-creation/module/${row.ID}/view`)}
          onEdit={() => navigate(`/super-admin/menu-creation/module/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default ModuleList
