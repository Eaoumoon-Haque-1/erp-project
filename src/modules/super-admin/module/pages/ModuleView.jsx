/** @file Read-only Module details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { modulesApi } from '../api/moduleApi'

const viewConfig = {
  title: 'Module View',
  param: 'moduleId',
  listTo: '/super-admin/menu-creation/module',
  editTo: (id) => `/super-admin/menu-creation/module/${id}/edit`,
  loader: modulesApi.get,
  fields: [
    { label: 'Module Name', key: 'moduleName' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function ModuleView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default ModuleView
