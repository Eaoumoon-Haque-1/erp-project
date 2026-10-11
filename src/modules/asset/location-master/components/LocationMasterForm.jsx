/** @file Controlled four-column presentation for ASSET_LOCATION. */
import { getSubCustodianOptions } from '../data/locationMasterOptions'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function TextField({ name, label, value, error, placeholder, maxLength = 100, inputRef, onChange }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}<span className={'erp-required'} aria-hidden={'true'}>*</span>
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={'text'}
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

function LocationMasterForm({ values, errors, references, locationNameRef, onChange }) {
  const subCustodians = getSubCustodianOptions(values.CUSTODIAN_ID, references.custodians)

  return (
    <div className={'erp-form-grid'}>
      <TextField name={'LOCATION_NAME'} label={'Location Name'} value={values.LOCATION_NAME} error={errors.LOCATION_NAME} placeholder={'Enter location name'} inputRef={locationNameRef} onChange={onChange} />
      <TextField name={'LOCATION_CODE'} label={'Location Code'} value={values.LOCATION_CODE} error={errors.LOCATION_CODE} placeholder={'Enter location code'} maxLength={30} onChange={onChange} />

      <div>
        <label className={'erp-field-label'} htmlFor={'CUSTODIAN_ID'}>
          Custodian<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'CUSTODIAN_ID'} name={'CUSTODIAN_ID'} className={fieldClass(errors.CUSTODIAN_ID)} value={values.CUSTODIAN_ID} required aria-invalid={Boolean(errors.CUSTODIAN_ID)} aria-describedby={errors.CUSTODIAN_ID ? 'CUSTODIAN_ID-error' : undefined} onChange={onChange}>
          <option value={''}>--Select Custodian--</option>
          {references.custodians.map((record) => (
            <option key={record.ID} value={record.ID}>{record.CUSTODIAN_NAME}</option>
          ))}
        </select>
        <FieldError id={'CUSTODIAN_ID-error'} message={errors.CUSTODIAN_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SUB_CUSTODIAN_ID'}>
          Sub Custodian<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'SUB_CUSTODIAN_ID'} name={'SUB_CUSTODIAN_ID'} className={fieldClass(errors.SUB_CUSTODIAN_ID)} value={values.SUB_CUSTODIAN_ID} disabled={!values.CUSTODIAN_ID} required aria-invalid={Boolean(errors.SUB_CUSTODIAN_ID)} aria-describedby={errors.SUB_CUSTODIAN_ID ? 'SUB_CUSTODIAN_ID-error' : undefined} onChange={onChange}>
          <option value={''}>--Select Sub Custodian--</option>
          {subCustodians.map((record) => (
            <option key={record.ID} value={record.ID}>{record.SUB_CUSTODIAN_NAME}</option>
          ))}
        </select>
        <FieldError id={'SUB_CUSTODIAN_ID-error'} message={errors.SUB_CUSTODIAN_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ADDRESS'}>
          Address<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <textarea id={'ADDRESS'} name={'ADDRESS'} className={fieldClass(errors.ADDRESS)} value={values.ADDRESS} maxLength={255} rows={2} placeholder={'Enter address'} required aria-invalid={Boolean(errors.ADDRESS)} aria-describedby={errors.ADDRESS ? 'ADDRESS-error' : undefined} onChange={onChange} />
        <FieldError id={'ADDRESS-error'} message={errors.ADDRESS} />
      </div>

      <TextField name={'BUILDING'} label={'Building'} value={values.BUILDING} error={errors.BUILDING} placeholder={'Enter building'} onChange={onChange} />
      <TextField name={'FLOOR'} label={'Floor'} value={values.FLOOR} error={errors.FLOOR} placeholder={'Enter floor'} onChange={onChange} />
      <TextField name={'ROOM'} label={'Room'} value={values.ROOM} error={errors.ROOM} placeholder={'Enter room'} onChange={onChange} />

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

export default LocationMasterForm
