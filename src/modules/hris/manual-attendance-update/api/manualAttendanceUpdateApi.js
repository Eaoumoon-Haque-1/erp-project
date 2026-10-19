/** @file Manual Attendance Update CRUD contract from Swagger. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const manualAttendanceUpdatesApi = {
  ...createCrudApi('/manual-attendance-updates'),
  list: ({ buId, attenDate } = {}) => unwrapApiResponse(apiClient.get('/manual-attendance-updates', {
    params: {
      ...(buId ? { buId } : {}),
      ...(attenDate ? { attenDate } : {}),
    },
  })),
}
