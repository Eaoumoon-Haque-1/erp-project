/** @file Read-only Leave Allocation details loaded from related APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { employmentTypesApi } from '../../../hris/employment-type/api/employmentTypeApi'
import { leaveTypesApi } from '../../../hris/leave-type/api/leaveTypeApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { leaveAllocationsApi } from '../api/leaveAllocationApi'
import { mapLeaveAllocationFromApi } from '../data/leaveAllocationApiMapper'

const basePath = '/hris/leave-settings/leave-allocation'

async function loadLeaveAllocation(id) {
  const [record, businessUnits, employmentTypes, leaveTypes] = await Promise.all([
    leaveAllocationsApi.get(id),
    businessUnitsApi.list(),
    employmentTypesApi.list(),
    leaveTypesApi.list(),
  ])
  return mapLeaveAllocationFromApi(record, {
    businessUnitNames: new Map(businessUnits.map((unit) => [String(unit.id), unit.businessUnit])),
    employmentTypeNames: new Map(employmentTypes.map((type) => [String(type.id), type.typeName])),
    leaveCategoryNames: new Map(leaveTypes.map((type) => [String(type.id), type.typeName])),
  })
}

const viewConfig = {
  title: 'Leave Allocation View',
  param: 'leaveAllocationId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadLeaveAllocation,
  fields: [
    { label: 'Business Unit', key: 'BUSINESS_UNIT' },
    { label: 'Employee Type', key: 'EMPLOYEE_TYPE' },
    { label: 'Leave Category', key: 'LEAVE_CATEGORY' },
    { label: 'Total Leave Days', key: 'TOTAL_LEAVE_DAYS' },
    { label: 'Year', key: 'LEAVE_YEAR' },
    { label: 'Sandwich Leave Applicable', key: 'SANDWICH_LEAVE_APPLICABLE', type: 'boolean' },
    { label: 'With Pay', key: 'WITH_PAY', type: 'boolean' },
    { label: 'Status', key: 'STATUS', type: 'status' },
  ],
}

function LeaveAllocationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default LeaveAllocationView
