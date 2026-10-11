/**
 * Creates the standard list/get/create/update/delete API contract used by
 * feature repositories. Transport and authentication remain in client.js.
 */
import apiClient from './client'

const unwrap = (request) => request.then((response) => response.data)

export function createCrudApi(resourcePath) {
  return {
    list: () => unwrap(apiClient.get(resourcePath)),
    get: (id) => unwrap(apiClient.get(`${resourcePath}/${id}`)),
    create: (payload) => unwrap(apiClient.post(resourcePath, payload)),
    update: (id, payload) => unwrap(apiClient.put(`${resourcePath}/${id}`, payload)),
    remove: (id) => unwrap(apiClient.delete(`${resourcePath}/${id}`)),
  }
}

export { unwrap as unwrapApiResponse }
