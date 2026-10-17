/** @file Read-only Shift details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { shiftsApi } from '../api/shiftApi'
import { mapShiftFromApi } from '../data/shiftApiMapper'

const basePath = '/hris/attendance-settings/shift'

async function loadShift(id) {
  const [record, units] = await Promise.all([shiftsApi.get(id), businessUnitsApi.list()])
  const names = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
  return mapShiftFromApi(record, names)
}

const viewConfig = {
  title: 'Shift View',
  param: 'shiftId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadShift,
  fields: [
    { label: 'Business Unit', key: 'BUSINESS_UNIT_NAME' },
    { label: 'Shift Title', key: 'SHIFT_TITLE' },
    { label: 'Shift Start Time', key: 'SHIFT_START_TIME' },
    { label: 'Shift End Time', key: 'SHIFT_END_TIME' },
    { label: 'Weekend', key: 'WEEKEND' },
    { label: 'Grace Time (Minutes)', key: 'GRACE_TIME_MINUTES' },
    { label: 'Apply Late In', key: 'APPLY_LATE_IN', type: 'boolean' },
    { label: 'Late In Days', key: 'LATE_IN_DAYS' },
    { label: 'Late In Deduction', key: 'LATE_IN_DEDUCTION' },
    { label: 'Allow Late In Message', key: 'ALLOW_LATE_IN_MSG', type: 'boolean' },
    { label: 'Apply Early Out', key: 'APPLY_EARLY_OUT', type: 'boolean' },
    { label: 'Early Out Days', key: 'EARLY_OUT_DAYS' },
    { label: 'Early Out Deduction', key: 'EARLY_OUT_DEDUCTION' },
    { label: 'Allow Early Out Message', key: 'ALLOW_EARLY_OUT_MSG', type: 'boolean' },
    { label: 'Attendance In/Out Policy', key: 'ATTN_IN_OUT_POLICY', type: 'boolean' },
    { label: 'Start Before (Minutes)', key: 'START_BEFORE' },
    { label: 'Close After (Minutes)', key: 'CLOSE_AFTER' },
    { label: 'Do Not Allow Attendance', key: 'NOT_ALLOW_ATTN', type: 'boolean' },
    { label: 'In Time Start', key: 'IN_TIME_START' },
    { label: 'In Time Close', key: 'IN_TIME_CLOSE' },
    { label: 'Out Time Start', key: 'OUT_TIME_START' },
    { label: 'Out Time Close', key: 'OUT_TIME_CLOSE' },
    { label: 'Allow Next Day Attendance', key: 'ALLOW_NEXT_DAY_ATTN', type: 'boolean' },
    { label: 'Allow Overtime', key: 'ALLOW_OVERTIME', type: 'boolean' },
    { label: 'Maximum OT Hour', key: 'MAX_OT_HOUR' },
    { label: 'Extra OT Hour', key: 'EXTRA_OT_HOUR' },
    { label: 'Status', key: 'STATUS', type: 'status' },
  ],
}

function ShiftView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default ShiftView
