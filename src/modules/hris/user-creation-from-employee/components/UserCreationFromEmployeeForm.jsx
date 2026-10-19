/**
 * @file Controlled form presentation for User Creation From Employee.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import { useState } from 'react'
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className={'erp-field-error'}>
      {message}
    </p>
  )
}

function fieldClass(error, extra = '') {
  return ['erp-form-control', extra, error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      <span className={'erp-required'} aria-hidden={'true'}>
        *
      </span>
    </label>
  )
}

function PasswordVisibilityIcon({ visible }) {
  return (
    <svg
      viewBox={'0 0 24 24'}
      className={'size-4'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
    >
      <path d={'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z'} />
      <circle cx={'12'} cy={'12'} r={'2.5'} />
      {!visible && <path d={'M3 3l18 18'} />}
    </svg>
  )
}

function UserCreationFromEmployeeForm({
  values,
  errors,
  roleOptions = [],
  userTypeOptions = [],
  passwordRequired = true,
  showPasswordFields = true,
  readOnly = false,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className={'erp-user-creation-form space-y-6'}>
      <fieldset disabled={readOnly} className={'contents'}>
      {/* 5-column ERP Form Grid */}
      <div className={'erp-form-grid'}>
        {/* --- ROW 1 --- */}
        {/* 1. Employee Name (Read-only) */}
        <div>
          <label className={'erp-field-label'} htmlFor={'EMPLOYEE_NAME'}>
            Employee Name
          </label>
          <input
            id={'EMPLOYEE_NAME'}
            name={'EMPLOYEE_NAME'}
            className={'erp-form-control erp-readonly'}
            type={'text'}
            value={values.EMPLOYEE_NAME || ''}
            readOnly
          />
        </div>

        {/* 2. Business Unit (Read-only) */}
        <div>
          <label className={'erp-field-label'} htmlFor={'BUSINESS_UNIT_NAME'}>
            Business Unit
          </label>
          <input
            id={'BUSINESS_UNIT_NAME'}
            name={'BUSINESS_UNIT_NAME'}
            className={'erp-form-control erp-readonly'}
            type={'text'}
            value={values.BUSINESS_UNIT_NAME || ''}
            readOnly
          />
        </div>

        {/* 3. User Name */}
        <div>
          <RequiredLabel htmlFor={'USER_NAME'}>User Name</RequiredLabel>
          <input
            id={'USER_NAME'}
            name={'USER_NAME'}
            type={'text'}
            maxLength={20}
            className={fieldClass(errors.USER_NAME)}
            placeholder={'e.g. srahman'}
            value={values.USER_NAME || ''}
            onChange={onChange}
          />
          <FieldError id={'USER_NAME-error'} message={errors.USER_NAME} />
        </div>

        {/* 4. User Role */}
        <div>
          <RequiredLabel htmlFor={'USER_ROLE'}>User Role</RequiredLabel>
          <select
            id={'USER_ROLE'}
            name={'USER_ROLE'}
            className={fieldClass(errors.USER_ROLE)}
            value={values.USER_ROLE || ''}
            onChange={onChange}
          >
            <option value={''}>--Select User Role--</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <FieldError id={'USER_ROLE-error'} message={errors.USER_ROLE} />
        </div>

        {/* 5. User Type */}
        <div>
          <RequiredLabel htmlFor={'USER_TYPE'}>User Type</RequiredLabel>
          <select
            id={'USER_TYPE'}
            name={'USER_TYPE'}
            className={fieldClass(errors.USER_TYPE)}
            value={values.USER_TYPE || ''}
            onChange={onChange}
          >
            <option value={''}>--Select User Type--</option>
            {userTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <FieldError id={'USER_TYPE-error'} message={errors.USER_TYPE} />
        </div>

        {/* --- ROW 2 --- */}
        {/* 6 (Row 2, Col 1). Password */}
        {showPasswordFields && <div>
          <label className={'erp-field-label'} htmlFor={'PASSWORD'}>Password{passwordRequired && <span className={'erp-required'}>*</span>}</label>
          <div className={'relative'}>
            <input
              id={'PASSWORD'}
              name={'PASSWORD'}
              type={showPassword ? 'text' : 'password'}
              className={fieldClass(errors.PASSWORD, 'pr-11')}
              placeholder={'Min 8 chars (A-Z, a-z, 0-9, #)'}
              value={values.PASSWORD || ''}
              onChange={onChange}
            />
            <button
              type={'button'}
              className={'absolute right-0 top-0 inline-flex h-9 w-10 items-center justify-center border-l border-gray-300 text-gray-600 hover:text-gray-900'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
          <FieldError id={'PASSWORD-error'} message={errors.PASSWORD} />
        </div>}

        {/* 7 (Row 2, Col 2). Confirm Password */}
        {showPasswordFields && <div>
          <label className={'erp-field-label'} htmlFor={'CONFIRM_PASSWORD'}>Confirm Password{passwordRequired && <span className={'erp-required'}>*</span>}</label>
          <div className={'relative'}>
            <input
              id={'CONFIRM_PASSWORD'}
              name={'CONFIRM_PASSWORD'}
              type={showConfirmPassword ? 'text' : 'password'}
              className={fieldClass(errors.CONFIRM_PASSWORD, 'pr-11')}
              placeholder={'Re-type password'}
              value={values.CONFIRM_PASSWORD || ''}
              onChange={onChange}
            />
            <button
              type={'button'}
              className={'absolute right-0 top-0 inline-flex h-9 w-10 items-center justify-center border-l border-gray-300 text-gray-600 hover:text-gray-900'}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              <PasswordVisibilityIcon visible={showConfirmPassword} />
            </button>
          </div>
          <FieldError id={'CONFIRM_PASSWORD-error'} message={errors.CONFIRM_PASSWORD} />
        </div>}

        {/* 8 (Row 2, Col 3). Valid From Date */}
        <div>
          <label className={'erp-field-label'} htmlFor={'VALID_FROM_DATE'}>
            Valid From Date
          </label>
          <DateInput
            id={'VALID_FROM_DATE'}
            name={'VALID_FROM_DATE'}
            className={fieldClass(errors.VALID_FROM_DATE)}
            value={values.VALID_FROM_DATE || ''}
            onChange={onChange}
          />
          <FieldError id={'VALID_FROM_DATE-error'} message={errors.VALID_FROM_DATE} />
        </div>

        {/* 9 (Row 2, Col 4). Valid To Date */}
        <div>
          <label className={'erp-field-label'} htmlFor={'VALID_TO_DATE'}>
            Valid To Date
          </label>
          <DateInput
            id={'VALID_TO_DATE'}
            name={'VALID_TO_DATE'}
            className={fieldClass(errors.VALID_TO_DATE)}
            value={values.VALID_TO_DATE || ''}
            onChange={onChange}
          />
          <FieldError id={'VALID_TO_DATE-error'} message={errors.VALID_TO_DATE} />
        </div>

        {/* 10 (Row 2, Col 5). Android Id Fixed */}
        <div className={'flex flex-col justify-end pb-2'}>
          <label className={'erp-switch-field cursor-pointer items-center'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'IS_ANDROID_ID_FIXED'}
              checked={values.IS_ANDROID_ID_FIXED === '1'}
              onChange={onChange}
            />
            <span className={'text-sm font-semibold text-gray-700'}>Android Id Fixed</span>
          </label>
        </div>

        {values.IS_ANDROID_ID_FIXED === '1' && (
          <div>
            <label className={'erp-field-label'} htmlFor={'ANDROID_ID'}>Android ID</label>
            <input
              id={'ANDROID_ID'}
              name={'ANDROID_ID'}
              type={'text'}
              className={fieldClass(errors.ANDROID_ID)}
              placeholder={'Enter Android ID'}
              value={values.ANDROID_ID || ''}
              onChange={onChange}
            />
            <FieldError id={'ANDROID_ID-error'} message={errors.ANDROID_ID} />
          </div>
        )}

        {/* --- ROW 3 --- */}
        {/* 11 (Row 3, Col 1). Is Active? */}
        <div className={'flex flex-col justify-end pb-2'}>
          <label className={'erp-switch-field cursor-pointer items-center'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'IS_ACTIVE'}
              checked={values.IS_ACTIVE === '1'}
              onChange={onChange}
            />
            <span className={'text-sm font-semibold text-gray-700'}>Is Active?</span>
          </label>
        </div>
      </div>
      </fieldset>
    </div>
  )
}

export default UserCreationFromEmployeeForm
