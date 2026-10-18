/** @file Employee Attendance Config CRUD endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const employeeAttendanceConfigsApi = {
  ...createCrudApi('/employee-attendance-configs'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/employee-attendance-configs', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
