/** @file Controlled Supplier Information form (INV_SUPPLIER fields). */
import { isRequired } from '../../../../config/devFlags'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function Label({ name, text, required }) {
  return (
    <label className={'erp-field-label'} htmlFor={name}>
      {text}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
    </label>
  )
}

function TextField({ name, label, value, error, maxLength, required = true, inputRef, onChange }) {
  const mustFill = required && isRequired()
  return (
    <div>
      <Label name={name} text={label} required={mustFill} />
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={'text'}
        className={fieldClass(error)}
        value={value}
        maxLength={maxLength}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={mustFill}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function VendorSupplierMasterForm({
  values,
  errors,
  groupName,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  supplierNameRef,
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'SUPPLIER_BG_ID-display'}>Group Name</label>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'SUPPLIER_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={groupName}
          readOnly
        />
      </div>

      <div>
        <Label name={'BU_ID'} text={'Business Unit'} required />
        <select
          id={'BU_ID'}
          name={'BU_ID'}
          className={fieldClass(errors.BU_ID, businessUnitLocked)}
          value={values.BU_ID}
          required
          disabled={unitsLoading || businessUnitLocked}
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={errors.BU_ID ? 'BU_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>
            {unitsLoading ? 'Loading Business Units...' : '--Select Business Unit--'}
          </option>
          {businessUnitOptions.map((unit) => (
            <option key={unit.value} value={unit.value}>{unit.label}</option>
          ))}
        </select>
        <FieldError id={'BU_ID-error'} message={errors.BU_ID} />
      </div>

      <TextField name={'SUPPLIER_NAME'} label={'Supplier Name'} value={values.SUPPLIER_NAME} error={errors.SUPPLIER_NAME} maxLength={150} inputRef={supplierNameRef} onChange={onChange} />
      <TextField name={'SUPPLIER_CODE'} label={'Supplier Code'} value={values.SUPPLIER_CODE} error={errors.SUPPLIER_CODE} maxLength={30} onChange={onChange} />
      <TextField name={'CONTACT_PERSON'} label={'Contact Person'} value={values.CONTACT_PERSON} error={errors.CONTACT_PERSON} maxLength={100} onChange={onChange} />
      <TextField name={'PHONE'} label={'Phone'} value={values.PHONE} error={errors.PHONE} maxLength={30} onChange={onChange} />
      <TextField name={'EMAIL'} label={'Email'} value={values.EMAIL} error={errors.EMAIL} maxLength={150} onChange={onChange} />

      <div>
        <Label name={'ADDRESS'} text={'Address'} required={isRequired()} />
        <textarea
          id={'ADDRESS'}
          name={'ADDRESS'}
          className={fieldClass(errors.ADDRESS)}
          value={values.ADDRESS}
          maxLength={255}
          rows={2}
          placeholder={'Enter address'}
          required={isRequired()}
          aria-invalid={Boolean(errors.ADDRESS)}
          aria-describedby={errors.ADDRESS ? 'ADDRESS-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ADDRESS-error'} message={errors.ADDRESS} />
      </div>

      <TextField name={'TAX_ID'} label={'Tax ID / BIN'} value={values.TAX_ID} error={errors.TAX_ID} maxLength={50} onChange={onChange} />
      <TextField name={'COMPANY_TYPE'} label={'Company Type'} value={values.COMPANY_TYPE} error={errors.COMPANY_TYPE} maxLength={50} required={false} onChange={onChange} />

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

export default VendorSupplierMasterForm
