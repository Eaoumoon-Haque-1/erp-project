/**
 * @file Voucher and Payment Type Mapping List page.
 * Displays all mappings with search filters and row actions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { voucherTypeMappingApi } from '../api/voucherTypeMappingApi'
import {
  PAYMENT_TYPE_FALLBACK_CODE,
  PAYMENT_TYPE_LOOKUP_CODE,
  VOUCHER_TYPE_LOOKUP_CODE,
} from '../data/useVoucherTypeMappingForm'
import { mapVoucherMappingFromApi, mapVoucherMappingToApi } from '../data/voucherTypeMappingApiMapper'

const listPath = '/accounts/voucher-setup/voucher-type-mapping'
const createPath = '/accounts/voucher-setup/voucher-type-mapping/create'

const columns = [
  {
    key: 'VOUCHER_TYPE_VALUE',
    label: 'Voucher Type',
    render: (value, row) => (
      <div className={'flex items-center gap-1.5'}>
        <span className={'font-medium text-gray-800'}>{value || '-'}</span>
        {row.VOUCHER_TYPE_CODE && (
          <span className={'px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 text-[10px] font-mono font-semibold'}>
            {row.VOUCHER_TYPE_CODE}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'PAYMENT_TYPE_VALUE',
    label: 'Payment Type',
    render: (value, row) => (
      <div className={'flex items-center gap-1.5'}>
        <span className={'font-medium text-gray-800'}>{value || '-'}</span>
        {row.PAYMENT_TYPE_CODE && (
          <span className={'px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-semibold'}>
            {row.PAYMENT_TYPE_CODE}
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

function VoucherTypeMappingList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [businessUnits, setBusinessUnits] = useState([])
  const [voucherTypes, setVoucherTypes] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])

  useEffect(() => {
    let active = true

    Promise.all([
      voucherTypeMappingApi.list(),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(VOUCHER_TYPE_LOOKUP_CODE, undefined, 1)
        .catch(() => []),
      afmLookupApi
        .getValuesByTypeCode(PAYMENT_TYPE_LOOKUP_CODE, undefined, 1)
        .catch(() => []),
    ])
      .then(async ([mappings, groups, units, vTypes, pTypes]) => {
        if (!active) return
        let finalPTypes = pTypes || []
        if (finalPTypes.length === 0) {
          const fallbackPTypes = await afmLookupApi
            .getValuesByTypeCode(PAYMENT_TYPE_FALLBACK_CODE, undefined, 1)
            .catch(() => [])
          if (active && fallbackPTypes?.length) finalPTypes = fallbackPTypes
        }
        if (!active) return
        setBusinessUnits(units)
        setVoucherTypes(vTypes || [])
        setPaymentTypes(finalPTypes)
        const groupMap = new Map(groups.map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map(units.map((u) => [String(u.id), u.businessUnit]))
        setRows(mappings.map((m) => mapVoucherMappingFromApi(m, groupMap, unitMap)))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Voucher Type Mappings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const businessUnitOptions = useMemo(
    () =>
      businessUnits.map((u) => ({
        value: String(u.id),
        label: u.businessUnit,
      })),
    [businessUnits],
  )

  const voucherTypeOptions = useMemo(() => {
    const map = new Map()
    voucherTypes.forEach((item) => {
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
      const val = String(row.VOUCHER_TYPE_VALUE ?? '').trim()
      if (val && !map.has(val.toLowerCase())) {
        map.set(val.toLowerCase(), {
          value: val,
          label: val,
          code: row.VOUCHER_TYPE_CODE || '',
        })
      }
    })
    return Array.from(map.values())
  }, [voucherTypes, rows])

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

  const filters = useMemo(
    () => [
      {
        key: 'VOUCHER_TYPE_VALUE',
        label: 'Search by Voucher Type',
        placeholder: '--Search by Voucher Type--',
        options: voucherTypeOptions,
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return (
            String(row.VOUCHER_TYPE_VALUE ?? '')
              .toLowerCase()
              .includes(query) ||
            String(row.VOUCHER_TYPE_CODE ?? '')
              .toLowerCase()
              .includes(query)
          )
        },
      },
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
        key: 'BU_ID',
        label: 'Search by Business Unit',
        placeholder: '--Search by Business Unit--',
        options: businessUnitOptions,
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
    [businessUnitOptions, voucherTypeOptions, paymentTypeOptions],
  )

  const handleDelete = async (row) => {
    try {
      await voucherTypeMappingApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Voucher Type Mapping.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapVoucherMappingFromApi(await voucherTypeMappingApi.get(row.ID))
      const nextStatus = current.STATUS === '1' ? '0' : '1'
      const updated = await voucherTypeMappingApi.update(
        row.ID,
        mapVoucherMappingToApi({ ...current, STATUS: nextStatus }),
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
      title={'Voucher and Payment Type Mapping List'}
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

export default VoucherTypeMappingList
