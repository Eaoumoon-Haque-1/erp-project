/**
 * @file Edit-page controller for Designation.
 * Sections: record loading, controlled state, update/reset handlers, and form/assignment composition.
 * Future fetch/update API calls belong here; preserve route-parameter and list-link contracts.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import ActionForm from '../../../../components/shared/ActionForm'
import PageHeader from '../../../../components/shared/PageHeader'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import DesignationGroupModal from '../../designation-group/components/DesignationGroupModal'
import { temporaryDesignationGroupBusinessUnits } from '../../designation-group/validation/designationGroupValidation'
import { designationsApi } from '../api/designationApi'
import DesignationForm from '../components/DesignationForm'
import { mapDesignationFromApi, mapDesignationToApi } from '../data/designationApiMapper'
import {
  DESIGNATION_TABLE,
  initialDesignationValues,
  validateDesignation,
} from '../validation/designationValidation'

function DesignationEdit() {
  const { designationId } = useParams()
  const navigate = useNavigate()
  const designationNameRef = useRef(null)
  const [designation, setDesignation] = useState(null)
  const [values, setValues] = useState(initialDesignationValues)
  const [existingDesignations, setExistingDesignations] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [designationGroups, setDesignationGroups] = useState([])
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
    Promise.all([designationsApi.get(designationId), designationsApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapDesignationFromApi(record)
        setDesignation(mapped)
        setValues(mapped)
        setExistingDesignations(records.filter((item) => String(item.id) !== String(designationId)))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Designation.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [designationId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateDesignation(values, existingDesignations)

    setValues((current) => ({ ...current, ...result.values }))
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.DESIGNATION_NAME) designationNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await designationsApi.update(designationId, mapDesignationToApi(result.values))
      navigate('/hris/employee-settings/designation')
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Designation.', {
        bgId: 'BG_ID', designationName: 'DESIGNATION_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGroupStatusChange = (groupId) => {
    setDesignationGroups((current) =>
      current.map((group) =>
        group.ID === groupId
          ? { ...group, STATUS: group.STATUS === '1' ? '0' : '1' }
          : group,
      ),
    )
  }

  const handleDesignationGroupSubmit = (groupValues) => {
    const businessUnit = temporaryDesignationGroupBusinessUnits.find(
      (unit) => String(unit.ID) === String(groupValues.BU_ID),
    )

    setDesignationGroups((current) => [
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
        <PageHeader title={'Designation Edit'} actionLabel={'Designation List'} actionTo={'/hris/employee-settings/designation'} />
        <section className={'erp-form-card'}><p>Loading...</p></section>
      </div>
    )
  }

  if (!designation) {
    return (
      <div className={'erp-list-page'}>
        <PageHeader
          title={'Designation Not Found'}
          actionLabel={'Designation List'}
          actionTo={'/hris/employee-settings/designation'}
        />
        <section className={'erp-form-card'}>
          <p>No designation record was found for this ID.</p>
        </section>
      </div>
    )
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader
        title={'Designation Edit'}
        actionLabel={'Designation List'}
        actionTo={'/hris/employee-settings/designation'}
      />

      <section className={'erp-form-card'}>
        <ActionForm action={'update'} entityName={'Designation'} data-table={DESIGNATION_TABLE} onSubmit={handleSubmit} noValidate>
          <DesignationForm
            values={values}
            errors={errors}
            groupOptions={groupOptions}
            groupsLoading={groupsLoading}
            onChange={handleChange}
            designationNameRef={designationNameRef}
          />
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>{submitting ? 'Saving...' : 'Update'}</button>
          </div>
        </ActionForm>
      </section>

      <section className={'erp-form-card'}>
        <div className={'flex items-center justify-between gap-4'}>
          <h2 className={'m-0 text-base font-medium'}>Designation Group List</h2>
          <button
            type={'button'}
            className={'primary-button'}
            onClick={() => setGroupModalOpen(true)}
          >
            <span aria-hidden={'true'} className={'mr-1 text-lg leading-none'}>+</span>
            Assign Designation Group
          </button>
        </div>

        <div className={'erp-table-wrap mt-8'}>
          <table className={'erp-table'}>
            <thead>
              <tr>
                <th className={'erp-number-column'}>#</th>
                <th>Group Name</th>
                <th>Designation Name</th>
                <th>Business Unit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {designationGroups.length === 0 ? (
                <tr><td className={'erp-empty-cell'} colSpan={6}>No data found</td></tr>
              ) : designationGroups.map((group, index) => (
                <tr key={group.ID}>
                  <td className={'erp-number-column'}>{index + 1}</td>
                  <td>{businessGroup.GROUP_NAME}</td>
                  <td>{values.DESIGNATION_NAME}</td>
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
                          ? 'Deactivate designation group'
                          : 'Activate designation group'
                      }
                      title={
                        group.STATUS === '1'
                          ? 'Deactivate designation group'
                          : 'Activate designation group'
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
        <DesignationGroupModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          onSubmit={handleDesignationGroupSubmit}
          businessGroup={businessGroup}
          designation={{ ...designation, ...values }}
          businessUnits={temporaryDesignationGroupBusinessUnits}
        />
      )}
    </div>
  )
}

export default DesignationEdit
