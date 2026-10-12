/** @file Controlled Location Master form (ASSET_LOCATION fields). */
import { isRequired } from '../../../../config/devFlags'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function Label({ name, text, required = true }) {
  return (
    <label className={'erp-field-label'} htmlFor={name}>
      {text}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
    </label>
  )
}

function SelectField({ name, label, value, error, options, placeholder, loading, disabled, locked, onChange }) {
  return (
    <div>
      <Label name={name} text={label} />
      <select
        id={name}
        name={name}
        className={fieldClass(error, locked)}
        value={value}
        required
        disabled={loading || disabled || locked}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={''}>{loading ? `Loading ${label}s...` : placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function TextField({ name, label, value, error, maxLength, minLength, inputRef, onChange }) {
  return (
    <div>
      <Label name={name} text={label} required={isRequired()} />
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={'text'}
        className={fieldClass(error)}
        value={value}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={isRequired()}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function LocationMasterForm({
  values,
  errors,
  groupName,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  custodianOptions = [],
  custodiansLoading = false,
  subCustodianOptions = [],
  departmentOptions = [],
  departmentsLoading = false,
  locationNameRef,
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'LOCATION_BG_ID-display'}>Group Name</label>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'LOCATION_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={groupName}
          readOnly
        />
      </div>

      <SelectField
        name={'BU_ID'}
        label={'Business Unit'}
        value={values.BU_ID}
        error={errors.BU_ID}
        options={businessUnitOptions}
        placeholder={'--Select Business Unit--'}
        loading={unitsLoading}
        locked={businessUnitLocked}
        onChange={onChange}
      />

      <SelectField
        name={'CUSTODIAN_ID'}
        label={'Custodian'}
        value={values.CUSTODIAN_ID}
        error={errors.CUSTODIAN_ID}
        options={custodianOptions}
        placeholder={'--Select Custodian--'}
        loading={custodiansLoading}
        disabled={!values.BU_ID}
        onChange={onChange}
      />

      <SelectField
        name={'SUB_CUSTODIAN_ID'}
        label={'Sub Custodian'}
        value={values.SUB_CUSTODIAN_ID}
        error={errors.SUB_CUSTODIAN_ID}
        options={subCustodianOptions}
        placeholder={'--Select Sub Custodian--'}
        disabled={!values.CUSTODIAN_ID}
        onChange={onChange}
      />

      <TextField name={'LOCATION_NAME'} label={'Location Name'} value={values.LOCATION_NAME} error={errors.LOCATION_NAME} minLength={2} maxLength={100} inputRef={locationNameRef} onChange={onChange} />
      <TextField name={'LOCATION_CODE'} label={'Location Code'} value={values.LOCATION_CODE} error={errors.LOCATION_CODE} minLength={2} maxLength={30} onChange={onChange} />

      <div>
        <Label name={'ADDRESS'} text={'Address'} required={isRequired()} />
        <textarea
          id={'ADDRESS'}
          name={'ADDRESS'}
          className={fieldClass(errors.ADDRESS)}
          value={values.ADDRESS}
          minLength={5}
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

      <SelectField
        name={'DEPT_ID'}
        label={'Department'}
        value={values.DEPT_ID}
        error={errors.DEPT_ID}
        options={departmentOptions}
        placeholder={'--Select Department--'}
        loading={departmentsLoading}
        onChange={onChange}
      />

      <TextField name={'BUILDING'} label={'Building'} value={values.BUILDING} error={errors.BUILDING} maxLength={100} onChange={onChange} />
      <TextField name={'FLOOR'} label={'Floor'} value={values.FLOOR} error={errors.FLOOR} maxLength={20} onChange={onChange} />
      <TextField name={'ROOM'} label={'Room'} value={values.ROOM} error={errors.ROOM} maxLength={50} onChange={onChange} />

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

export default LocationMasterForm
