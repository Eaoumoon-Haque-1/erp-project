/** @file Controlled presentation component for Asset Group fields. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function AssetGroupForm({ values, errors, departmentOptions, assetGroupRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_GROUP'}>
          Asset Group<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={assetGroupRef}
          id={'ASSET_GROUP'}
          name={'ASSET_GROUP'}
          type={'text'}
          className={fieldClass(errors.ASSET_GROUP)}
          value={values.ASSET_GROUP}
          placeholder={'Enter asset group'}
          required
          aria-invalid={Boolean(errors.ASSET_GROUP)}
          aria-describedby={errors.ASSET_GROUP ? 'ASSET_GROUP-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ASSET_GROUP-error'} message={errors.ASSET_GROUP} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_OWNER_ID'}>
          Asset Owner<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'ASSET_OWNER_ID'}
          name={'ASSET_OWNER_ID'}
          className={fieldClass(errors.ASSET_OWNER_ID)}
          value={values.ASSET_OWNER_ID}
          required
          aria-invalid={Boolean(errors.ASSET_OWNER_ID)}
          aria-describedby={errors.ASSET_OWNER_ID ? 'ASSET_OWNER_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Department--</option>
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'ASSET_OWNER_ID-error'} message={errors.ASSET_OWNER_ID} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} />
          <span>Is Active</span>
        </label>
      </div>
    </div>
  )
}

export default AssetGroupForm

