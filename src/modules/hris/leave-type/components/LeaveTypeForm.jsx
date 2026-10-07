/**
 * @file Controlled form presentation for Leave Type.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return [
    'erp-form-control',
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function LeaveTypeForm({
  values,
  errors,
  businessGroup,
  onChange,
  typeNameRef,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'LEAVE_TYPE_BG_ID-display'}>
          Group Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'LEAVE_TYPE_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={businessGroup.GROUP_NAME}
          readOnly
          aria-describedby={errors.BG_ID ? 'LEAVE_TYPE_BG_ID-error' : undefined}
        />
        <FieldError id={'LEAVE_TYPE_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'TYPE_NAME'}>
          Type Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={typeNameRef}
          id={'TYPE_NAME'}
          name={'TYPE_NAME'}
          type={'text'}
          className={fieldClass(errors.TYPE_NAME)}
          placeholder={'Enter type name'}
          value={values.TYPE_NAME}
          maxLength={50}
          required
          aria-invalid={Boolean(errors.TYPE_NAME)}
          aria-describedby={errors.TYPE_NAME ? 'TYPE_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'TYPE_NAME-error'} message={errors.TYPE_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'LEAVE_TYPE_SHORT_NAME'}>
          Short Name
        </label>
        <input
          id={'LEAVE_TYPE_SHORT_NAME'}
          name={'SHORT_NAME'}
          type={'text'}
          className={fieldClass(errors.SHORT_NAME)}
          placeholder={'Enter short name'}
          value={values.SHORT_NAME}
          maxLength={5}
          aria-invalid={Boolean(errors.SHORT_NAME)}
          aria-describedby={
            errors.SHORT_NAME ? 'LEAVE_TYPE_SHORT_NAME-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError id={'LEAVE_TYPE_SHORT_NAME-error'} message={errors.SHORT_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'LEAVE_TYPE_SORT_ORDER'}>
          Sort Order
        </label>
        <input
          id={'LEAVE_TYPE_SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          placeholder={'Enter sort order'}
          value={values.SORT_ORDER}
          min={'0'}
          step={'any'}
          inputMode={'decimal'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={
            errors.SORT_ORDER ? 'LEAVE_TYPE_SORT_ORDER-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError id={'LEAVE_TYPE_SORT_ORDER-error'} message={errors.SORT_ORDER} />
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

export default LeaveTypeForm
