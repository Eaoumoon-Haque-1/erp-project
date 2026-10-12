/** @file API-backed Level of Education list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { levelOfEducationsApi } from '../api/levelOfEducationApi'
import {
  mapLevelOfEducationFromApi,
  mapLevelOfEducationToApi,
} from '../data/levelOfEducationApiMapper'

const basePath = '/hris/employee-settings/level-of-education'

const filters = [
  {
    key: 'LEVEL_OF_EDU',
    label: 'Level of Education',
    placeholder: '--Search by Level of Education--',
    matches: (row, value) => String(row.LEVEL_OF_EDU ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Status',
    placeholder: '--Search by Status--',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  },
]

const columns = [
  { key: 'LEVEL_OF_EDU', label: 'Level of Education' },
  { key: 'SHORT_NAME', label: 'Short Name' },
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

function LevelOfEducationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    levelOfEducationsApi.list()
      .then((records) => {
        if (active) setRows(records.map(mapLevelOfEducationFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Levels of Education.'))
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
      await levelOfEducationsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Level of Education.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await levelOfEducationsApi.update(
        row.ID,
        mapLevelOfEducationToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapLevelOfEducationFromApi(updated) : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Level of Education status.'))
    }
  }

  return (
    <ListPage
      title={'Level of Education List'}
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

export default LevelOfEducationList
