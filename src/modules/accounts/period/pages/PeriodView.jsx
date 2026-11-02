/**
 * @file Accounting Period Open View page.
 * Displays read-only period details and audit logs.
 * Note: Group Name and Business Unit are excluded from display as requested.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../../components/shared/PageHeader'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { periodApi } from '../api/periodApi'
import { mapPeriodFromApi } from '../data/periodApiMapper'

const listPath = '/accounts/voucher-setup/period'

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${day}/${month}/${year} ${time}`
}

function DetailItem({ label, value, children }) {
  return (
    <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
      <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>{label}</span>
      <div className={'font-semibold text-gray-800'}>{children ?? value ?? '-'}</div>
    </div>
  )
}

function PeriodView() {
  const { periodId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      periodApi.get(periodId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([data, users, employees]) => {
        if (!active) return
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )
        setRecord(mapPeriodFromApi(data, userMap, empMap))
      })
      .catch((err) => {
        if (active) showError(err?.message || 'Unable to load details.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [periodId])

  if (loading) {
    return <div className={'p-6 text-xs text-gray-500'}>Loading Accounting Period...</div>
  }

  if (!record) {
    return (
      <div className={'p-6 text-center'}>
        <p className={'text-sm text-gray-500 mb-3'}>Accounting Period not found.</p>
        <Link to={listPath} className={'primary-button inline-flex'}>
          Back to List
        </Link>
      </div>
    )
  }

  return (
    <div className={'space-y-4'}>
      <PageHeader
        title={'Accounting Period Details'}
        breadcrumbs={[
          { label: 'Accounts', to: '/accounts' },
          { label: 'Voucher Setup', to: '/accounts/voucher-setup' },
          { label: 'Accounting Period Open', to: listPath },
          { label: 'View' },
        ]}
        actions={
          <div className={'flex items-center gap-2'}>
            <button
              type={'button'}
              className={'secondary-button'}
              onClick={() => navigate(listPath)}
            >
              Back to List
            </button>
            <button
              type={'button'}
              className={'primary-button'}
              onClick={() => navigate(`${listPath}/${periodId}/edit`)}
            >
              Edit
            </button>
          </div>
        }
      />

      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs'}>
          <DetailItem label={'Year'}>
            <span className={'font-bold text-gray-900'}>{record.PERIOD_YEAR}</span>
          </DetailItem>
          <DetailItem label={'Period Name'}>
            <span className={'font-mono font-semibold text-teal-800'}>{record.PERIOD_NAME}</span>
          </DetailItem>
          <DetailItem label={'Period Status'}>
            <span
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none',
                record.PERIOD_STATUS === 'Open' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
              ].join(' ')}
            >
              {record.PERIOD_STATUS || 'Open'}
            </span>
          </DetailItem>
        </div>
      </div>

      {/* Audit Log Block */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
              Audit Log :
            </h3>
          </div>
        </div>

        <div className={'space-y-3 text-xs'}>
          {/* Row 1: Created Audit Info */}
          <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
            <div
              data-column={'CREATED_USER_ID'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Created By (User):
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.CREATED_USER_NAME || record.CREATED_USER_ID || '-'}
              </span>
            </div>

            <div
              data-column={'CREATED_EMP_ID'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Created By (Employee):
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.CREATED_EMP_NAME || record.CREATED_EMP_ID || '-'}
              </span>
            </div>

            <div
              data-column={'CREATED_DATETIME'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Created At:
              </span>
              <span className={'font-semibold text-gray-800'}>
                {formatAuditDateTime(record.CREATED_DATETIME)}
              </span>
            </div>

            <div
              data-column={'CREATED_APP'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Created From:
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.CREATED_APP || '-'}
              </span>
            </div>
          </div>

          {/* Row 2: Updated Audit Info */}
          <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
            <div
              data-column={'UPDATED_USER_ID'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Updated By (User):
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.UPDATED_USER_NAME || record.UPDATED_USER_ID || '-'}
              </span>
            </div>

            <div
              data-column={'UPDATED_EMP_ID'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Updated By (Employee):
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.UPDATED_EMP_NAME || record.UPDATED_EMP_ID || '-'}
              </span>
            </div>

            <div
              data-column={'UPDATED_DATETIME'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Updated At:
              </span>
              <span className={'font-semibold text-gray-800'}>
                {formatAuditDateTime(record.UPDATED_DATETIME)}
              </span>
            </div>

            <div
              data-column={'UPDATED_APP'}
              className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
            >
              <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                Updated From:
              </span>
              <span className={'font-semibold text-gray-800 break-words'}>
                {record.UPDATED_APP || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PeriodView

