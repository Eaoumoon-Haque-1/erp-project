/** @file Standard read-only Degree & Education Mapping view page. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { degreesApi } from '../api/degreeApi'

const basePath = '/hris/employee-settings/degree-education-mapping'

const viewConfig = {
  title: 'Degree & Education Mapping View',
  param: 'degreeId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: async (id) => {
    const [degree, levels] = await Promise.all([degreesApi.get(id), levelOfEducationsApi.list()])
    return {
      ...degree,
      levelOfEducationName: levels.find((level) => String(level.id) === String(degree.levelOfEduId))?.levelOfEdu,
    }
  },
  fields: [
    { label: 'Level of Education', key: 'levelOfEducationName' },
    { label: 'Degree Name', key: 'degreeName' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function DegreeEducationMappingView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default DegreeEducationMappingView
