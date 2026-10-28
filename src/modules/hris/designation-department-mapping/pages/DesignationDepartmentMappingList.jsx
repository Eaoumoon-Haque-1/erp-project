/** @file API-backed Department–Designation mapping list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationsApi } from '../../designation/api/designationApi'
import { designationDepartmentMappingsApi } from '../api/designationDepartmentMappingApi'
import { mapDesignationDepartmentMappingFromApi, mapDesignationDepartmentMappingToApi } from '../data/designationDepartmentMappingApiMapper'

const basePath = '/hris/employee-settings/designation-department-mapping'
const columns = [
  { key: 'DEPARTMENT_NAME', label: 'Department Name' },
  { key: 'DESIGNATION_NAME', label: 'Designation Name' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function DesignationDepartmentMappingList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionGroupId || !sessionBusinessUnitId) return undefined

    let active = true
    Promise.all([
      designationDepartmentMappingsApi.list(sessionBusinessUnitId),
      departmentsApi.list(sessionGroupId),
      designationsApi.list(sessionGroupId),
    ]).then(([mappings, departments, designations]) => {
      if (!active) return
      const labels = {
        departmentNames: new Map(departments.map((row) => [String(row.id), row.departmentName])),
        designationNames: new Map(designations.map((row) => [String(row.id), row.designationName])),
      }
      setRows(mappings
        .filter((row) => (
          String(row.bgId) === sessionGroupId
          && String(row.buId) === sessionBusinessUnitId
        ))
        .map((row) => mapDesignationDepartmentMappingFromApi(row, labels)))
    }).catch((error) => {
      if (active) getApiErrorMessage(error, 'Unable to load Department–Designation mappings.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const filters = useMemo(() => [
    {
      key: 'DEPT_ID',
      label: 'Search by Department Name',
      placeholder: '--Search by Department Name--',
      searchable: true,
      options: [...new Map(rows
        .map((row) => [row.DEPT_ID, { value: row.DEPT_ID, label: row.DEPARTMENT_NAME }])).values()],
    },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])

  const handleDelete = async (row) => {
    try {
      await designationDepartmentMappingsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete mapping.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await designationDepartmentMappingsApi.update(row.ID, mapDesignationDepartmentMappingToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? { ...item, ...mapDesignationDepartmentMappingFromApi(updated), GROUP_NAME: item.GROUP_NAME, BUSINESS_UNIT: item.BUSINESS_UNIT, DEPARTMENT_NAME: item.DEPARTMENT_NAME, DESIGNATION_NAME: item.DESIGNATION_NAME }
        : item))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update mapping status.')
    }
  }

  return (
    <ListPage title={'Designation Department Mapping List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default DesignationDepartmentMappingList
