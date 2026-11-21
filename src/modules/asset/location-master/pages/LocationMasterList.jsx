/**
 * @file List-page controller for API-backed Location Master records.
 * Records and dropdown options (Custodian, Sub Custodian, Department) strictly
 * come from the logged-in user's Group (bgId) and Business Unit (buId).
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { mapLocationMasterFromApi, mapLocationMasterToApi } from '../data/locationMasterApiMapper'
import useLocationReferences from '../data/useLocationReferences'

const columns = [
  { key: 'LOCATION_NAME', label: 'Location Name' },
  { key: 'LOCATION_CODE', label: 'Code' },
  { key: 'CUSTODIAN_NAME', label: 'Custodian' },
  { key: 'SUB_CUSTODIAN_NAME', label: 'Sub Custodian' },
  { key: 'DEPT_NAME', label: 'Department' },
  { key: 'PLACE', label: 'Building/Floor/Room' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function LocationMasterList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)

  // Resolve BG_ID if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  // References strictly scoped to logged-in user's business unit and group
  const { custodians, departments } = useLocationReferences({
    buId: sessionBusinessUnitId,
    groupId: resolvedGroupId || sessionGroupId,
  })

  useEffect(() => {
    let active = true
    setLoading(true)

    // Filtered by logged-in user's business unit from session data
    assetLocationsApi
      .list(sessionBusinessUnitId || undefined)
      .then((items) => {
        if (!active) return
        const mapped = (items || []).map((r) => mapLocationMasterFromApi(r))
        // Extra safeguard: exclude records belonging to other BUs/Groups
        const scoped = mapped.filter((record) => {
          const matchBu = sessionBusinessUnitId
            ? String(record.BU_ID) === sessionBusinessUnitId
            : true
          const matchBg = resolvedGroupId || sessionGroupId
            ? String(record.BG_ID) === String(resolvedGroupId || sessionGroupId)
            : true
          return matchBu && matchBg
        })
        setRecords(scoped)
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Locations.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, resolvedGroupId, sessionGroupId])

  // The API returns ids only; names are resolved from the loaded reference lists.
  const rows = useMemo(
    () =>
      records.map((record) => {
        const custodian = custodians.find((item) => item.ID === record.CUSTODIAN_ID)
        return {
          ...record,
          CUSTODIAN_NAME: custodian?.CUSTODIAN_NAME || '-',
          SUB_CUSTODIAN_NAME:
            custodian?.SUB_CUSTODIANS?.find((item) => item.ID === record.SUB_CUSTODIAN_ID)
              ?.SUB_CUSTODIAN_NAME || '-',
          DEPT_NAME: departments.find((item) => item.ID === record.DEPT_ID)?.NAME || '-',
          PLACE: [record.BUILDING, record.FLOOR, record.ROOM].filter(Boolean).join(' / ') || '-',
        }
      }),
    [records, custodians, departments],
  )

  // Filters with dropdowns strictly scoped to logged-in user's Group and BU
  // Individual Search Options with dropdown field including write enable option:
  // 1. Location Name
  const locationNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.LOCATION_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // 2. Custodian
  const custodianFilterOptions = useMemo(() => {
    return custodians
      .filter((c) => String(c.STATUS ?? '1') === '1')
      .map((c) => ({
        value: c.CUSTODIAN_NAME,
        label: c.CUSTODIAN_NAME,
        code: c.ID,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [custodians])

  // 3. Sub Custodian
  const subCustodianFilterOptions = useMemo(() => {
    const subMap = new Map()
    custodians.forEach((c) => {
      (c.SUB_CUSTODIANS || []).forEach((sub) => {
        const name = String(sub.SUB_CUSTODIAN_NAME ?? '').trim()
        if (name && !subMap.has(name.toLowerCase())) {
          subMap.set(name.toLowerCase(), { value: name, label: name, code: sub.ID })
        }
      })
    })
    rows.forEach((r) => {
      const name = String(r.SUB_CUSTODIAN_NAME ?? '').trim()
      if (name && name !== '-' && !subMap.has(name.toLowerCase())) {
        subMap.set(name.toLowerCase(), { value: name, label: name, code: r.SUB_CUSTODIAN_ID })
      }
    })
    return Array.from(subMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [custodians, rows])

  // 4. Department
  const departmentFilterOptions = useMemo(() => {
    return departments
      .filter((d) => String(d.STATUS ?? '1') === '1')
      .map((d) => ({
        value: d.NAME,
        label: d.NAME,
        code: d.ID,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [departments])

  const filters = useMemo(
    () => [
      {
        key: 'LOCATION_NAME',
        label: 'Search by Location Name',
        placeholder: '--Select/Write Location Name--',
        searchable: true,
        options: locationNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.LOCATION_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'CUSTODIAN_NAME',
        label: 'Search by Custodian',
        placeholder: '--Select/Write Custodian--',
        searchable: true,
        options: custodianFilterOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return (
            String(row.CUSTODIAN_NAME ?? '').toLowerCase().includes(q) ||
            String(row.CUSTODIAN_ID ?? '').toLowerCase() === q
          )
        },
      },
      {
        key: 'SUB_CUSTODIAN_NAME',
        label: 'Search by Sub Custodian',
        placeholder: '--Select/Write Sub Custodian--',
        searchable: true,
        options: subCustodianFilterOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return (
            String(row.SUB_CUSTODIAN_NAME ?? '').toLowerCase().includes(q) ||
            String(row.SUB_CUSTODIAN_ID ?? '').toLowerCase() === q
          )
        },
      },
      {
        key: 'DEPT_NAME',
        label: 'Search by Department',
        placeholder: '--Select/Write Department--',
        searchable: true,
        options: departmentFilterOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return (
            String(row.DEPT_NAME ?? '').toLowerCase().includes(q) ||
            String(row.DEPT_ID ?? '').toLowerCase() === q
          )
        },
      },
      {
        key: 'STATUS',
        label: 'Search by Status',
        placeholder: '--Search by Status--',
        options: [
          { label: 'Active', value: '1' },
          { label: 'Inactive', value: '0' },
        ],
      },
    ],
    [
      locationNameOptions,
      custodianFilterOptions,
      subCustodianFilterOptions,
      departmentFilterOptions,
    ],
  )

  const handleDelete = async (row) => {
    try {
      await assetLocationsApi.remove(row.ID)
      setRecords((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Location.')
    }
  }

  // The record is a flat object, so the row itself is the full PUT body.
  const handleStatusChange = async (row) => {
    try {
      const updated = await assetLocationsApi.update(
        row.ID,
        mapLocationMasterToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRecords((current) =>
        current.map((item) =>
          item.ID === row.ID ? mapLocationMasterFromApi(updated) : item,
        ),
      )
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Location status.')
    }
  }

  return (
    <ListPage
      title={'Location Master List'}
      createLabel={'New'}
      createTo={'/asset/location-master/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/location-master/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/location-master/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default LocationMasterList
