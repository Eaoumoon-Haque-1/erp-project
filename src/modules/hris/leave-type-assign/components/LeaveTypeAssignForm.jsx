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
  businessGroup,
  leaveType,
  businessUnits,
  onChange,
  businessUnitRef,
}) {
  const availableBusinessUnits = businessUnits.filter(
    (unit) => String(unit.BG_ID) === String(values.BG_ID),
  )

  return (
    <div className={'erp-form-grid'}>
      <div>
        <RequiredLabel htmlFor={'LEAVE_GROUP_BG_ID-display'}>Group Name</RequiredLabel>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'LEAVE_GROUP_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={businessGroup.GROUP_NAME}
          readOnly
          aria-describedby={errors.BG_ID ? 'LEAVE_GROUP_BG_ID-error' : undefined}
        />
        <FieldError id={'LEAVE_GROUP_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'LEAVE_TYPE_ID-display'}>Leave Type</RequiredLabel>
        <input type={'hidden'} name={'LEAVE_TYPE_ID'} value={values.LEAVE_TYPE_ID} />
        <input
          id={'LEAVE_TYPE_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={leaveType.TYPE_NAME}
          readOnly
          aria-describedby={
            errors.LEAVE_TYPE_ID ? 'LEAVE_TYPE_ID-error' : undefined
          }
        />
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
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={errors.BU_ID ? 'BU_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>Select...</option>
          {availableBusinessUnits.map((unit) => (
            <option key={unit.ID} value={unit.ID}>{unit.BUSINESS_UNIT}</option>
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
