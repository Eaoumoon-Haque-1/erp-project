/** @file Department endpoint contract (read-only lookup for dropdowns). */
import apiClient from './client'
import { unwrapApiResponse } from './createCrudApi'

export const departmentsApi = {
  listByGroup: (bgId) => unwrapApiResponse(apiClient.get('/departments', { params: { bgId } })),
}
