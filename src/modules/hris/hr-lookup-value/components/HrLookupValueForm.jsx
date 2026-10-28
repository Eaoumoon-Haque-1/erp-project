/**
 * @file Controlled form presentation for HR Lookup Value.
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

function HrLookupValueForm({
  values,
  errors,
  businessGroupOptions,
  hrLookupTypeOptions,
  typeRef,
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'BG_ID'}>
          Group Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'BG_ID'}
          name={'BG_ID'}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? 'LOOKUP_VALUE_BG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Group Name--</option>
          {businessGroupOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'LOOKUP_VALUE_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'TYPE_ID'}>
          Type
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          ref={typeRef}
          id={'TYPE_ID'}
          name={'TYPE_ID'}
          className={fieldClass(errors.TYPE_ID)}
          value={values.TYPE_ID}
          required
          aria-invalid={Boolean(errors.TYPE_ID)}
          aria-describedby={errors.TYPE_ID ? 'LOOKUP_VALUE_TYPE_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Type--</option>
          {hrLookupTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'LOOKUP_VALUE_TYPE_ID-error'} message={errors.TYPE_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'LOOKUP_VALUE'}>
          Value
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'LOOKUP_VALUE'}
          name={'VALUE'}
          type={'text'}
          className={fieldClass(errors.VALUE)}
          value={values.VALUE}
          minLength={2}
          maxLength={20}
          placeholder={'Enter value'}
          required
          aria-invalid={Boolean(errors.VALUE)}
          aria-describedby={errors.VALUE ? 'LOOKUP_VALUE-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'LOOKUP_VALUE-error'} message={errors.VALUE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'LOOKUP_VALUE_SORT_ORDER'}>Sort Order</label>
        <input
          id={'LOOKUP_VALUE_SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          value={values.SORT_ORDER}
          min={'1'}
          step={'1'}
          inputMode={'numeric'}
          placeholder={'Enter sort order'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'LOOKUP_VALUE_SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'LOOKUP_VALUE_SORT_ORDER-error'} message={errors.SORT_ORDER} />
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

export default HrLookupValueForm
