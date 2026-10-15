/** @file API-backed Designation list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { designationsApi } from '../api/designationApi'
import { mapDesignationFromApi, mapDesignationToApi } from '../data/designationApiMapper'

const basePath = '/hris/employee-settings/designation'

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'DESIGNATION_NAME', label: 'Designation Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>,
  },
]

function DesignationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([designationsApi.list(), businessGroupsApi.list()])
      .then(([designations, groups]) => {
        if (!active) return
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        setRows(designations.map((designation) => mapDesignationFromApi(designation, groupNames)))
        setGroupOptions(groups.map((group) => ({ value: String(group.id), label: group.groupName })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Designations.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'BG_ID', label: 'Search by Group Name', placeholder: '--Search by Group Name--', options: groupOptions },
    { key: 'DESIGNATION_NAME', label: 'Search by Designation Name', placeholder: '--Search by Designation Name--', matches: (row, value) => row.DESIGNATION_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [groupOptions])

  const handleDelete = async (row) => {
    try {
      await designationsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Designation.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await designationsApi.update(row.ID, mapDesignationToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapDesignationFromApi(updated, new Map([[row.BG_ID, row.GROUP_NAME]]))
        : item))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Designation status.')
    }
  }

  return (
    <ListPage title={'Designation List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default DesignationList
