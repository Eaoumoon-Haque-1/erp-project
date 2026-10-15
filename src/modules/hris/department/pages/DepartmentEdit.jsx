/**
 * @file Edit-page controller for Department.
 * Sections: record loading, controlled state, update/reset handlers, and form/assignment composition.
 * Future fetch/update API calls belong here; preserve route-parameter and list-link contracts.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import ListRowActions from '../../../../components/shared/ListRowActions'
import PageHeader from '../../../../components/shared/PageHeader'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentGroupsApi } from '../../department-group/api/departmentGroupApi'
import {
  mapDepartmentGroupFromApi,
  mapDepartmentGroupToApi,
} from '../../department-group/data/departmentGroupApiMapper'
import { departmentsApi } from '../api/departmentApi'
import { mapDepartmentFromApi, mapDepartmentToApi } from '../data/departmentApiMapper'
import DepartmentForm from '../components/DepartmentForm'
import DepartmentGroupModal from '../../department-group/components/DepartmentGroupModal'
import {
  DEPARTMENT_TABLE,
  initialDepartmentValues,
  validateDepartment,
} from '../validation/departmentValidation'

function DepartmentEdit() {
  const { departmentId } = useParams()
  const navigate = useNavigate()
  const departmentNameRef = useRef(null)
  const [department, setDepartment] = useState(null)
  const [values, setValues] = useState(initialDepartmentValues)
  const [existingDepartments, setExistingDepartments] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [groupModal, setGroupModal] = useState({ open: false, mode: 'create', record: null })
  const [groupSubmitting, setGroupSubmitting] = useState(false)
  const [departmentGroups, setDepartmentGroups] = useState([])
  const [loadedBusinessUnits, setLoadedBusinessUnits] = useState({ groupId: '', records: [] })
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, {
    loadUnits: false,
    preserveGroupId: values.BG_ID,
  })
  const assignmentGroupId = department?.BG_ID || ''
  const businessGroup = {
    ID: assignmentGroupId,
    GROUP_NAME: groupOptions.find((option) => option.value === assignmentGroupId)?.label || 'N/A',
  }

  useEffect(() => {
    let active = true
    Promise.all([
      departmentsApi.get(departmentId),
      departmentsApi.list(),
      departmentGroupsApi.list(departmentId),
    ])
      .then(([record, records, groupRecords]) => {
        if (!active) return
        const mapped = mapDepartmentFromApi(record)
        setDepartment(mapped)
        setValues(mapped)
        setExistingDepartments(records.filter((item) => String(item.id) !== String(departmentId)))
        setDepartmentGroups(groupRecords.map(mapDepartmentGroupFromApi))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Department.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [departmentId])

  useEffect(() => {
    if (!assignmentGroupId) return undefined

    let active = true
    businessUnitsApi.listByGroup(assignmentGroupId)
      .then((records) => {
        if (!active) return
        setLoadedBusinessUnits({
          groupId: String(assignmentGroupId),
          records: records.map((record) => ({
            ID: String(record.id ?? ''),
            BG_ID: String(record.bgId ?? ''),
            BUSINESS_UNIT: record.businessUnit ?? '',
          })),
        })
      })
      .catch((error) => {
        if (active) {
          setLoadedBusinessUnits({ groupId: String(assignmentGroupId), records: [] })
          getApiErrorMessage(error, 'Unable to load Business Units.')
        }
      })

    return () => { active = false }
  }, [assignmentGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDepartment(values, existingDepartments)

    setValues((current) => ({ ...current, ...result.values }))
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.DEPARTMENT_NAME) departmentNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await departmentsApi.update(departmentId, mapDepartmentToApi(result.values))
      navigate('/hris/employee-settings/department')
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Department.', {
        bgId: 'BG_ID', departmentName: 'DEPARTMENT_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGroupStatusChange = async (group) => {
    const nextGroup = { ...group, STATUS: group.STATUS === '1' ? '0' : '1' }
    try {
      const updated = await departmentGroupsApi.update(
        group.ID,
        mapDepartmentGroupToApi(nextGroup),
      )
      const mapped = updated ? mapDepartmentGroupFromApi(updated) : nextGroup
      setDepartmentGroups((current) => current.map((item) =>
        item.ID === group.ID ? mapped : item,
      ))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Department Group status.')
      return false
    }
  }

  const handleDepartmentGroupSubmit = async (groupValues) => {
    setGroupSubmitting(true)
    try {
      if (groupModal.mode === 'edit') {
        const updated = await departmentGroupsApi.update(
          groupModal.record.ID,
          mapDepartmentGroupToApi(groupValues),
        )
        const mapped = updated
          ? mapDepartmentGroupFromApi(updated)
          : { ...groupValues, ID: groupModal.record.ID }
        setDepartmentGroups((current) => current.map((item) =>
          item.ID === groupModal.record.ID ? mapped : item,
        ))
      } else {
        const created = await departmentGroupsApi.create(
          mapDepartmentGroupToApi(groupValues),
        )
        setDepartmentGroups((current) => [
          ...current,
          mapDepartmentGroupFromApi(created),
        ])
      }
      setGroupModal({ open: false, mode: 'create', record: null })
    } catch (error) {
      getApiErrorMessage(
        error,
        groupModal.mode === 'edit'
          ? 'Unable to update the Department Group.'
          : 'Unable to assign the Department Group.',
      )
    } finally {
      setGroupSubmitting(false)
    }
  }

  const handleOpenGroup = async (mode, group) => {
    try {
      const record = await departmentGroupsApi.get(group.ID)
      setGroupModal({ open: true, mode, record: mapDepartmentGroupFromApi(record) })
    } catch (error) {
      getApiErrorMessage(error, 'Unable to load the Department Group.')
    }
  }

  const handleGroupDelete = async (group) => {
    try {
      await departmentGroupsApi.remove(group.ID)
      setDepartmentGroups((current) => current.filter((item) => item.ID !== group.ID))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete the Department Group.')
      return false
    }
  }

  const unitsAreCurrent = loadedBusinessUnits.groupId === String(assignmentGroupId)
  const businessUnits = unitsAreCurrent ? loadedBusinessUnits.records : []
  const unitsLoading = Boolean(assignmentGroupId && !unitsAreCurrent)
  const businessUnitNames = new Map(
    businessUnits.map((unit) => [String(unit.ID), unit.BUSINESS_UNIT]),
  )
  const assignedBusinessUnitIds = new Set(
    departmentGroups.map((group) => String(group.BU_ID)),
  )
  const availableBusinessUnits = businessUnits.filter(
    (unit) =>
      String(unit.ID) === String(groupModal.record?.BU_ID) ||
      !assignedBusinessUnitIds.has(String(unit.ID)),
  )

  if (loading) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader title={'Department Edit'} actionLabel={'Department List'} actionTo={'/hris/employee-settings/department'} />
        <section className={'erp-form-card'}><p>Loading...</p></section>
      </div>
    )
  }

  if (!department) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Department Not Found'}
          actionLabel={'Department List'}
          actionTo={'/hris/employee-settings/department'}
        />
        <section className={'erp-form-card'}>
          <p>No department record was found for this ID.</p>
        </section>
      </div>
    )
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Department Edit'}
        actionLabel={'Department List'}
        actionTo={'/hris/employee-settings/department'}
      />

      <section className={'erp-form-card'}>
        <ActionForm action={'update'} entityName={'Department'} data-table={DEPARTMENT_TABLE} onSubmit={handleSubmit} noValidate>
          <DepartmentForm
            values={values}
            errors={errors}
            groupOptions={groupOptions}
            groupsLoading={groupsLoading}
            onChange={handleChange}
            departmentNameRef={departmentNameRef}
          />
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>{submitting ? 'Saving...' : 'Update'}</button>
          </div>
        </ActionForm>
      </section>

      <section className={'erp-form-card'}>
        <div className={'flex items-center justify-between gap-4'}>
          <h2 className={'m-0 text-base font-medium'}>Department Group List</h2>
          <button
            type={'button'}
            className={'primary-button'}
            onClick={() => setGroupModal({ open: true, mode: 'create', record: null })}
            disabled={!assignmentGroupId || unitsLoading}
          >
            <span aria-hidden={'true'} className={'mr-1 text-lg leading-none'}>+</span>
            Assign Department Group
          </button>
        </div>

        <div className={'erp-table-wrap mt-8'}>
          <table className={'erp-table'}>
            <thead>
              <tr>
                <th className={'erp-number-column'}>#</th>
                <th>Group Name</th>
                <th>Department Name</th>
                <th>Business Unit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {departmentGroups.length === 0 ? (
                <tr><td className={'erp-empty-cell'} colSpan={6}>No data found</td></tr>
              ) : departmentGroups.map((group, index) => (
                <tr key={group.ID}>
                  <td className={'erp-number-column'}>{index + 1}</td>
                  <td>{businessGroup.GROUP_NAME}</td>
                  <td>{department.DEPARTMENT_NAME}</td>
                  <td>{businessUnitNames.get(String(group.BU_ID)) || group.BU_ID}</td>
                  <td>
                    <span
                      className={[
                        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
                        group.STATUS === '1'
                          ? 'bg-action-success'
                          : 'bg-action-danger',
                      ].join(' ')}
                    >
                      {group.STATUS === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <ListRowActions
                      row={group}
                      entityName={'Department Group'}
                      onView={(row) => handleOpenGroup('view', row)}
                      onEdit={(row) => handleOpenGroup('edit', row)}
                      onDelete={handleGroupDelete}
                      onStatusChange={handleGroupStatusChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {groupModal.open && (
        <DepartmentGroupModal
          key={`${groupModal.mode}-${groupModal.record?.ID || 'new'}`}
          open={groupModal.open}
          onClose={() => setGroupModal({ open: false, mode: 'create', record: null })}
          onSubmit={handleDepartmentGroupSubmit}
          businessGroup={businessGroup}
          department={department}
          businessUnits={availableBusinessUnits}
          mode={groupModal.mode}
          record={groupModal.record}
          submitting={groupSubmitting}
        />
      )}
    </div>
  )
}

export default DepartmentEdit
