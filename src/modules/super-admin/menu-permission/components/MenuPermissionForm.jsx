/**
 * @file Controlled form presentation for Menu Permission.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function MenuPermissionForm({
  values,
  errors,
  permissionNameRef,
  moduleOptions = [],
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'PERMISSION_NAME'}>
          Permission Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={permissionNameRef}
          id={'PERMISSION_NAME'}
          name={'PERMISSION_NAME'}
          type={'text'}
          className={fieldClass(errors.PERMISSION_NAME)}
          value={values.PERMISSION_NAME}
          maxLength={100}
          placeholder={'Enter permission name'}
          required
          aria-invalid={Boolean(errors.PERMISSION_NAME)}
          aria-describedby={errors.PERMISSION_NAME ? 'PERMISSION_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'PERMISSION_NAME-error'} message={errors.PERMISSION_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'MODULE_ID'}>
          Module Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'MODULE_ID'}
          name={'MODULE_ID'}
          className={fieldClass(errors.MODULE_ID)}
          value={values.MODULE_ID}
          required
          aria-invalid={Boolean(errors.MODULE_ID)}
          aria-describedby={errors.MODULE_ID ? 'MODULE_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Module--</option>
          {moduleOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'MODULE_ID-error'} message={errors.MODULE_ID} />
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

export default MenuPermissionForm
