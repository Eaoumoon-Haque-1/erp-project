/** @file Degree master endpoint contract, optionally filtered by Level of Education. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const degreesApi = {
  ...createCrudApi('/degrees'),
  list: (levelOfEducationId) => unwrapApiResponse(apiClient.get('/degrees', {
    params: levelOfEducationId ? { levelOfEduId: levelOfEducationId } : undefined,
  })),
}
