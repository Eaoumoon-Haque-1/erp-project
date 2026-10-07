/**
 * @file Controlled form presentation for User.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function TextField({ name, label, values, errors, inputRef, onChange, digitsOnly = false, ...props }) {
  const handleChange = (event) => {
    if (!digitsOnly) {
      onChange(event)
      return
    }
    const digits = event.target.value.replace(/\D/g, '')
    if (digits !== event.target.value) event.target.value = digits
    onChange(event)
  }
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{props.required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      {props.type === 'date' ? (
        <DateInput
          id={name}
          name={name}
          className={fieldClass(errors[name], props.readOnly)}
          value={values[name]}
          min={props.min}
          required={props.required}
          readOnly={props.readOnly}
          disabled={props.disabled}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          onChange={handleChange}
        />
      ) : (
        <input ref={inputRef} id={name} name={name} className={fieldClass(errors[name], props.readOnly)} value={values[name]} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={handleChange} {...props} />
      )}
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function SelectField({ name, label, values, errors, options, onChange, disabled = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}<span className={'erp-required'} aria-hidden={'true'}>*</span>
      </label>
      <select id={name} name={name} className={fieldClass(errors[name])} value={values[name]} required disabled={disabled} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange}>
        <option value={''}>Select...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function UserForm({
  values,
  errors,
  groupName,
  userNameRef,
  businessUnitOptions = [],
  roleOptions = [],
  userTypeOptions = [],
  onChange,
}) {
  return (
    <div className={'erp-form-grid erp-user-form-grid'}>
      <TextField name={'BG_ID'} label={'Group Name'} values={{ ...values, BG_ID: groupName }} errors={errors} type={'text'} readOnly required onChange={onChange} />
      <SelectField name={'BU_ID'} label={'Business Unit'} values={values} errors={errors} options={businessUnitOptions} onChange={onChange} />
      <TextField name={'FULL_NAME'} label={'Full Name'} values={values} errors={errors} type={'text'} maxLength={100} placeholder={'Enter Full Name'} required onChange={onChange} />
      <SelectField name={'USER_TYPE_ID'} label={'User Type'} values={values} errors={errors} options={userTypeOptions} onChange={onChange} />
      <TextField name={'USER_NAME'} label={'User Name'} values={values} errors={errors} inputRef={userNameRef} type={'text'} maxLength={20} placeholder={'Enter User Name'} required onChange={onChange} />
      <TextField name={'EMAIL'} label={'Email'} values={values} errors={errors} type={'email'} maxLength={100} placeholder={'Enter Email'} required onChange={onChange} />
      <TextField name={'MOBILE_NO'} label={'Mobile No'} values={values} errors={errors} type={'tel'} inputMode={'numeric'} digitsOnly maxLength={11} placeholder={'01XXXXXXXXX'} onChange={onChange} />
      <TextField name={'PASSWORD'} label={'Password'} values={values} errors={errors} type={'password'} minLength={8} maxLength={64} placeholder={'Enter Password'} required autoComplete={'new-password'} onChange={onChange} />
      <TextField name={'CONFIRM_PASSWORD'} label={'Confirm Password'} values={values} errors={errors} type={'password'} inputMode={'numeric'} minLength={8} maxLength={64} placeholder={'Confirm Password'} required autoComplete={'new-password'} onChange={onChange} />
      <TextField name={'FROM_DATE'} label={'Validate From Date'} values={values} errors={errors} type={'date'} onChange={onChange} />
      <TextField name={'TO_DATE'} label={'Validate To Date'} values={values} errors={errors} type={'date'} min={values.FROM_DATE || undefined} onChange={onChange} />
      <SelectField name={'ROLE_ID'} label={'User Role'} values={values} errors={errors} options={roleOptions} onChange={onChange} />
      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-checkbox-field'}>
          <input type={'checkbox'} name={'ANDROID_ID'} checked={values.ANDROID_ID === '1'} onChange={onChange} />
          <span>Android ID Fixed</span>
        </label>
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

export default UserForm
