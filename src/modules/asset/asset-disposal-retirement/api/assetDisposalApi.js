/** @file API client for Asset Disposal backend endpoints (/asset-disposals). */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-disposals'

export const assetDisposalApi = {
  ...createCrudApi(resourcePath),

  list(buId, disposalStatus) {
    const params = {}
    if (buId) params.buId = buId
    if (disposalStatus) params.disposalStatus = disposalStatus
    return unwrapApiResponse(apiClient.get(resourcePath, { params }))
  },

  submit(id) {
    return unwrapApiResponse(apiClient.patch(`${resourcePath}/${id}/submit`))
  },

  approve(id, approvedBy) {
    const params = approvedBy ? { approvedBy } : {}
    return unwrapApiResponse(apiClient.patch(`${resourcePath}/${id}/approve`, null, { params }))
  },

  reject(id) {
    return unwrapApiResponse(apiClient.patch(`${resourcePath}/${id}/reject`))
  },

  complete(id) {
    return unwrapApiResponse(apiClient.patch(`${resourcePath}/${id}/complete`))
  },

  cancel(id) {
    return unwrapApiResponse(apiClient.patch(`${resourcePath}/${id}/cancel`))
  },
}

