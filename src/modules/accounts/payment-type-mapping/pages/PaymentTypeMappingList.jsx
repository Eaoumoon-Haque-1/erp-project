/**
 * @file Payment Type and Payment Through Mapping List page.
 * Displays all mappings for the logged-in user's Business Unit with search filters and row actions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { paymentTypeMappingApi } from '../api/paymentTypeMappingApi'
import { mapMappingFromApi, mapMappingToApi } from '../data/paymentTypeMappingApiMapper'
import {
  PAYMENT_THROUGH_LOOKUP_CODE,
  PAYMENT_TYPE_FALLBACK_CODE,
  PAYMENT_TYPE_LOOKUP_CODE,
} from '../data/usePaymentTypeMappingForm'

const listPath = '/accounts/voucher-setup/payment-type-mapping'
const createPath = '/accounts/voucher-setup/payment-type-mapping/create'

const columns = [
  {
    key: 'PAYMENT_TYPE_VALUE',
    label: 'Payment Type',
    render: (value, row) => (
      <div className={'flex items-center gap-1.5'}>
        <span className={'font-medium text-gray-800'}>{value || '-'}</span>
        {row.PAYMENT_TYPE_CODE && (
          <span className={'px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 text-[10px] font-mono font-semibold'}>
            {row.PAYMENT_TYPE_CODE}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'PAYMENT_THROUGH_VALUE',
    label: 'Payment Through',
    render: (value, row) => (
      <div className={'flex items-center gap-1.5'}>
        <span className={'font-medium text-gray-800'}>{value || '-'}</span>
        {row.PAYMENT_THROUGH_CODE && (
          <span className={'px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-semibold'}>
            {row.PAYMENT_THROUGH_CODE}
          </span>
        )}
      </div>
    ),
  },
  { key: 'BUSINESS_UNIT', label: 'Business Unit' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[6px] py-[3px] text-xs font-bold leading-none text-white shadow-xs',
          String(value) === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function PaymentTypeMappingList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBusinessUnitId))
  const [paymentTypes, setPaymentTypes] = useState([])
  const [paymentThroughs, setPaymentThroughs] = useState([])

  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined

    let active = true

    Promise.all([
      paymentTypeMappingApi.list({ buId: sessionBusinessUnitId }),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
      afmLookupApi.list({ buId: sessionBusinessUnitId }).catch(() => null),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, sessionBusinessUnitId, 1)
        .catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_THROUGH_LOOKUP_CODE, sessionBusinessUnitId, 1)
        .catch(() => []),
    ])
      .then(async ([mappings, groups, units, lookupTypes, pTypes, pThroughs]) => {
        if (!active) return

        const hasLookupTypesList = Array.isArray(lookupTypes)
        const buLookupTypes = hasLookupTypesList
          ? lookupTypes.filter(
              (t) =>
                String(t.buId ?? t.BU_ID ?? '') === sessionBusinessUnitId &&
                String(t.status ?? t.STATUS ?? 1) === '1',
            )
          : []

        const allowedTypeIds = new Set(
          buLookupTypes.map((t) => String(t.id ?? t.ID ?? '')).filter(Boolean),
        )
        const allowedValueIds = new Set()
        buLookupTypes.forEach((t) => {
          ;(t.lookupValues || []).forEach((v) => {
            if (v?.id != null) allowedValueIds.add(String(v.id))
          })
        })

        const filterLookupValuesByBu = (items = []) =>
          (items || []).filter((item) => {
            const itemBuId = item?.buId ?? item?.BU_ID ?? item?.bu_id
            if (itemBuId != null && String(itemBuId) !== '') {
              return String(itemBuId) === sessionBusinessUnitId
            }
            if (hasLookupTypesList) {
              const itemTypeId =
                item?.typeNameId ??
                item?.TYPE_NAME_ID ??
                item?.typeId ??
                item?.TYPE_ID
              if (itemTypeId != null && String(itemTypeId) !== '') {
                return allowedTypeIds.has(String(itemTypeId))
              }
              if (item?.id != null) {
                return allowedValueIds.has(String(item.id))
              }
              return false
            }
            return true
          })

        let finalPTypes = filterLookupValuesByBu(pTypes)
        let finalPThroughs = filterLookupValuesByBu(pThroughs)

        if (finalPTypes.length === 0) {
          const fallbackPTypes = await afmLookupApi
            .getValuesByTypeCode(
              PAYMENT_TYPE_FALLBACK_CODE,
              sessionBusinessUnitId,
              1,
            )
            .catch(() => [])
          if (active && fallbackPTypes?.length) {
            finalPTypes = filterLookupValuesByBu(fallbackPTypes)
          }
        }
        if (!active) return

        setPaymentTypes(finalPTypes)
        setPaymentThroughs(finalPThroughs)

        const groupMap = new Map((groups || []).map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map((units || []).map((u) => [String(u.id), u.businessUnit]))

        const filteredMappings = (mappings || []).filter((m) => {
          const itemBuId = String(m.buId ?? m.BU_ID ?? '')
          const itemBgId = String(m.bgId ?? m.BG_ID ?? '')
          if (itemBuId !== sessionBusinessUnitId) return false
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) return false
          return true
        })

        setRows(
          filteredMappings.map((m) => mapMappingFromApi(m, groupMap, unitMap)),
        )
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Payment Type Mappings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  const paymentTypeOptions = useMemo(() => {
    const map = new Map()
    paymentTypes.forEach((item) => {
      const val = String(item.value ?? '').trim()
      if (val && !map.has(val.toLowerCase())) {
        map.set(val.toLowerCase(), {
          value: val,
          label: val,
          code: item.valueCode || '',
        })
      }
    })
    rows.forEach((row) => {
      const val = String(row.PAYMENT_TYPE_VALUE ?? '').trim()
      if (val && !map.has(val.toLowerCase())) {
        map.set(val.toLowerCase(), {
          value: val,
          label: val,
          code: row.PAYMENT_TYPE_CODE || '',
        })
      }
    })
    return Array.from(map.values())
  }, [paymentTypes, rows])

  const paymentThroughOptions = useMemo(() => {
    const map = new Map()
    paymentThroughs.forEach((item) => {
      const val = String(item.value ?? '').trim()
      if (val && !map.has(val.toLowerCase())) {
        map.set(val.toLowerCase(), {
          value: val,
          label: val,
          code: item.valueCode || '',
        })
      }
    })
    rows.forEach((row) => {
      const val = String(row.PAYMENT_THROUGH_VALUE ?? '').trim()
      if (val && !map.has(val.toLowerCase())) {
        map.set(val.toLowerCase(), {
          value: val,
          label: val,
          code: row.PAYMENT_THROUGH_CODE || '',
        })
      }
    })
    return Array.from(map.values())
  }, [paymentThroughs, rows])

  const filters = useMemo(
    () => [
      {
        key: 'PAYMENT_TYPE_VALUE',
        label: 'Search by Payment Type',
        placeholder: '--Search by Payment Type--',
        options: paymentTypeOptions,
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return (
            String(row.PAYMENT_TYPE_VALUE ?? '')
              .toLowerCase()
              .includes(query) ||
            String(row.PAYMENT_TYPE_CODE ?? '')
              .toLowerCase()
              .includes(query)
          )
        },
      },
      {
        key: 'PAYMENT_THROUGH_VALUE',
        label: 'Search by Payment Through',
        placeholder: '--Search by Payment Through--',
        options: paymentThroughOptions,
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return (
            String(row.PAYMENT_THROUGH_VALUE ?? '')
              .toLowerCase()
              .includes(query) ||
            String(row.PAYMENT_THROUGH_CODE ?? '')
              .toLowerCase()
              .includes(query)
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
    [paymentTypeOptions, paymentThroughOptions],
  )

  const handleDelete = async (row) => {
    try {
      await paymentTypeMappingApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Payment Type Mapping.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapMappingFromApi(await paymentTypeMappingApi.get(row.ID))
      const nextStatus = current.STATUS === '1' ? '0' : '1'
      const updated = await paymentTypeMappingApi.update(
        row.ID,
        mapMappingToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Mapping status.')
    }
  }

  return (
    <ListPage
      title={'Payment Type and Payment Through Mapping List'}
      createLabel={'New Mapping'}
      createTo={createPath}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${listPath}/${row.ID}/view`)}
          onEdit={() => navigate(`${listPath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default PaymentTypeMappingList
