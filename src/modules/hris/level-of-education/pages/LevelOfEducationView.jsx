/** @file Read-only Level of Education details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { levelOfEducationsApi } from '../api/levelOfEducationApi'

const basePath = '/hris/employee-settings/level-of-education'

const viewConfig = {
  title: 'Level of Education View',
  param: 'levelOfEducationId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: levelOfEducationsApi.get,
  fields: [
    { label: 'Level of Education', key: 'levelOfEdu' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function LevelOfEducationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default LevelOfEducationView
