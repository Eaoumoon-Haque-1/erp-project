/**
 * @file Loads every dropdown source Asset Receive needs for one Business Unit.
 * Calls run in parallel; a failed call yields an empty list and one alert.
 */
import { useEffect, useState } from 'react'
import { assetLocationsApi } from '../../../../api/assetLocation'
import {
  assetItemsApi,
  assetUomsApi,
  depriCategoriesApi,
  lookupTypesApi,
  lookupValuesApi,
} from '../../../../api/assetReferences'
import { custodiansApi } from '../../../../api/custodian'
import { departmentsApi } from '../../../../api/department'
import { getApiErrorMessage } from '../../../../api/errors'
import { suppliersApi } from '../../../../api/supplier'
import { mapCustodianFromApi } from '../../custodian/data/custodianApiMapper'
import { mapLocationMasterFromApi, mapDepartmentFromApi } from '../../location-master/data/locationMasterApiMapper'
import {
  mapCategoryRef,
  mapItemRef,
  mapLookupTypeRef,
  mapLookupValueRef,
  mapSupplierRef,
  mapUomRef,
} from './assetReceiveApiMapper'
import { receiveBusinessGroup } from './assetReceiveScope'

const EMPTY = {
  suppliers: [],
  items: [],
  uoms: [],
  currencies: [],
  warrantyTypes: [],
  lookupValues: [],
  custodians: [],
  locations: [],
  categories: [],
  departments: [],
}

export default function useAssetReceiveReferences({ buId = '' } = {}) {
  const key = String(buId ?? '')
  const [loaded, setLoaded] = useState({ key: null, data: EMPTY })

  useEffect(() => {
    if (!key) return undefined
    let active = true
    let firstError = null
    const safe = (request) => request.catch((error) => {
      firstError ??= error
      return []
    })
    // Currency / Warranty Type are lookup values of the type with that name.
    const valuesOfType = async (types, typeName) => {
      const type = types.find((item) => item.NAME.trim().toLowerCase() === typeName)
      return type ? safe(lookupValuesApi.list(key, Number(type.ID))) : []
    }

    Promise.all([
      safe(suppliersApi.list(key)),
      safe(assetItemsApi.list(key)),
      safe(assetUomsApi.list(key)),
      safe(lookupValuesApi.list(key)),
      safe(custodiansApi.list(key)),
      safe(assetLocationsApi.list(key)),
      safe(depriCategoriesApi.list(key)),
      safe(departmentsApi.listByGroup(Number(receiveBusinessGroup.ID))),
      safe(lookupTypesApi.list(key)).then(async (types) => {
        const mapped = types.map(mapLookupTypeRef)
        return Promise.all([valuesOfType(mapped, 'currency'), valuesOfType(mapped, 'warranty type')])
      }),
    ]).then(([suppliers, items, uoms, values, custodians, locations, categories, departments, [currencies, warrantyTypes]]) => {
      if (!active) return
      if (firstError) getApiErrorMessage(firstError, 'Unable to load some reference data.')
      setLoaded({
        key,
        data: {
          suppliers: suppliers.map(mapSupplierRef),
          items: items.map(mapItemRef),
          uoms: uoms.map(mapUomRef),
          currencies: currencies.map(mapLookupValueRef),
          warrantyTypes: warrantyTypes.map(mapLookupValueRef),
          lookupValues: values.map(mapLookupValueRef),
          custodians: custodians.map(mapCustodianFromApi),
          locations: locations.map(mapLocationMasterFromApi),
          categories: categories.map(mapCategoryRef),
          departments: departments.map(mapDepartmentFromApi),
        },
      })
    })
    return () => {
      active = false
    }
  }, [key])

  const current = loaded.key === key
  return { ...(current ? loaded.data : EMPTY), loading: Boolean(key) && !current }
}
