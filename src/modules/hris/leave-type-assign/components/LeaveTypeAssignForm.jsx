/**
 * @file Controlled form presentation for Leave Type Assign.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, extra = '') {
  return [
    'erp-form-control',
    extra,
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      <span className={'erp-required'} aria-hidden={'true'}>*</span>
    </label>
  )
}

function LeaveTypeAssignForm({
  values,
  errors,
  groupOptions = [],
  businessUnitOptions = [],
  leaveTypeOptions = [],
  groupsLoading = false,
  unitsLoading = false,
  leaveTypesLoading = false,
  onChange,
  businessUnitRef,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <RequiredLabel htmlFor={'BG_ID'}>Group Name</RequiredLabel>
        <select
          id={'BG_ID'}
          name={'BG_ID'}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          disabled={groupsLoading}
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? 'LEAVE_GROUP_BG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>{groupsLoading ? 'Loading...' : '--Select Group Name--'}</option>
          {groupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'LEAVE_GROUP_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'LEAVE_TYPE_ID'}>Leave Type</RequiredLabel>
        <select
          id={'LEAVE_TYPE_ID'}
          name={'LEAVE_TYPE_ID'}
          className={fieldClass(errors.LEAVE_TYPE_ID)}
          value={values.LEAVE_TYPE_ID}
          required
          disabled={!values.BG_ID || leaveTypesLoading}
          aria-invalid={Boolean(errors.LEAVE_TYPE_ID)}
          aria-describedby={
            errors.LEAVE_TYPE_ID ? 'LEAVE_TYPE_ID-error' : undefined
          }
          onChange={onChange}
        >
          <option value={''}>{leaveTypesLoading ? 'Loading...' : '--Select Leave Type--'}</option>
          {leaveTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'LEAVE_TYPE_ID-error'} message={errors.LEAVE_TYPE_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'BU_ID'}>Business Unit</RequiredLabel>
        <select
          ref={businessUnitRef}
          id={'BU_ID'}
          name={'BU_ID'}
          className={fieldClass(errors.BU_ID)}
          value={values.BU_ID}
          required
          disabled={!values.BG_ID || unitsLoading}
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={errors.BU_ID ? 'BU_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>{unitsLoading ? 'Loading...' : '--Select Business Unit--'}</option>
          {businessUnitOptions.map((unit) => (
            <option key={unit.value} value={unit.value}>{unit.label}</option>
          ))}
        </select>
        <FieldError id={'BU_ID-error'} message={errors.BU_ID} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input
            className={'erp-switch-control'}
            type={'checkbox'}
            role={'switch'}
            name={'STATUS'}
            checked={values.STATUS === '1'}
            onChange={onChange}
          />
          <span>Is Active</span>
        </label>
      </div>
    </div>
  )
}

export default LeaveTypeAssignForm
