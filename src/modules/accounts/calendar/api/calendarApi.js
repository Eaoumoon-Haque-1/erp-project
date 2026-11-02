/**
 * @file API client for Accounting Calendar (AFM_CALENDAR & AFM_CALENDAR_MONTH).
 * Maps to backend AfmCalendarController at /api/v1/afm-calendars.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-calendars'
const crud = createCrudApi(RESOURCE_PATH)

export const calendarApi = {
  ...crud,

  /**
   * Retrieves all calendars with optional filtering.
   * @param {object} [params={}] Query params (bgId, buId, status)
   */
  list: (params = {}) =>
    unwrapApiResponse(
      apiClient.get(RESOURCE_PATH, {
        params:
          typeof params === 'object' && params !== null
            ? params
            : params
            ? { buId: params }
            : undefined,
      }),
    ),

  /**
   * Retrieves detail months for a calendar.
   * @param {number|string} calendarId
   */
  getMonths: (calendarId) =>
    unwrapApiResponse(apiClient.get(`${RESOURCE_PATH}/${calendarId}/months`)),

  /**
   * Adds an individual month to a calendar.
   */
  addMonth: (calendarId, payload) =>
    unwrapApiResponse(apiClient.post(`${RESOURCE_PATH}/${calendarId}/months`, payload)),

  /**
   * Updates an individual month of a calendar.
   */
  updateMonth: (calendarId, monthId, payload) =>
    unwrapApiResponse(apiClient.put(`${RESOURCE_PATH}/${calendarId}/months/${monthId}`, payload)),

  /**
   * Deletes an individual month from a calendar.
   */
  removeMonth: (calendarId, monthId) =>
    unwrapApiResponse(apiClient.delete(`${RESOURCE_PATH}/${calendarId}/months/${monthId}`)),
}

export default calendarApi

