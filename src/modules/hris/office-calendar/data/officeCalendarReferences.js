/** @file Loads real Business Unit and HR lookup options for Office Calendar. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../../hr-lookup-value/api/hrLookupValueApi'

const normalized = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

function isCalendarEventType(type) {
  const names = [normalized(type.typeName), normalized(type.code)]
  return names.some((name) => (
    name === 'eventtype'
    || name.includes('calendarevent')
    || (name.includes('calendar') && name.includes('day'))
  ))
}

export async function loadOfficeCalendarReferences() {
  const [businessUnits, lookupTypes, lookupValues] = await Promise.all([
    businessUnitsApi.list(),
    hrLookupTypesApi.list(),
    hrLookupValuesApi.list(),
  ])
  const eventTypeIds = new Set(
    lookupTypes.filter(isCalendarEventType).map((type) => String(type.id)),
  )
  const eventTypes = lookupValues
    .filter((value) => eventTypeIds.has(String(value.typeId)))
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))

  return {
    businessUnits,
    eventTypes,
    businessUnitOptions: businessUnits
      .filter((unit) => String(unit.status ?? 1) === '1')
      .map((unit) => ({ value: String(unit.id), label: unit.businessUnit })),
    eventTypeOptions: eventTypes
      .filter((value) => String(value.status ?? 1) === '1')
      .map((value) => ({
      value: String(value.id),
      label: value.value,
      })),
    businessUnitNames: new Map(
      businessUnits.map((unit) => [String(unit.id), unit.businessUnit]),
    ),
    eventTypeNames: new Map(
      eventTypes.map((value) => [String(value.id), value.value]),
    ),
  }
}
