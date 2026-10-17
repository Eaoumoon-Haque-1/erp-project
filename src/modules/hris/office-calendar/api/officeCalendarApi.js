/** @file Office Calendar CRUD endpoint contract with optional list filters. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const officeCalendarsApi = {
  ...createCrudApi('/office-calendars'),
  list: ({ buId, year } = {}) => unwrapApiResponse(apiClient.get('/office-calendars', {
    params: {
      ...(buId ? { buId } : {}),
      ...(year ? { year } : {}),
    },
  })),
}
