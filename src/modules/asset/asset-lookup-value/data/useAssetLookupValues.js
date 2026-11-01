/** @file Loads Business Unit scoped Asset Lookup Values for dependent Asset forms. */
import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../api/assetLookupValueApi'

export default function useAssetLookupValues() {
  const { session } = useAuth()
  const businessUnitId = String(session?.buId ?? '')
  const [lookupValues, setLookupValues] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupTypesApi.list(businessUnitId),
      assetLookupValuesApi.list({ businessUnitId }),
    ])
      .then(([types, values]) => {
        if (!active) return
        const typeNames = new Map(types.map((type) => [String(type.id), type.typeName]))
        setLookupValues(values.map((record) => ({
          ID: String(record.id ?? ''),
          TYPE_ID: String(record.typeId ?? ''),
          TYPE_NAME: typeNames.get(String(record.typeId)) || '',
          VALUE: record.value ?? '',
          VALUE_CODE: record.valueCode ?? '',
          SORT_ORDER: record.sortOrder == null ? '' : String(record.sortOrder),
          STATUS: String(record.status ?? 1),
        })))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Asset Lookup Values.'))
    return () => { active = false }
  }, [businessUnitId])

  return lookupValues
}
