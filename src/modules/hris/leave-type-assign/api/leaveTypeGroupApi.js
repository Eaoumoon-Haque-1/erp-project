/** @file Leave Type-to-Business-Unit assignment CRUD contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const leaveTypeGroupsApi = {
  ...createCrudApi('/leave-type-groups'),
  list: (leaveTypeId) => unwrapApiResponse(apiClient.get('/leave-type-groups', {
    params: leaveTypeId ? { leaveTypeId } : undefined,
  })),
}
