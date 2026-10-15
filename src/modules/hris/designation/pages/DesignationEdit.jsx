/**
 * @file Edit-page controller for Designation.
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
import { designationGroupsApi } from '../../designation-group/api/designationGroupApi'
import DesignationGroupModal from '../../designation-group/components/DesignationGroupModal'
import {
  mapDesignationGroupFromApi,
  mapDesignationGroupToApi,
} from '../../designation-group/data/designationGroupApiMapper'
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
  const [groupModal, setGroupModal] = useState({ open: false, mode: 'create', record: null })
  const [groupSubmitting, setGroupSubmitting] = useState(false)
  const [designationGroups, setDesignationGroups] = useState([])
  const [loadedBusinessUnits, setLoadedBusinessUnits] = useState({ groupId: '', records: [] })
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, {
    loadUnits: false,
    preserveGroupId: values.BG_ID,
  })
  const assignmentGroupId = designation?.BG_ID || ''
  const businessGroup = {
    ID: assignmentGroupId,
    GROUP_NAME: groupOptions.find((option) => option.value === assignmentGroupId)?.label || 'N/A',
  }

  useEffect(() => {
    let active = true
    Promise.all([
      designationsApi.get(designationId),
      designationsApi.list(),
      designationGroupsApi.list(designationId),
    ])
      .then(([record, records, groupRecords]) => {
        if (!active) return
        const mapped = mapDesignationFromApi(record)
        setDesignation(mapped)
        setValues(mapped)
        setExistingDesignations(records.filter((item) => String(item.id) !== String(designationId)))
        setDesignationGroups(groupRecords.map(mapDesignationGroupFromApi))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Designation.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [designationId])

  useEffect(() => {
    if (!assignmentGroupId) {
      return undefined
    }

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

  const handleGroupStatusChange = async (group) => {
    const nextGroup = {
      ...group,
      STATUS: group.STATUS === '1' ? '0' : '1',
    }

    try {
      const updated = await designationGroupsApi.update(
        group.ID,
        mapDesignationGroupToApi(nextGroup),
      )
      const mapped = updated ? mapDesignationGroupFromApi(updated) : nextGroup
      setDesignationGroups((current) => current.map((item) =>
        item.ID === group.ID ? mapped : item,
      ))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Designation Group status.')
      return false
    }
  }

  const handleDesignationGroupSubmit = async (groupValues) => {
    setGroupSubmitting(true)
    try {
      if (groupModal.mode === 'edit') {
        const updated = await designationGroupsApi.update(
          groupModal.record.ID,
          mapDesignationGroupToApi(groupValues),
        )
        const mapped = updated
          ? mapDesignationGroupFromApi(updated)
          : { ...groupValues, ID: groupModal.record.ID }
        setDesignationGroups((current) => current.map((item) =>
          item.ID === groupModal.record.ID ? mapped : item,
        ))
      } else {
        const created = await designationGroupsApi.create(
          mapDesignationGroupToApi(groupValues),
        )
        setDesignationGroups((current) => [
          ...current,
          mapDesignationGroupFromApi(created),
        ])
      }
      setGroupModal({ open: false, mode: 'create', record: null })
    } catch (error) {
      getApiErrorMessage(
        error,
        groupModal.mode === 'edit'
          ? 'Unable to update the Designation Group.'
          : 'Unable to assign the Designation Group.',
      )
    } finally {
      setGroupSubmitting(false)
    }
  }

  const handleOpenGroup = async (mode, group) => {
    try {
      const record = await designationGroupsApi.get(group.ID)
      setGroupModal({
        open: true,
        mode,
        record: mapDesignationGroupFromApi(record),
      })
    } catch (error) {
      getApiErrorMessage(error, 'Unable to load the Designation Group.')
    }
  }

  const handleGroupDelete = async (group) => {
    try {
      await designationGroupsApi.remove(group.ID)
      setDesignationGroups((current) => current.filter((item) => item.ID !== group.ID))
      return true
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete the Designation Group.')
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
    designationGroups.map((group) => String(group.BU_ID)),
  )
  const availableBusinessUnits = businessUnits.filter(
    (unit) =>
      String(unit.ID) === String(groupModal.record?.BU_ID) ||
      !assignedBusinessUnitIds.has(String(unit.ID)),
  )

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
            onClick={() => setGroupModal({ open: true, mode: 'create', record: null })}
            disabled={!assignmentGroupId || unitsLoading}
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
                  <td>{designation.DESIGNATION_NAME}</td>
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
                      entityName={'Designation Group'}
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
        <DesignationGroupModal
          key={`${groupModal.mode}-${groupModal.record?.ID || 'new'}`}
          open={groupModal.open}
          onClose={() => setGroupModal({ open: false, mode: 'create', record: null })}
          onSubmit={handleDesignationGroupSubmit}
          businessGroup={businessGroup}
          designation={designation}
          businessUnits={availableBusinessUnits}
          mode={groupModal.mode}
          record={groupModal.record}
          submitting={groupSubmitting}
        />
      )}
    </div>
  )
}

export default DesignationEdit
