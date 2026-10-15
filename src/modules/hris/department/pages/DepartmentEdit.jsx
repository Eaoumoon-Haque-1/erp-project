/**
 * @file Edit-page controller for Department.
 * Sections: record loading, controlled state, update/reset handlers, and form/assignment composition.
 * Future fetch/update API calls belong here; preserve route-parameter and list-link contracts.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { departmentsApi } from '../api/departmentApi'
import { mapDepartmentFromApi, mapDepartmentToApi } from '../data/departmentApiMapper'
import DepartmentForm from '../components/DepartmentForm'
import DepartmentGroupModal from '../../department-group/components/DepartmentGroupModal'
import { temporaryDepartmentGroupBusinessUnits } from '../../department-group/validation/departmentGroupValidation'
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
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [departmentGroups, setDepartmentGroups] = useState([])
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, {
    loadUnits: false,
    preserveGroupId: values.BG_ID,
  })
  const businessGroup = {
    ID: values.BG_ID,
    GROUP_NAME: groupOptions.find((option) => option.value === values.BG_ID)?.label || 'N/A',
  }

  useEffect(() => {
    let active = true
    Promise.all([departmentsApi.get(departmentId), departmentsApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapDepartmentFromApi(record)
        setDepartment(mapped)
        setValues(mapped)
        setExistingDepartments(records.filter((item) => String(item.id) !== String(departmentId)))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Department.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [departmentId])

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

  const handleGroupStatusChange = (groupId) => {
    setDepartmentGroups((current) =>
      current.map((group) =>
        group.ID === groupId
          ? { ...group, STATUS: group.STATUS === '1' ? '0' : '1' }
          : group,
      ),
    )
  }

  const handleDepartmentGroupSubmit = (groupValues) => {
    const businessUnit = temporaryDepartmentGroupBusinessUnits.find(
      (unit) => String(unit.ID) === String(groupValues.BU_ID),
    )

    setDepartmentGroups((current) => [
      ...current,
      {
        ID: String(current.length + 1),
        ...groupValues,
        BUSINESS_UNIT: businessUnit?.BUSINESS_UNIT ?? groupValues.BU_ID,
      },
    ])
    setGroupModalOpen(false)
  }

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
            onClick={() => setGroupModalOpen(true)}
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
                  <td>{values.DEPARTMENT_NAME}</td>
                  <td>{group.BUSINESS_UNIT}</td>
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
                    <button
                      type={'button'}
                      className={[
                        'inline-flex h-6 w-[34px] items-center justify-center rounded text-white shadow-sm transition',
                        'hover:-translate-y-px hover:brightness-95 hover:shadow',
                        group.STATUS === '1'
                          ? 'bg-action-danger'
                          : 'bg-action-success',
                      ].join(' ')}
                      aria-label={
                        group.STATUS === '1'
                          ? 'Deactivate department group'
                          : 'Activate department group'
                      }
                      title={
                        group.STATUS === '1'
                          ? 'Deactivate department group'
                          : 'Activate department group'
                      }
                      onClick={() => handleGroupStatusChange(group.ID)}
                    >
                      <svg
                        viewBox={'0 0 24 24'}
                        className={'size-4'}
                        fill={'none'}
                        stroke={'currentColor'}
                        strokeWidth={'2'}
                        strokeLinecap={'round'}
                        strokeLinejoin={'round'}
                        aria-hidden={'true'}
                      >
                        {group.STATUS === '1' ? (
                          <>
                            <circle cx={'12'} cy={'12'} r={'9'} />
                            <path d={'m8 8 8 8'} />
                          </>
                        ) : (
                          <path d={'m5 12 4 4L19 6'} />
                        )}
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {groupModalOpen && (
        <DepartmentGroupModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          onSubmit={handleDepartmentGroupSubmit}
          businessGroup={businessGroup}
          department={{ ...department, ...values }}
          businessUnits={temporaryDepartmentGroupBusinessUnits}
        />
      )}
    </div>
  )
}

export default DepartmentEdit
