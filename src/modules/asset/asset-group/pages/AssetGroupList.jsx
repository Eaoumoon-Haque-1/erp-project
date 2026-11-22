/** @file API-backed list controller for Asset Group records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { departmentGroupsApi } from '../../../hris/department-group/api/departmentGroupApi'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { assetGroupsApi } from '../api/assetGroupApi'
import {
  mapAssetGroupFromApi,
  mapAssetGroupToApi,
} from '../data/assetGroupApiMapper'

const columns = [
  { key: 'ASSET_GROUP', label: 'Asset Group' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetGroupList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

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

  const effectiveGroupId = resolvedGroupId || sessionGroupId

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      assetGroupsApi.list(sessionBusinessUnitId),
      departmentsApi.listByGroup(effectiveGroupId).catch(() => []),
      departmentGroupsApi.list().catch(() => []),
    ])
      .then(([records, departments, departmentGroups]) => {
        if (!active) return

        // Asset owners are departments actively mapped to logged-in BU via HR_DEPT_GROUP
        const allowedDeptIds = new Set(
          (departmentGroups || [])
            .filter((g) => {
              const matchBu = sessionBusinessUnitId ? String(g.buId) === sessionBusinessUnitId : true
              const matchBg = effectiveGroupId ? String(g.bgId) === effectiveGroupId : true
              const activeStatus = String(g.status ?? '1') === '1'
              return matchBu && matchBg && activeStatus
            })
            .map((g) => String(g.deptId)),
        )

        // General map for resolving any assigned department names on records
        const departmentNames = new Map((departments || []).map((department) => [
          String(department.id),
          department.departmentName,
        ]))

        // Department options for search dropdown strictly scoped to user's BU & BG
        const scopedDeptOptions = (departments || [])
          .filter((d) => {
            const activeStatus = String(d.status ?? 1) === '1'
            const inBuGroup = allowedDeptIds.size > 0 ? allowedDeptIds.has(String(d.id)) : true
            return activeStatus && inBuGroup
          })
          .map((d) => ({ value: String(d.id), label: d.departmentName }))

        setDepartmentOptions(scopedDeptOptions)

        const mapped = (records || []).map((record) => mapAssetGroupFromApi(record, departmentNames))
        // Extra safeguard: exclude records belonging to other BUs/Groups
        const scoped = mapped.filter((record) => {
          const matchBu = sessionBusinessUnitId
            ? String(record.BU_ID) === sessionBusinessUnitId
            : true
          const matchBg = effectiveGroupId
            ? String(record.BG_ID) === String(effectiveGroupId)
            : true
          return matchBu && matchBg
        })
        setRows(scoped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Groups.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId, effectiveGroupId])

  // 1. Asset Group options for searchable dropdown with write enable option
  const assetGroupOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.ASSET_GROUP ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // 2. Asset Owner options for searchable dropdown with write enable option (scoped to user's BU & BG)
  const assetOwnerOptions = useMemo(() => {
    const ownerMap = new Map()
    // First from scoped active department options
    departmentOptions.forEach((opt) => {
      const label = String(opt.label ?? '').trim()
      if (label && !ownerMap.has(label.toLowerCase())) {
        ownerMap.set(label.toLowerCase(), { value: label, label, code: opt.value })
      }
    })
    // Also include any assigned owner name in rows
    rows.forEach((row) => {
      const name = String(row.ASSET_OWNER_NAME ?? '').trim()
      if (name && name !== '-' && name !== 'N/A' && !ownerMap.has(name.toLowerCase())) {
        ownerMap.set(name.toLowerCase(), { value: name, label: name, code: row.ASSET_OWNER_ID })
      }
    })
    return Array.from(ownerMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [departmentOptions, rows])

  // Individual Search options:
  // 1. Asset Group with dropdown field including write enable option
  // 2. Asset Owner with dropdown field including write enable option
  // 3. Status with dropdown field
  const filters = useMemo(() => [
    {
      key: 'ASSET_GROUP',
      label: 'Search by Asset Group',
      placeholder: '--Select/Write Asset Group--',
      searchable: true,
      options: assetGroupOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return String(row.ASSET_GROUP ?? '').toLowerCase().includes(q)
      },
    },
    {
      key: 'ASSET_OWNER_NAME',
      label: 'Search by Asset Owner',
      placeholder: '--Select/Write Asset Owner--',
      searchable: true,
      options: assetOwnerOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return (
          String(row.ASSET_OWNER_NAME ?? '').toLowerCase().includes(q) ||
          String(row.ASSET_OWNER_ID ?? '').toLowerCase() === q
        )
      },
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [assetGroupOptions, assetOwnerOptions])

  const handleDelete = async (row) => {
    try {
      await assetGroupsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Group.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetGroupsApi.update(row.ID, mapAssetGroupToApi({
        ...row,
        STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID
          ? mapAssetGroupFromApi(updated, new Map([[row.ASSET_OWNER_ID, row.ASSET_OWNER_NAME]]))
          : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Group status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Group List'}
      createLabel={'New'}
      createTo={'/asset/asset-group/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-group/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-group/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetGroupList
