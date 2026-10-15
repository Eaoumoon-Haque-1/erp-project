/** @file API-backed Degree & Education Mapping list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { degreesApi } from '../api/degreeApi'
import { mapDegreeFromApi, mapDegreeToApi } from '../data/degreeApiMapper'

const basePath = '/hris/employee-settings/degree-education-mapping'

const columns = [
  { key: 'LEVEL_OF_EDU_NAME', label: 'Education Level' },
  { key: 'DEGREE_NAME', label: 'Degree Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>,
  },
]

function DegreeEducationMappingList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [levelOptions, setLevelOptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([degreesApi.list(), levelOfEducationsApi.list()])
      .then(([degrees, levels]) => {
        if (!active) return
        const levelNames = new Map(levels.map((level) => [String(level.id), level.levelOfEdu]))
        setRows(degrees.map((degree) => mapDegreeFromApi(degree, levelNames)))
        setLevelOptions(levels.map((level) => ({ value: String(level.id), label: level.levelOfEdu })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Degrees.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'LEVEL_OF_EDU_ID', label: 'Education Level', placeholder: '--Search by Education Level--', options: levelOptions },
    { key: 'DEGREE_NAME', label: 'Degree Name', placeholder: '--Search by Degree Name--', matches: (row, value) => row.DEGREE_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [levelOptions])

  const handleDelete = async (row) => {
    try {
      await degreesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Degree.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await degreesApi.update(row.ID, mapDegreeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }))
      setRows((current) => current.map((item) => item.ID === row.ID
        ? mapDegreeFromApi(updated, new Map([[row.LEVEL_OF_EDU_ID, row.LEVEL_OF_EDU_NAME]]))
        : item))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Degree status.')
    }
  }

  return (
    <ListPage title={'Degree & Education Mapping List'} createLabel={'New'} createTo={`${basePath}/create`} filters={filters} columns={columns} rows={rows} loading={loading} renderActions={(row) => (
      <ListRowActions row={row} onView={() => navigate(`${basePath}/${row.ID}/view`)} onEdit={() => navigate(`${basePath}/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    )} />
  )
}

export default DegreeEducationMappingList
