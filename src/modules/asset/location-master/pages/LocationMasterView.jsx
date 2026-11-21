/**
 * @file Location Master View page.
 * Displays read-only location details and audit log block.
 * Group Name (bgId) and Business Unit (buId) are hidden.
 * References (Custodian, Sub Custodian, Department) are strictly scoped to the logged-in user's session.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { custodiansApi } from '../../../../api/custodian'
import { departmentsApi } from '../../../../api/department'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import PageHeader from '../../../../components/shared/PageHeader'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { mapLocationMasterFromApi } from '../data/locationMasterApiMapper'

const listPath = '/asset/location-master'

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

function LocationMasterView() {
  const { locationMasterId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const [record, setRecord] = useState(null)
  const [custodianName, setCustodianName] = useState('-')
  const [subCustodianName, setSubCustodianName] = useState('-')
  const [deptName, setDeptName] = useState('-')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        let targetGroupId = sessionGroupId
        if (!targetGroupId && sessionBusinessUnitId) {
          try {
            const bu = await businessUnitsApi.get(sessionBusinessUnitId)
            if (bu?.bgId) targetGroupId = String(bu.bgId)
          } catch {}
        }

        const [item, users, employees, custodians, departments] = await Promise.all([
          assetLocationsApi.get(locationMasterId),
          usersApi.list().catch(() => []),
          employeesApi.list().catch(() => []),
          custodiansApi.list(sessionBusinessUnitId || undefined).catch(() => []),
          targetGroupId
            ? departmentsApi.listByGroup(Number(targetGroupId)).catch(() => [])
            : departmentsApi.list().catch(() => []),
        ])

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
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const mapped = mapLocationMasterFromApi(item, userMap, empMap)
        setRecord(mapped)

        const custodian = (custodians || []).find(
          (c) => String(c.id ?? c.ID) === String(mapped.CUSTODIAN_ID),
        )
        if (custodian) {
          setCustodianName(custodian.custodianName ?? custodian.CUSTODIAN_NAME ?? '-')
          const sub = (custodian.subCustodians ?? custodian.SUB_CUSTODIANS ?? []).find(
            (s) => String(s.id ?? s.ID) === String(mapped.SUB_CUSTODIAN_ID),
          )
          if (sub) {
            setSubCustodianName(sub.subCustodianName ?? sub.SUB_CUSTODIAN_NAME ?? '-')
          }
        }

        const dept = (departments || []).find(
          (d) => String(d.id ?? d.ID) === String(mapped.DEPT_ID),
        )
        if (dept) {
          setDeptName(dept.departmentName ?? dept.deptName ?? dept.name ?? '-')
        }
      } catch (error) {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Location.')
        navigate(listPath, { replace: true })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [locationMasterId, navigate, sessionBusinessUnitId, sessionGroupId])

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Location Master Details'}
          actionLabel={'Back to List'}
          actionTo={listPath}
          actionVariant={'secondary'}
        />
        <section className={'erp-form-card p-8 text-center text-gray-500'}>
          Loading location details...
        </section>
      </div>
    )
  }

  if (!record) return null

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Location Master Details'}
        actionLabel={'Back to List'}
        actionTo={listPath}
        actionVariant={'secondary'}
        actions={[
          {
            label: 'Create New',
            to: `${listPath}/create`,
            variant: 'secondary',
          },
          {
            label: 'Edit',
            to: `${listPath}/${locationMasterId}/edit`,
            variant: 'primary',
          },
        ]}
      />

      <section className={'erp-form-card space-y-6'}>
        {/* Main Details Card */}
        <div className={'bg-white p-4 rounded border border-gray-200'}>
          <div className={'flex items-center justify-end pb-2 mb-3 border-b border-gray-100'}>
            <span
              className={[
                'inline-flex rounded-[4px] px-[6px] py-[2px] text-[11px] font-bold leading-none text-white',
                record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {record.STATUS === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs'}>
            <div>
              <span className={'block text-gray-400 font-medium'}>Custodian</span>
              <span className={'font-semibold text-gray-800'}>{custodianName}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Sub Custodian</span>
              <span className={'font-semibold text-gray-800'}>{subCustodianName}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Status</span>
              <span className={'font-semibold text-gray-800'}>
                {record.STATUS === '1' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Location Name</span>
              <span className={'font-semibold text-teal-800 text-sm'}>
                {record.LOCATION_NAME || '-'}
              </span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Location Code</span>
              <span className={'font-semibold text-gray-800'}>{record.LOCATION_CODE || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Department</span>
              <span className={'font-semibold text-gray-800'}>{deptName}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Building</span>
              <span className={'font-semibold text-gray-800'}>{record.BUILDING || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Floor</span>
              <span className={'font-semibold text-gray-800'}>{record.FLOOR || '-'}</span>
            </div>
            <div>
              <span className={'block text-gray-400 font-medium'}>Room</span>
              <span className={'font-semibold text-gray-800'}>{record.ROOM || '-'}</span>
            </div>
            <div className={'sm:col-span-2 lg:col-span-3'}>
              <span className={'block text-gray-400 font-medium'}>Address</span>
              <span className={'font-semibold text-gray-800'}>{record.ADDRESS || '-'}</span>
            </div>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className={'bg-white p-3.5 rounded border border-gray-200'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
                Audit Log :
              </h3>
            </div>
            <span
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                record.STATUS === '1' ? 'bg-[#32c497]' : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {record.STATUS === '1' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={'space-y-3 text-xs'}>
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_USER_NAME || record.CREATED_USER_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_EMP_NAME || record.CREATED_EMP_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created At:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {formatAuditDateTime(record.CREATED_DATETIME)}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.CREATED_APP || '-'}
                </span>
              </div>
            </div>

            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.UPDATED_USER_NAME || record.UPDATED_USER_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {record.UPDATED_EMP_NAME || record.UPDATED_EMP_ID || '-'}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated At:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {formatAuditDateTime(record.UPDATED_DATETIME)}
                </span>
              </div>
              <div className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}>
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

export default LocationMasterView
