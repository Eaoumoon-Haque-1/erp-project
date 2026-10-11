/**
 * @file List-page controller for Business Group.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessGroupsApi } from '../api/businessGroupApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  mapBusinessGroupFromApi,
  mapBusinessGroupToApi,
} from '../data/businessGroupApiMapper'

const businessGroupColumns = [
  {
    key: 'GROUP_NAME',
    label: 'Group Name',
  },
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

function BusinessGroupList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    businessGroupsApi
      .list()
      .then((records) => {
        if (active) setRows(records.map(mapBusinessGroupFromApi))
      })
      .catch((error) => {
        if (active) {
          setMessage(
            getApiErrorMessage(error, 'Unable to load Business Groups.'),
          )
        }
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
      await businessGroupsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Business Group.'))
    }
  }

  const handleStatusChange = async (row) => {
    const nextRow = {
      ...row,
      STATUS: row.STATUS === '1' ? '0' : '1',
    }

    try {
      const updated = await businessGroupsApi.update(
        row.ID,
        await mapBusinessGroupToApi(nextRow),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID ? mapBusinessGroupFromApi(updated) : item,
        ),
      )
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, 'Unable to update Business Group status.'),
      )
    }
  }

  return (
    <ListPage
      title={'Business Group List'}
      createLabel={'New'}
      createTo={'/super-admin/business-group/create'}
      columns={businessGroupColumns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() =>
            navigate(`/super-admin/business-group/${row.ID}/view`)
          }
          onEdit={() =>
            navigate(`/super-admin/business-group/${row.ID}/edit`)
          }
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default BusinessGroupList
