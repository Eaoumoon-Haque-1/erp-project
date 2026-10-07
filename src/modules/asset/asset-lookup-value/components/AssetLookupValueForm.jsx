/** @file Controlled presentation component for Asset Lookup Value fields. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return [
    'erp-form-control',
    readOnly ? 'erp-readonly' : '',
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function AssetLookupValueForm({ values, errors, typeOptions, valueRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'GROUP_NAME'}>
          Group Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'GROUP_NAME'}
          name={'GROUP_NAME'}
          type={'text'}
          className={fieldClass(errors.BG_ID, true)}
          value={values.GROUP_NAME}
          readOnly
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? 'asset-value-BG_ID-error' : undefined}
        />
        <FieldError id={'asset-value-BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'TYPE_ID'}>
          Type<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'TYPE_ID'}
          name={'TYPE_ID'}
          className={fieldClass(errors.TYPE_ID)}
          value={values.TYPE_ID}
          required
          aria-invalid={Boolean(errors.TYPE_ID)}
          aria-describedby={errors.TYPE_ID ? 'asset-value-TYPE_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Type--</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'asset-value-TYPE_ID-error'} message={errors.TYPE_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'VALUE'}>
          Value<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={valueRef}
          id={'VALUE'}
          name={'VALUE'}
          type={'text'}
          className={fieldClass(errors.VALUE)}
          value={values.VALUE}
          minLength={2}
          maxLength={20}
          placeholder={'Enter value'}
          required
          aria-invalid={Boolean(errors.VALUE)}
          aria-describedby={errors.VALUE ? 'asset-value-VALUE-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'asset-value-VALUE-error'} message={errors.VALUE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input
          id={'SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          value={values.SORT_ORDER}
          min={'0.01'}
          step={'any'}
          placeholder={'Enter sort order'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'asset-value-SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'asset-value-SORT_ORDER-error'} message={errors.SORT_ORDER} />
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

export default AssetLookupValueForm

