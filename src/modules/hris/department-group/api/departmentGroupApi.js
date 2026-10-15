/** @file Department-to-Business-Unit assignment endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const departmentGroupsApi = {
  ...createCrudApi('/department-groups'),
  list: (departmentId) => unwrapApiResponse(apiClient.get('/department-groups', {
    params: departmentId ? { deptId: departmentId } : undefined,
  })),
}
