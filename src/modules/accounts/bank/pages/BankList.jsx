/**
 * @file Bank Information List page.
 * Displays all bank records with search filters, account counts, and row actions.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { bankApi } from '../api/bankApi'
import { mapBankFromApi, mapBankToApi } from '../data/bankApiMapper'

const columns = [
  { key: 'BANK_NAME', label: 'Bank Name' },
  { key: 'SHORT_NAME', label: 'Short Name' },
  {
    key: 'ACTIVE_ACCOUNT_COUNT',
    label: 'Accounts',
    render: (value, row) => (
      <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700'}>
        <span className={'w-1.5 h-1.5 rounded-full bg-teal-500'} />
        {value} active / {row.ACCOUNT_COUNT || 0} total
      </span>
    ),
  },
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

function BankList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBusinessUnitId))

  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined

    let active = true

    Promise.all([
      bankApi.list({ buId: sessionBusinessUnitId }),
      businessGroupsApi.list().catch(() => []),
      businessUnitsApi.list().catch(() => []),
    ])
      .then(([banks, groups, units]) => {
        if (!active) return
        const groupMap = new Map(groups.map((g) => [String(g.id), g.groupName]))
        const unitMap = new Map(units.map((u) => [String(u.id), u.businessUnit]))
        const scopedBanks = (banks || []).filter((bank) => {
          if (String(bank.buId ?? bank.BU_ID ?? '') !== sessionBusinessUnitId) return false
          const bankBgId = String(bank.bgId ?? bank.BG_ID ?? '')
          if (sessionGroupId && bankBgId && bankBgId !== sessionGroupId) return false
          return true
        })
        setRows(scopedBanks.map((bank) => mapBankFromApi(bank, groupMap, unitMap)))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Bank records.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  // Distinct Bank names for the searchable (typeable) dropdown
  const bankNameOptions = useMemo(() => {
    const map = new Map()
    rows.forEach((row) => {
      const name = String(row.BANK_NAME ?? '').trim()
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { value: name, label: name })
      }
    })
    return Array.from(map.values())
  }, [rows])

  const filters = useMemo(
    () => [
      {
        key: 'BANK_NAME',
        label: 'Search by Bank Name',
        placeholder: '--Search by Bank Name--',
        options: bankNameOptions,
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.BANK_NAME ?? '').toLowerCase().includes(query)
        },
      },
      {
        key: 'SHORT_NAME',
        label: 'Search by Short Name',
        placeholder: 'Search by Short Name',
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.SHORT_NAME ?? '').toLowerCase().includes(query)
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
    [bankNameOptions],
  )

  const handleDelete = async (row) => {
    try {
      await bankApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Bank Information.')
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapBankFromApi(await bankApi.get(row.ID))
      const nextStatus = current.STATUS === '1' ? '0' : '1'
      const updated = await bankApi.update(
        row.ID,
        mapBankToApi({ ...current, STATUS: nextStatus }, current.BANK_DETAILS),
      )
      setRows((items) =>
        items.map((item) => (item.ID === row.ID ? { ...item, STATUS: String(updated.status ?? nextStatus) } : item)),
      )
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Bank status.')
    }
  }

  return (
    <ListPage
      title={'Bank Information List'}
      createLabel={'New Bank'}
      createTo={'/accounts/voucher-setup/bank/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/accounts/voucher-setup/bank/${row.ID}/view`)}
          onEdit={() => navigate(`/accounts/voucher-setup/bank/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default BankList
