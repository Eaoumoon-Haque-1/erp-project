/**
 * @file Accounting Calendar View page.
 * Displays read-only calendar details, months table, and audit logs.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../../components/shared/PageHeader'
import { showError } from '../../../../components/shared/actionAlerts'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { calendarApi } from '../api/calendarApi'
import { mapCalendarFromApi } from '../data/calendarApiMapper'

const listPath = '/accounts/voucher-setup/calendar'

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

function formatDateDisplay(value) {
  if (!value) return '-'
  const str = String(value).trim()
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) {
    const [, y, m, d] = match
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
  }
  const date = new Date(str)
  if (Number.isNaN(date.getTime())) return str
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function CalendarView() {
  const { calendarId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      calendarApi.get(calendarId),
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
        setRecord(mapCalendarFromApi(data, userMap, empMap))
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
  }, [calendarId])

  if (loading) {
    return <div className={'p-6 text-xs text-gray-500'}>Loading Accounting Calendar...</div>
  }

  if (!record) {
    return (
      <div className={'p-6 text-center'}>
        <p className={'text-sm text-gray-500 mb-3'}>Accounting Calendar not found.</p>
        <Link to={listPath} className={'primary-button inline-flex'}>
          Back to List
        </Link>
      </div>
    )
  }

  const months = record.CALENDAR_MONTHS || []

  return (
    <div className={'space-y-4'}>
      <PageHeader
        title={'Accounting Calendar Details'}
        breadcrumbs={[
          { label: 'Accounts', to: '/accounts' },
          { label: 'Voucher Setup', to: '/accounts/voucher-setup' },
          { label: 'Accounting Calendar', to: listPath },
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
              onClick={() => navigate(`${listPath}/${calendarId}/edit`)}
            >
              Edit
            </button>
          </div>
        }
      />

      {/* Master Data */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs'}>
          <DetailItem label={'Account Year'}>
            <span className={'font-bold text-gray-900'}>{record.CALENDAR_YEAR}</span>
          </DetailItem>
          <DetailItem label={'Calendar Type'} value={record.CALENDAR_TYPE} />
          <DetailItem label={'From Date (dd-mm-yyyy)'} value={formatDateDisplay(record.FROM_DATE)} />
          <DetailItem label={'To Date (dd-mm-yyyy)'} value={formatDateDisplay(record.TO_DATE)} />
          <DetailItem label={'Period'} value={record.PERIOD} />
          <DetailItem label={'Status'}>
            <span
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {record.STATUS === '1' ? 'Active' : 'Inactive'}
            </span>
          </DetailItem>
        </div>
      </div>

      {/* Detail Table */}
      <div className={'bg-white rounded border border-gray-200 shadow-xs overflow-hidden'}>
        <div className={'px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between'}>
          <span className={'font-semibold text-xs text-gray-700 uppercase tracking-wider'}>
            Calendar Months ({months.length} Periods)
          </span>
        </div>

        <div className={'overflow-x-auto'}>
          <table className={'w-full text-left text-xs border-collapse'}>
            <thead>
              <tr className={'bg-[#0b7463] text-white text-[11px] font-semibold'}>
                <th className={'w-12 px-2 py-1.5 text-center'}>SL No.</th>
                <th className={'px-2.5 py-1.5'}>Month</th>
                <th className={'px-2.5 py-1.5'}>Year</th>
                <th className={'px-2.5 py-1.5'}>Quarter</th>
                <th className={'px-2.5 py-1.5'}>From Date (dd-mm-yyyy)</th>
                <th className={'px-2.5 py-1.5'}>To Date (dd-mm-yyyy)</th>
                <th className={'px-2.5 py-1.5'}>Period Name</th>
                <th className={'px-2.5 py-1.5'}>Period Status</th>
                <th className={'px-2.5 py-1.5'}>Active</th>
              </tr>
            </thead>
            <tbody className={'divide-y divide-gray-200 bg-white'}>
              {months.length === 0 ? (
                <tr>
                  <td colSpan={9} className={'px-3 py-6 text-center text-gray-500 bg-gray-50/50'}>
                    No month rows found.
                  </td>
                </tr>
              ) : (
                months.map((m, idx) => (
                  <tr
                    key={m._ROW_ID || idx}
                    className={`hover:bg-teal-50/20 transition-colors ${
                      idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                    }`}
                  >
                    <td className={'px-2 py-1.5 text-center text-gray-500 font-mono'}>{idx + 1}</td>
                    <td className={'px-2.5 py-1.5 font-medium text-gray-900'}>{m.CALENDAR_MONTH}</td>
                    <td className={'px-2.5 py-1.5'}>{m.CALENDAR_YEAR}</td>
                    <td className={'px-2.5 py-1.5'}>{m.CALENDAR_QUATER}</td>
                    <td className={'px-2.5 py-1.5 font-mono'}>{formatDateDisplay(m.FROM_DATE)}</td>
                    <td className={'px-2.5 py-1.5 font-mono'}>{formatDateDisplay(m.TO_DATE)}</td>
                    <td className={'px-2.5 py-1.5 font-semibold text-teal-800'}>{m.PERIOD_NAME}</td>
                    <td className={'px-2.5 py-1.5'}>
                      <span
                        className={[
                          'inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-bold leading-none',
                          m.PERIOD_STATUS === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700',
                        ].join(' ')}
                      >
                        {m.PERIOD_STATUS || 'Open'}
                      </span>
                    </td>
                    <td className={'px-2.5 py-1.5'}>
                      <span
                        className={[
                          'inline-flex rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white',
                          m.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
                        ].join(' ')}
                      >
                        {m.STATUS === '1' ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
            <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>Audit Log :</h3>
          </div>
          <span
            data-column={'STATUS'}
            className={[
              'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
              String(record.STATUS ?? '1') === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
            ].join(' ')}
          >
            {String(record.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
          </span>
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

export default CalendarView

