/** @file Employee master and employee-profile endpoint contracts. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

const employeePath = '/employees'
const unwrap = unwrapApiResponse

export const employeesApi = {
  list: () => unwrap(apiClient.get(employeePath)),
  get: (id) => unwrap(apiClient.get(`${employeePath}/${id}`)),
  create: (payload) => unwrap(apiClient.post(employeePath, payload)),
  update: (id, payload) => unwrap(apiClient.put(`${employeePath}/${id}`, payload)),
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

