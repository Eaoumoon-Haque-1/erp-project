/** @file User endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const usersApi = {
  ...createCrudApi('/users'),
  changeStatus: (id, status) =>
    unwrapApiResponse(apiClient.patch(`/users/${id}/status`, null, { params: { status } })),
}

