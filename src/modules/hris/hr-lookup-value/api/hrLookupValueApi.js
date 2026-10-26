/** @file HR Lookup Value CRUD and current filtered lookup endpoint contracts. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/hr-lookup-values'

export const hrLookupValuesApi = {
  ...createCrudApi(resourcePath),

  list: ({ businessGroupId, typeId } = {}) => unwrapApiResponse(
    apiClient.get(resourcePath, {
      params: {
        ...(businessGroupId ? { bgId: businessGroupId } : {}),
        ...(typeId ? { typeId } : {}),
      },
    }),
  ),

  getByTypeCode: (typeCode, { businessGroupId, activeOnly = true } = {}) => unwrapApiResponse(
    apiClient.get(`${resourcePath}/by-type-code/${encodeURIComponent(typeCode)}`, {
      params: {
        ...(businessGroupId ? { bgId: businessGroupId } : {}),
        activeOnly,
      },
    }),
  ),

  // Exact group/type IDs are preferred for group-scoped forms. Type code is
  // used when no group is known, with typeId as the legacy-code fallback.
  getByType: async (lookupType, options = {}) => {
    // Group-scoped consumers already know the exact type and group. Querying
    // with both IDs avoids ambiguity when legacy data contains similarly named
    // or duplicated lookup types.
    if (options.businessGroupId && lookupType?.id) {
      const values = await hrLookupValuesApi.list({
        businessGroupId: options.businessGroupId,
        typeId: lookupType.id,
      })
      return options.activeOnly === false
        ? values
        : values.filter((value) => String(value.status ?? 1) === '1')
    }

    const code = String(lookupType?.code ?? '').trim()
    if (code) {
      try {
        const values = await hrLookupValuesApi.getByTypeCode(code, options)
        if (values.length) return values
      } catch (error) {
        if (error?.response?.status !== 404) throw error
      }
    }

    const values = await hrLookupValuesApi.list({
      businessGroupId: options.businessGroupId,
      typeId: lookupType?.id,
    })
    return options.activeOnly === false
      ? values
      : values.filter((value) => String(value.status ?? 1) === '1')
  },

  getByTypesForBusinessGroups: async (
    lookupTypes,
    businessGroupIds,
    { activeOnly = true } = {},
  ) => {
    const types = [...new Map(
      (lookupTypes ?? []).filter((type) => type?.id != null)
        .map((type) => [String(type.id), type]),
    ).values()]
    const groupIds = [...new Set(
      (businessGroupIds ?? []).map(String).filter(Boolean),
    )]
    const scopes = groupIds.length ? groupIds : [undefined]
    const requests = types.flatMap((type) => (
      scopes.map((businessGroupId) => ({ type, businessGroupId }))
    ))
    const batches = await Promise.all(requests.map(({ type, businessGroupId }) => (
      hrLookupValuesApi.getByType(type, {
        businessGroupId,
        activeOnly,
      })
    )))

    // Some deployed backend versions return an empty array for a valid
    // bgId+typeId query. Fall back once to the unfiltered current endpoint and
    // apply the exact pair locally, without leaking values across groups.
    if (batches.some((batch) => batch.length === 0)) {
      const allValues = await hrLookupValuesApi.list()
      batches.forEach((batch, index) => {
        if (batch.length) return
        const { type, businessGroupId } = requests[index]
        batches[index] = allValues.filter((value) => (
          String(value.typeId) === String(type.id)
          && (!businessGroupId || String(value.bgId) === String(businessGroupId))
          && (activeOnly === false || String(value.status ?? 1) === '1')
        ))
      })
    }

    return [...new Map(
      batches.flat().map((value) => [String(value.id), value]),
    ).values()]
  },
}
