/** @file Employee master and employee-profile endpoint contracts. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

const employeePath = '/employees'
const unwrap = unwrapApiResponse

export const employeesApi = {
  list: (paramsOrBuId) => {
    let params = undefined
    if (typeof paramsOrBuId === 'object' && paramsOrBuId !== null) {
      params = paramsOrBuId
    } else if (paramsOrBuId) {
      params = { buId: paramsOrBuId }
    }
    return unwrap(apiClient.get(employeePath, { params }))
  },
  get: (id) => unwrap(apiClient.get(`${employeePath}/${id}`)),
  create: (payload) => unwrap(apiClient.post(employeePath, payload)),
  update: (id, payload) => unwrap(apiClient.put(`${employeePath}/${id}`, payload)),
  remove: (id) => unwrap(apiClient.delete(`${employeePath}/${id}`)),
  // Uploads the image file; the response is { url }, the only thing stored on the employee.
  uploadPhoto: (file) => {
    const body = new FormData()
    body.append('file', file)
    // The client defaults to application/json, which makes axios turn FormData into JSON
    // (the file is lost). Overriding it lets the browser send a real multipart body.
    return unwrap(apiClient.post('/files/employee-photos', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }))
  },
  updateStatus: (id, status) => unwrap(apiClient.patch(
    `${employeePath}/${id}/status`,
    null,
    { params: { status: Number(status) } },
  )),
}

const profileResource = (employeeId, resource) => `${employeePath}/${employeeId}/${resource}`

export const employeeProfilesApi = {
  getEducations: (employeeId) => unwrap(apiClient.get(profileResource(employeeId, 'educations'))),
  saveEducations: (employeeId, rows) => unwrap(apiClient.put(profileResource(employeeId, 'educations'), rows)),
  getTrainings: (employeeId) => unwrap(apiClient.get(profileResource(employeeId, 'trainings'))),
  saveTrainings: (employeeId, rows) => unwrap(apiClient.put(profileResource(employeeId, 'trainings'), rows)),
  getCertifications: (employeeId) => unwrap(apiClient.get(profileResource(employeeId, 'certifications'))),
  saveCertifications: (employeeId, rows) => unwrap(apiClient.put(profileResource(employeeId, 'certifications'), rows)),
  getJobExperiences: (employeeId) => unwrap(apiClient.get(profileResource(employeeId, 'job-experiences'))),
  saveJobExperiences: (employeeId, rows) => unwrap(apiClient.put(profileResource(employeeId, 'job-experiences'), rows)),
}
