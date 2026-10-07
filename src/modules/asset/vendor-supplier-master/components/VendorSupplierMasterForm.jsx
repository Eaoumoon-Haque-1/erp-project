/** @file Controlled four-column presentation for ASSET_VENDOR. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function TextField({
  name,
  label,
  value,
  error,
  placeholder,
  maxLength,
  type = 'text',
  inputRef,
  onChange,
}) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}<span className={'erp-required'} aria-hidden={'true'}>*</span>
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        className={fieldClass(error)}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function VendorSupplierMasterForm({ values, errors, vendorNameRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <TextField name={'VENDOR_NAME'} label={'Vendor Name'} value={values.VENDOR_NAME} error={errors.VENDOR_NAME} placeholder={'Enter vendor name'} maxLength={150} inputRef={vendorNameRef} onChange={onChange} />
      <TextField name={'VENDOR_CODE'} label={'Vendor Code'} value={values.VENDOR_CODE} error={errors.VENDOR_CODE} placeholder={'Enter vendor code'} maxLength={30} onChange={onChange} />
      <TextField name={'CONTACT_PERSON'} label={'Contact Person'} value={values.CONTACT_PERSON} error={errors.CONTACT_PERSON} placeholder={'Enter contact person'} maxLength={100} onChange={onChange} />
      <TextField name={'PHONE'} label={'Phone'} value={values.PHONE} error={errors.PHONE} placeholder={'+880 1XXXXXXXXX'} maxLength={20} type={'tel'} onChange={onChange} />
      <TextField name={'EMAIL'} label={'Email'} value={values.EMAIL} error={errors.EMAIL} placeholder={'Enter email address'} maxLength={150} type={'email'} onChange={onChange} />

      <div>
        <label className={'erp-field-label'} htmlFor={'ADDRESS'}>
          Address<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <textarea
          id={'ADDRESS'}
          name={'ADDRESS'}
          className={fieldClass(errors.ADDRESS)}
          value={values.ADDRESS}
          maxLength={255}
          rows={2}
          placeholder={'Enter vendor address'}
          required
          aria-invalid={Boolean(errors.ADDRESS)}
          aria-describedby={errors.ADDRESS ? 'ADDRESS-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ADDRESS-error'} message={errors.ADDRESS} />
      </div>

      <TextField name={'TAX_ID'} label={'Tax ID / BIN'} value={values.TAX_ID} error={errors.TAX_ID} placeholder={'Enter Tax ID / BIN'} maxLength={50} onChange={onChange} />

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

export default VendorSupplierMasterForm
