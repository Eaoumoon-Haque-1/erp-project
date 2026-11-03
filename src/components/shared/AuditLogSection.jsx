/** @file Shared audit/status presentation for API-backed record view pages. */
import { useEffect, useMemo, useState } from 'react'
import apiClient from '../../api/client'

const actorCache = {
  user: new Map(),
  employee: new Map(),
}

function firstValue(record, keys) {
  for (const key of keys) {
    const value = record?.[key]
    if (value !== null && value !== undefined && value !== '') return value
  }
  return ''
}

function unwrapResponse(response) {
  const body = response?.data
  return body?.data ?? body ?? null
}

function usableActorId(value) {
  const normalized = String(value ?? '').trim()
  return normalized && normalized !== '0' ? normalized : ''
}

async function resolveActor(kind, id) {
  if (!id) return ''
  if (actorCache[kind].has(id)) return actorCache[kind].get(id)

  const request = apiClient
    .get(kind === 'user' ? `/users/${id}` : `/employees/${id}`)
    .then(unwrapResponse)
    .then((record) => {
      if (kind === 'user') {
        return record?.userName || record?.username || record?.fullName || id
      }
      return record?.employeeName || record?.employeeCode || id
    })
    .catch(() => id)

  actorCache[kind].set(id, request)
  return request
}

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type)?.value || ''

  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}:${part('second')} ${part('dayPeriod')}`
}

function getAuditData(record) {
  return {
    createdUserId: usableActorId(firstValue(record, ['createdUserId', 'CREATED_USER_ID', 'CREATED_BY'])),
    createdUserName: firstValue(record, ['createdUserName', 'createdByUser', 'createdByUsername', 'createdUsername', 'CREATED_USER_NAME']),
    createdEmployeeId: usableActorId(firstValue(record, ['createdEmpId', 'createdEmployeeId', 'CREATED_EMP_ID'])),
    createdEmployeeName: firstValue(record, ['createdEmployeeName', 'createdByEmployee', 'CREATED_EMPLOYEE_NAME']),
    createdAt: firstValue(record, ['createdDatetime', 'createdAt', 'CREATED_AT']),
    createdApp: firstValue(record, ['createdApp', 'createdFrom', 'CREATED_APP']),
    updatedUserId: usableActorId(firstValue(record, ['updatedUserId', 'UPDATED_USER_ID', 'UPDATED_BY'])),
    updatedUserName: firstValue(record, ['updatedUserName', 'updatedByUser', 'updatedByUsername', 'updatedUsername', 'UPDATED_USER_NAME']),
    updatedEmployeeId: usableActorId(firstValue(record, ['updatedEmpId', 'updatedEmployeeId', 'UPDATED_EMP_ID'])),
    updatedEmployeeName: firstValue(record, ['updatedEmployeeName', 'updatedByEmployee', 'UPDATED_EMPLOYEE_NAME']),
    updatedAt: firstValue(record, ['updatedDatetime', 'updatedAt', 'UPDATED_AT']),
    updatedApp: firstValue(record, ['updatedApp', 'updatedFrom', 'UPDATED_APP']),
    status: firstValue(record, ['status', 'STATUS', 'isActive', 'IS_ACTIVE']),
  }
}

function AuditLogSection({ record }) {
  const audit = useMemo(() => getAuditData(record), [record])
  const [actorNames, setActorNames] = useState({})
  const hasAuditData = Boolean(
    audit.createdUserId || audit.createdUserName || audit.createdEmployeeId
    || audit.createdEmployeeName || audit.createdAt || audit.createdApp
    || audit.updatedUserId || audit.updatedUserName || audit.updatedEmployeeId
    || audit.updatedEmployeeName || audit.updatedAt || audit.updatedApp,
  )

  useEffect(() => {
    if (!hasAuditData) return undefined
    let active = true

    Promise.all([
      audit.createdUserName || resolveActor('user', audit.createdUserId),
      audit.createdEmployeeName || resolveActor('employee', audit.createdEmployeeId),
      audit.updatedUserName || resolveActor('user', audit.updatedUserId),
      audit.updatedEmployeeName || resolveActor('employee', audit.updatedEmployeeId),
    ]).then(([createdUser, createdEmployee, updatedUser, updatedEmployee]) => {
      if (active) setActorNames({ createdUser, createdEmployee, updatedUser, updatedEmployee })
    })

    return () => { active = false }
  }, [
    audit.createdEmployeeId, audit.createdEmployeeName,
    audit.createdUserId, audit.createdUserName,
    audit.updatedEmployeeId, audit.updatedEmployeeName,
    audit.updatedUserId, audit.updatedUserName,
    hasAuditData,
  ])

  if (!hasAuditData) return null

  const activeStatus = String(audit.status) === '1' || audit.status === true
  const fields = [
    ['Created By (User):', actorNames.createdUser || audit.createdUserName || audit.createdUserId || '-'],
    ['Created By (Employee):', actorNames.createdEmployee || audit.createdEmployeeName || audit.createdEmployeeId || '-'],
    ['Created At:', formatAuditDateTime(audit.createdAt)],
    ['Created From:', audit.createdApp || '-'],
    ['Updated By (User):', actorNames.updatedUser || audit.updatedUserName || audit.updatedUserId || '-'],
    ['Updated By (Employee):', actorNames.updatedEmployee || audit.updatedEmployeeName || audit.updatedEmployeeId || '-'],
    ['Updated At:', formatAuditDateTime(audit.updatedAt)],
    ['Updated From:', audit.updatedApp || '-'],
  ]

  return (
    <section className={'erp-audit-log'} aria-label={'Audit Log'}>
      <div className={'erp-audit-log-header'}>
        <h2><span aria-hidden={'true'} />Audit Log :</h2>
        {audit.status !== '' && (
          <span className={activeStatus ? 'erp-view-status-active' : 'erp-view-status-inactive'}>
            {activeStatus ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>
      <dl className={'erp-audit-log-grid'}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AuditLogSection
