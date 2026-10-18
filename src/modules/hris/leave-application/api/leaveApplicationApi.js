/** @file Employee Leave (Leave Application) endpoint contract. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

const basePath = '/employee-leaves'

export const leaveApplicationsApi = {
  list: ({ view, businessUnitId, employeeId } = {}) => unwrapApiResponse(
    apiClient.get(basePath, {
      params: {
        ...(view ? { view } : {}),
        ...(businessUnitId ? { buId: businessUnitId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
    }),
  ),
  get: (id) => unwrapApiResponse(apiClient.get(`${basePath}/${id}`)),
  create: (payload, submit = false) => unwrapApiResponse(
    apiClient.post(basePath, payload, { params: { submit } }),
  ),
  update: (id, payload, submit = false) => unwrapApiResponse(
    apiClient.put(`${basePath}/${id}`, payload, { params: { submit } }),
  ),
  remove: (id) => unwrapApiResponse(apiClient.delete(`${basePath}/${id}`)),
  submit: (id) => unwrapApiResponse(apiClient.patch(`${basePath}/${id}/submit`)),
  calculate: ({ employeeId, leaveCategoryId, fromDate, toDate }) => unwrapApiResponse(
    apiClient.get(`${basePath}/calculate`, {
      params: { employeeId, leaveCategoryId, fromDate, toDate },
    }),
  ),
  availableCategories: (employeeId, year) => unwrapApiResponse(
    apiClient.get(`${basePath}/available-categories`, {
      params: { employeeId, ...(year ? { year } : {}) },
    }),
  ),
}
