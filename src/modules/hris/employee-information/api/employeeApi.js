/** @file Read-only Employee lookup used by User assignment workflows. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

export const employeesApi = {
  list: () => unwrapApiResponse(apiClient.get('/employees')),
}

