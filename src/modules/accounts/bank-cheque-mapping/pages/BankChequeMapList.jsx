/**
 * @file Bank Cheque Mapping List page.
 * Displays all cheque mappings with filters and CRUD operations.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { confirmAction, showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { bankApi } from '../../bank/api/bankApi'
import { bankChequeMapApi } from '../api/bankChequeMapApi'
import { mapChequeMapToForm } from '../data/bankChequeMapApiMapper'

const listPath = '/accounts/voucher-setup/bank-cheque-mapping'
const createPath = '/accounts/voucher-setup/bank-cheque-mapping/create'

function getChequeStatusBadge(status) {
  const s = String(status || 'Not Use').toLowerCase()
  if (s === 'used') {
    return 'bg-emerald-600 text-white'
  }
  if (s === 'void') {
    return 'bg-rose-600 text-white'
  }
  return 'bg-sky-600 text-white'
}

const columns = [
  {
    key: 'BANK_NAME',
    label: 'Bank Name',
    render: (value) => <span className={'font-medium text-gray-800'}>{value || '-'}</span>,
  },
  {
    key: 'ACCOUNT_NUMBER',
    label: 'Bank Account No',
    render: (value, row) => (
      <div>
        <span className={'font-semibold text-gray-800'}>{value || '-'}</span>
        {row.BRANCH_NAME && (
          <span className={'block text-[11px] text-gray-500'}>Branch: {row.BRANCH_NAME}</span>
        )}
      </div>
    ),
  },
  {
    key: 'CHEQUE_NO',
    label: 'Cheque No.',
    render: (value) => (
      <span className={'font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'CHEQUE_NO_FROM',
    label: 'From Cheque',
  },
  {
    key: 'CHEQUE_NO_TO',
    label: 'To Cheque',
  },
  {
    key: 'CHEQUE_STATUS',
    label: 'Cheque Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none shadow-xs',
          getChequeStatusBadge(value),
        ].join(' ')}
      >
        {value || 'Not Use'}
      </span>
    ),
  },
]

function BankChequeMapList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBusinessUnitId))
  const [banks, setBanks] = useState([])

  useEffect(() => {
    if (!sessionBusinessUnitId) return undefined

    let active = true

    Promise.all([
      bankChequeMapApi.list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined }),
      bankApi
        .list({ buId: sessionBusinessUnitId, bgId: sessionGroupId || undefined, status: 1 })
        .catch(() => []),
    ])
      .then(([mappings, bankList]) => {
        if (!active) return
        const scopedMappings = (mappings || []).filter((item) => {
          if (sessionBusinessUnitId && String(item.buId ?? item.BU_ID ?? '') !== sessionBusinessUnitId) {
            return false
          }
          const itemBgId = String(item.bgId ?? item.BG_ID ?? '')
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) {
            return false
          }
          return true
        })
        const scopedBanks = (bankList || []).filter((item) => {
          if (sessionBusinessUnitId && item.buId && String(item.buId) !== sessionBusinessUnitId) {
            return false
          }
          const itemBgId = String(item.bgId ?? '')
          if (sessionGroupId && itemBgId && itemBgId !== sessionGroupId) {
            return false
          }
          return true
        })
        setRows(scopedMappings.map(mapChequeMapToForm))
        setBanks(scopedBanks)
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load Bank Cheque Mappings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleDelete = async (row) => {
    if (String(row.CHEQUE_STATUS || '').toLowerCase() === 'used') {
      await showError('Cannot delete cheque that has already been marked as Used.')
      return
    }

    const confirmed = await confirmAction({
      action: 'delete',
      entityName: 'Bank Cheque Mapping',
      title: `Delete Cheque No. ${row.CHEQUE_NO}?`,
    })

    if (!confirmed) return

    try {
      await bankChequeMapApi.remove(row.ID)
      await showSuccess('Bank Cheque Mapping deleted successfully.')
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (err) {
      await showError(err?.response?.data?.message || err?.message || 'Unable to delete.')
    }
  }

  // Distinct Bank names strictly as per login user's Group Name and Business Unit
  const bankNameOptions = useMemo(() => {
    const map = new Map()
    banks.forEach((b) => {
      const name = String(b.bankName ?? '').trim()
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { value: name, label: name })
      }
    })
    return Array.from(map.values())
  }, [banks])

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
        key: 'ACCOUNT_NUMBER',
        label: 'Search by Bank Account No',
        placeholder: (fv, disabled) =>
          disabled ? '--Select Bank Name First--' : '--Search by Bank Account No--',
        disabled: (fv) => !fv?.BANK_NAME,
        dependsOn: 'BANK_NAME',
        options: (fv) => {
          const selectedBank = String(fv?.BANK_NAME || '').trim().toLowerCase()
          if (!selectedBank) return []

          const targetBanks = banks.filter(
            (b) => String(b.bankName || '').trim().toLowerCase() === selectedBank,
          )
          const fallbackBanks =
            targetBanks.length > 0
              ? targetBanks
              : banks.filter((b) =>
                  String(b.bankName || '').trim().toLowerCase().includes(selectedBank),
                )

          const accMap = new Map()
          fallbackBanks.forEach((b) => {
            const details = b.bankDetails || b.details || []
            if (Array.isArray(details)) {
              details.forEach((d) => {
                const acc = String(d.accountNumber ?? d.ACCOUNT_NUMBER ?? '').trim()
                if (acc && !accMap.has(acc.toLowerCase())) {
                  const branch = d.branchName ?? d.BRANCH_NAME
                  const name = d.accountName ?? d.ACCOUNT_NAME
                  accMap.set(acc.toLowerCase(), {
                    value: acc,
                    label: `${acc}${name ? ` - ${name}` : ''}${branch ? ` (${branch})` : ''}`,
                  })
                }
              })
            }
          })

          rows.forEach((row) => {
            const rowBank = String(row.BANK_NAME || '').trim().toLowerCase()
            const matches =
              targetBanks.length > 0 ? rowBank === selectedBank : rowBank.includes(selectedBank)
            if (matches) {
              const acc = String(row.ACCOUNT_NUMBER ?? '').trim()
              if (acc && !accMap.has(acc.toLowerCase())) {
                accMap.set(acc.toLowerCase(), {
                  value: acc,
                  label: `${acc}${row.ACCOUNT_NAME ? ` - ${row.ACCOUNT_NAME}` : ''}${
                    row.BRANCH_NAME ? ` (${row.BRANCH_NAME})` : ''
                  }`,
                })
              }
            }
          })

          return Array.from(accMap.values())
        },
        searchable: true,
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.ACCOUNT_NUMBER ?? '').toLowerCase().includes(query)
        },
      },
      {
        key: 'CHEQUE_NO',
        label: 'Search by Cheque No.',
        placeholder: 'Search by Cheque No.',
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.CHEQUE_NO ?? '').toLowerCase().includes(query)
        },
      },
      {
        key: 'CHEQUE_STATUS',
        label: 'Search by Cheque Status',
        placeholder: '--Search by Cheque Status--',
        options: [
          { label: 'Not Use', value: 'Not Use' },
          { label: 'Void', value: 'Void' },
          { label: 'Used', value: 'Used' },
        ],
        matches: (row, value) => {
          const query = String(value ?? '').trim().toLowerCase()
          if (!query) return true
          return String(row.CHEQUE_STATUS ?? '').trim().toLowerCase() === query
        },
      },
    ],
    [bankNameOptions, banks, rows],
  )

  return (
    <ListPage
      title={'Bank Cheque Mapping List'}
      createLabel={'Create New'}
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
          onDelete={() => handleDelete(row)}
          showUnavailable={false}
        />
      )}
    />
  )
}

export default BankChequeMapList
