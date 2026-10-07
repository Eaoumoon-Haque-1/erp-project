/** @file Controlled presentation component for Asset Lookup Type fields. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function AssetLookupTypeForm({ values, errors, typeNameRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
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
          value={values.TYPE_NAME}
          minLength={2}
          maxLength={50}
          placeholder={'Enter type name'}
          required
          aria-invalid={Boolean(errors.TYPE_NAME)}
          aria-describedby={errors.TYPE_NAME ? 'asset-TYPE_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'asset-TYPE_NAME-error'} message={errors.TYPE_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'CODE'}>Code</label>
        <input
          id={'CODE'}
          name={'CODE'}
          type={'text'}
          className={fieldClass(errors.CODE)}
          value={values.CODE}
          minLength={2}
          maxLength={10}
          placeholder={'Enter code'}
          aria-invalid={Boolean(errors.CODE)}
          aria-describedby={errors.CODE ? 'asset-CODE-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'asset-CODE-error'} message={errors.CODE} />
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

export default AssetLookupTypeForm

