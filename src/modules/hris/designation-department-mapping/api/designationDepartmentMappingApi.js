/** @file Department–Designation mapping endpoint contract with optional Business Unit filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const designationDepartmentMappingsApi = {
  ...createCrudApi('/dept-desig-maps'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/dept-desig-maps', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
