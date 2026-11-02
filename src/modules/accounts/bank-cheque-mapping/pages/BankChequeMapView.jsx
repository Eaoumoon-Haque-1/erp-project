/**
 * @file Bank Cheque Mapping View page.
 * Displays read-only mapping details and audit logs matching Voucher Type Mapping pattern.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { bankChequeMapApi } from '../api/bankChequeMapApi'
import { mapChequeMapToForm } from '../data/bankChequeMapApiMapper'

const listPath = '/accounts/voucher-setup/bank-cheque-mapping'

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

function BankChequeMapView() {
  const { mappingId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      bankChequeMapApi.get(mappingId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([item, users, employees]) => {
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
        setRecord(mapChequeMapToForm(item, userMap, empMap))
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Bank Cheque Mapping.')
        navigate(listPath, { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [mappingId, navigate])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Bank Cheque Mapping Details'} actionLabel={'List'} actionTo={listPath} />
        <section className={'erp-form-card p-6 text-xs text-gray-500'}>
          Loading Bank Cheque Mapping...
        </section>
      </div>
    )
  }

  if (!record) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Bank Cheque Mapping Details'} actionLabel={'List'} actionTo={listPath} />
        <section className={'erp-form-card p-6 text-center'}>
          <p className={'text-sm text-gray-500 mb-3'}>Bank Cheque Mapping not found.</p>
          <Link to={listPath} className={'primary-button inline-flex'}>
            Back to List
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className={'erp-list-page space-y-4'}>
      <PageHeader
        title={'Bank Cheque Mapping Details'}
        actionLabel={'List'}
        actionTo={listPath}
      />

      <section className={'erp-form-card space-y-4'}>
        <div className={'bg-white p-4 rounded border border-gray-200'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h2 className={'text-sm font-semibold text-gray-800'}>
                Mapping Details
              </h2>
            </div>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs'}>
            <DetailItem label={'Group Name'} value={record.GROUP_NAME} />
            <DetailItem label={'Business Unit'} value={record.BUSINESS_UNIT_NAME} />
            <DetailItem label={'Bank Name'} value={record.BANK_NAME} />
            <DetailItem label={'Bank Account No'}>
              <span>{record.ACCOUNT_NUMBER || '-'}</span>
              {record.BRANCH_NAME && (
                <span className={'text-gray-500 ml-1.5'}>({record.BRANCH_NAME})</span>
              )}
            </DetailItem>
            <DetailItem label={'Cheque No.'}>
              <span className={'font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded'}>
                {record.CHEQUE_NO}
              </span>
            </DetailItem>
            <DetailItem label={'Cheque Range'}>
              <span>
                {record.CHEQUE_NO_FROM} - {record.CHEQUE_NO_TO}
              </span>
            </DetailItem>
            <DetailItem label={'Cheque Status'}>
              <span
                className={[
                  'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none',
                  record.CHEQUE_STATUS === 'Used'
                    ? 'bg-emerald-600 text-white'
                    : record.CHEQUE_STATUS === 'Void'
                    ? 'bg-rose-600 text-white'
                    : 'bg-sky-600 text-white',
                ].join(' ')}
              >
                {record.CHEQUE_STATUS || 'Not Use'}
              </span>
            </DetailItem>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={'flex items-center justify-end gap-3 pt-2'}>
          <Link to={listPath} className={'secondary-button'}>
            Back to List
          </Link>
          <Link to={`${listPath}/${record.ID}/edit`} className={'primary-button'}>
            Edit Mapping
          </Link>
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
            <span
              data-column={'STATUS'}
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(record.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
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
      </section>
    </div>
  )
}

export default BankChequeMapView

