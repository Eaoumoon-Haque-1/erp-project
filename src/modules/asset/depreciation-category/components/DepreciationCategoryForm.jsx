/** @file Controlled presentation component for Depreciation Category fields. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function SelectField({ name, label, value, error, options, onChange }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}<span className={'erp-required'} aria-hidden={'true'}>*</span>
      </label>
      <select id={name} name={name} className={fieldClass(error)} value={value} required aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} onChange={onChange}>
        <option value={''}>--Select {label}--</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function DepreciationCategoryForm({
  values,
  errors,
  methodOptions,
  assetTypeOptions,
  departmentOptions,
  categoryRef,
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'DEPRI_CATEGORY'}>Depreciation Category<span className={'erp-required'}>*</span></label>
        <input ref={categoryRef} id={'DEPRI_CATEGORY'} name={'DEPRI_CATEGORY'} type={'text'} className={fieldClass(errors.DEPRI_CATEGORY)} value={values.DEPRI_CATEGORY} placeholder={'Enter depreciation category'} required aria-invalid={Boolean(errors.DEPRI_CATEGORY)} aria-describedby={errors.DEPRI_CATEGORY ? 'DEPRI_CATEGORY-error' : undefined} onChange={onChange} />
        <FieldError id={'DEPRI_CATEGORY-error'} message={errors.DEPRI_CATEGORY} />
      </div>

      <SelectField name={'DEPRI_METHOD'} label={'Depreciation Method'} value={values.DEPRI_METHOD} error={errors.DEPRI_METHOD} options={methodOptions} onChange={onChange} />
      <SelectField name={'ASSET_TYPE'} label={'Asset Type'} value={values.ASSET_TYPE} error={errors.ASSET_TYPE} options={assetTypeOptions} onChange={onChange} />

      <div>
        <label className={'erp-field-label'} htmlFor={'DEPRI_LIFE'}>Depreciation Life (Months)<span className={'erp-required'}>*</span></label>
        <input id={'DEPRI_LIFE'} name={'DEPRI_LIFE'} type={'number'} className={fieldClass(errors.DEPRI_LIFE)} value={values.DEPRI_LIFE} min={'1'} step={'1'} placeholder={'Enter months'} required aria-invalid={Boolean(errors.DEPRI_LIFE)} aria-describedby={errors.DEPRI_LIFE ? 'DEPRI_LIFE-error' : undefined} onChange={onChange} />
        <FieldError id={'DEPRI_LIFE-error'} message={errors.DEPRI_LIFE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'DEPRI_PERCENTAGE'}>Depreciation (%)<span className={'erp-required'}>*</span></label>
        <input id={'DEPRI_PERCENTAGE'} name={'DEPRI_PERCENTAGE'} type={'number'} className={fieldClass(errors.DEPRI_PERCENTAGE)} value={values.DEPRI_PERCENTAGE} min={'0.01'} max={'100'} step={'any'} placeholder={'Enter percentage'} required aria-invalid={Boolean(errors.DEPRI_PERCENTAGE)} aria-describedby={errors.DEPRI_PERCENTAGE ? 'DEPRI_PERCENTAGE-error' : undefined} onChange={onChange} />
        <FieldError id={'DEPRI_PERCENTAGE-error'} message={errors.DEPRI_PERCENTAGE} />
      </div>

      <SelectField name={'ASSET_OWNER'} label={'Asset Owner'} value={values.ASSET_OWNER} error={errors.ASSET_OWNER} options={departmentOptions} onChange={onChange} />

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}><input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} /><span>Is Active</span></label>
      </div>
    </div>
  )
}

export default DepreciationCategoryForm

