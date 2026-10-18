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
    || name.includes('calenderevent')
    || ((name.includes('calendar') || name.includes('calender')) && name.includes('day'))
  ))
}

/**
 * Return active calendar-event values belonging to the Business Group(s) of
 * the selected Business Units. Existing values can be included while editing
 * even when they have since been made inactive.
 */
export function getOfficeCalendarEventTypeOptions(
  references,
  selectedBusinessUnitIds = [],
  includeValueIds = [],
) {
  if (!references) return []

  const selectedUnitIds = new Set(selectedBusinessUnitIds.map(String))
  const selectedGroupIds = new Set(
    references.businessUnits
      .filter((unit) => selectedUnitIds.has(String(unit.id)))
      .map((unit) => String(unit.bgId ?? ''))
      .filter(Boolean),
  )
  const includedIds = new Set(includeValueIds.map(String))

  return references.eventTypes
    .filter((value) => selectedGroupIds.has(String(value.bgId ?? '')))
    .filter((value) => String(value.status ?? 1) === '1' || includedIds.has(String(value.id)))
    .map((value) => ({
      value: String(value.id),
      label: value.value,
    }))
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
    businessUnitNames: new Map(
      businessUnits.map((unit) => [String(unit.id), unit.businessUnit]),
    ),
    eventTypeNames: new Map(
      eventTypes.map((value) => [String(value.id), value.value]),
    ),
  }
}
