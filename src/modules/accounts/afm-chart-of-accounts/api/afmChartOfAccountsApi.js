/** @file AFM Chart of Accounts endpoint contract with Group, Unit, and Parent filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const afmChartOfAccountsApi = {
  ...createCrudApi('/afm-chart-of-accounts'),
  list: (params = {}) => unwrapApiResponse(apiClient.get('/afm-chart-of-accounts', {
    params: typeof params === 'object' && params !== null ? params : (params ? { bgId: params } : undefined),
  })),
  listByGroup: (businessGroupId) => unwrapApiResponse(apiClient.get('/afm-chart-of-accounts', {
    params: { bgId: businessGroupId },
  })),
  listByUnit: (businessUnitId) => unwrapApiResponse(apiClient.get('/afm-chart-of-accounts', {
    params: { buId: businessUnitId },
  })),
  listByGroupAndUnit: (businessGroupId, businessUnitId) => unwrapApiResponse(apiClient.get('/afm-chart-of-accounts', {
    params: { bgId: businessGroupId, buId: businessUnitId },
  })),
  listByParent: (parentId) => unwrapApiResponse(apiClient.get(`/afm-chart-of-accounts/parent/${parentId}`)),
}
