/**
 * @file Controlled form presentation for Department.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
/**
 * REFERENCE FORM COMPONENT
 *
 * This file demonstrates the standard field markup to copy into another
 * feature: label, required star, controlled value, validation styling,
 * accessibility attributes, onChange, and a field-level error message.
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

function DepartmentForm({
  values,
  errors,
  businessGroup,
  onChange,
  departmentNameRef,
}) {
  return (
    // erp-form-grid supplies the project's responsive equal-width columns.
    <div className={'erp-form-grid'}>
      {/*
        API-derived/read-only pattern: submit the real ID in a hidden input and
        show the readable name in a normal-size read-only control.
      */}
      <div>
        <label className={'erp-field-label'} htmlFor={'DEPT_BG_ID-display'}>
          Group Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'DEPT_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={businessGroup.GROUP_NAME}
          readOnly
          aria-describedby={errors.BG_ID ? 'DEPT_BG_ID-error' : undefined}
        />
        <FieldError id={'DEPT_BG_ID-error'} message={errors.BG_ID} />
      </div>

      {/* Standard required text-field pattern. */}
      <div>
        <label className={'erp-field-label'} htmlFor={'DEPARTMENT_NAME'}>
          Department Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={departmentNameRef}
          id={'DEPARTMENT_NAME'}
          name={'DEPARTMENT_NAME'}
          type={'text'}
          className={fieldClass(errors.DEPARTMENT_NAME)}
          placeholder={'Enter department name'}
          value={values.DEPARTMENT_NAME}
          maxLength={100}
          required
          aria-invalid={Boolean(errors.DEPARTMENT_NAME)}
          aria-describedby={
            errors.DEPARTMENT_NAME ? 'DEPARTMENT_NAME-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={'DEPARTMENT_NAME-error'}
          message={errors.DEPARTMENT_NAME}
        />
      </div>

      {/* Optional fields have no red star but still show validation errors. */}
      <div>
        <label className={'erp-field-label'} htmlFor={'SHORT_NAME'}>Short Name</label>
        <input
          id={'SHORT_NAME'}
          name={'SHORT_NAME'}
          type={'text'}
          className={fieldClass(errors.SHORT_NAME)}
          placeholder={'Enter short name'}
          value={values.SHORT_NAME}
          maxLength={5}
          aria-invalid={Boolean(errors.SHORT_NAME)}
          aria-describedby={errors.SHORT_NAME ? 'SHORT_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'SHORT_NAME-error'} message={errors.SHORT_NAME} />
      </div>

      {/* HTML constraints help input, while validation remains authoritative. */}
      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input
          id={'SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          placeholder={'Enter sort order'}
          value={values.SORT_ORDER}
          min={'0'}
          step={'any'}
          inputMode={'decimal'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
      </div>

      {/* Status switches use string flags and normally default to "1". */}
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

export default DepartmentForm
