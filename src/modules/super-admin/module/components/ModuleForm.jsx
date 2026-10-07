/**
 * @file Controlled form presentation for Module.
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

function ModuleForm({ values, errors, moduleNameRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'MODULE_NAME'}>
          Module Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={moduleNameRef}
          id={'MODULE_NAME'}
          name={'MODULE_NAME'}
          type={'text'}
          className={fieldClass(errors.MODULE_NAME)}
          value={values.MODULE_NAME}
          maxLength={100}
          placeholder={'Enter module name'}
          required
          aria-invalid={Boolean(errors.MODULE_NAME)}
          aria-describedby={errors.MODULE_NAME ? 'MODULE_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'MODULE_NAME-error'} message={errors.MODULE_NAME} />
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

export default ModuleForm
