/**
 * @file Controlled form presentation for User.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import { useState } from 'react'
import DateInput from '../../../../components/shared/DateInput'

function EyeIcon({ hidden }) {
  return (
    <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}>
      {hidden ? (
        <>
          <path d={'M3 3l18 18'} />
          <path d={'M10.6 10.6a2 2 0 0 0 2.8 2.8'} />
          <path d={'M9.9 4.2A10.5 10.5 0 0 1 21 12a14 14 0 0 1-2.1 3.2'} />
          <path d={'M6.6 6.6A14 14 0 0 0 3 12c2.3 4 5.3 6 9 6a9.7 9.7 0 0 0 3-.5'} />
        </>
      ) : (
        <>
          <path d={'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12'} />
          <circle cx={'12'} cy={'12'} r={'2.5'} />
        </>
      )}
    </svg>
  )
}

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function TextField({ name, label, values, errors, inputRef, onChange, digitsOnly = false, passwordVisible = false, onTogglePassword, ...props }) {
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
      ) : props.type === 'password' ? (
        <div className={'auth-password-field'}>
          <input ref={inputRef} id={name} name={name} className={fieldClass(errors[name], props.readOnly)} value={values[name]} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={handleChange} {...props} type={passwordVisible ? 'text' : 'password'} />
          <button
            type={'button'}
            aria-label={passwordVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            title={passwordVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            onClick={onTogglePassword}
          >
            <EyeIcon hidden={passwordVisible} />
          </button>
        </div>
      ) : (
        <input ref={inputRef} id={name} name={name} className={fieldClass(errors[name], props.readOnly)} value={values[name]} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={handleChange} {...props} />
      )}
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function SelectField({ name, label, values, errors, options, onChange, disabled = false, placeholder = 'Select...', required = true }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <select id={name} name={name} className={fieldClass(errors[name])} value={values[name]} required={required} disabled={disabled} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange}>
        <option value={''}>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function UserForm({
  values,
  errors,
  groupOptions = [],
  groupsLoading = false,
  unitsLoading = false,
  userNameRef,
  businessUnitOptions = [],
  roleOptions = [],
  userTypeOptions = [],
  employeeDisplayValue = '',
  showEmployeeField = false,
  requirePassword = true,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className={'erp-form-grid erp-user-form-grid'}>
      <SelectField name={'BG_ID'} label={'Group Name'} values={values} errors={errors} options={groupOptions} disabled={groupsLoading} placeholder={groupsLoading ? 'Loading Business Groups...' : 'Select Group...'} onChange={onChange} />
      <SelectField name={'BU_ID'} label={'Business Unit'} values={values} errors={errors} options={businessUnitOptions} disabled={!values.BG_ID || unitsLoading} placeholder={unitsLoading ? 'Loading Business Units...' : 'Select Business Unit...'} onChange={onChange} />
      <TextField name={'FULL_NAME'} label={'Full Name'} values={values} errors={errors} type={'text'} maxLength={100} placeholder={'Enter Full Name'} required onChange={onChange} />
      <SelectField name={'USER_TYPE_ID'} label={'User Type'} values={values} errors={errors} options={userTypeOptions} onChange={onChange} />
      <TextField name={'USER_NAME'} label={'User Name'} values={values} errors={errors} inputRef={userNameRef} type={'text'} maxLength={20} placeholder={'Enter User Name'} required onChange={onChange} />
      <TextField name={'EMAIL'} label={'Email'} values={values} errors={errors} type={'email'} maxLength={100} placeholder={'Enter Email'} onChange={onChange} />
      <TextField name={'MOBILE_NO'} label={'Mobile No'} values={values} errors={errors} type={'tel'} inputMode={'numeric'} digitsOnly maxLength={11} placeholder={'01XXXXXXXXX'} onChange={onChange} />
      <TextField name={'PASSWORD'} label={'Password'} values={values} errors={errors} type={'password'} minLength={8} maxLength={64} placeholder={requirePassword ? 'Enter Password' : 'Leave blank to keep current password'} required={requirePassword} autoComplete={'new-password'} passwordVisible={showPassword} onTogglePassword={() => setShowPassword((current) => !current)} onChange={onChange} />
      <TextField name={'CONFIRM_PASSWORD'} label={'Confirm Password'} values={values} errors={errors} type={'password'} minLength={8} maxLength={64} placeholder={requirePassword ? 'Confirm Password' : 'Confirm only a new password'} required={requirePassword} autoComplete={'new-password'} passwordVisible={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword((current) => !current)} onChange={onChange} />
      <TextField name={'FROM_DATE'} label={'Validate From Date'} values={values} errors={errors} type={'date'} onChange={onChange} />
      <TextField name={'TO_DATE'} label={'Validate To Date'} values={values} errors={errors} type={'date'} min={values.FROM_DATE || undefined} onChange={onChange} />
      <SelectField name={'ROLE_ID'} label={'User Role'} values={values} errors={errors} options={roleOptions} onChange={onChange} />
      {showEmployeeField && (
        <TextField
          name={'ASSIGNED_EMPLOYEE_NAME'}
          label={'Employee Name'}
          values={{ ASSIGNED_EMPLOYEE_NAME: employeeDisplayValue }}
          errors={errors}
          type={'text'}
          placeholder={'Select an employee below'}
          readOnly
          onChange={onChange}
        />
      )}
      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-checkbox-field'}>
          <input type={'checkbox'} name={'IS_ANDROID_FIXED'} checked={values.IS_ANDROID_FIXED === '1'} onChange={onChange} />
          <span>Android ID Fixed</span>
        </label>
      </div>
      <TextField name={'ANDROID_ID'} label={'Android ID'} values={values} errors={errors} type={'text'} maxLength={100} placeholder={'Enter Android ID'} onChange={onChange} />
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
