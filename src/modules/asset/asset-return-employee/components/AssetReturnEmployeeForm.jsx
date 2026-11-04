/** @file Controlled signature form for returning an Asset from its current Employee. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'
import { formatIsoDate } from '../../../../utils/dateFormat'

function FieldError({ name, message }) {
  return message ? <p id={`${name}-error`} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function DateField({ name, label, values, errors, onChange, required = false, readOnly = false, min, max, disabled = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <DateInput
        id={name}
        name={name}
        className={fieldClass(errors[name], readOnly)}
        value={values[name] || ''}
        min={min}
        max={max}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function AssetReturnEmployeeForm({ values, errors, references, onChange, disabled = false }) {
  const remarksRequired = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(values.CONDITION_ON_RETURN)

  return (
    <div className={'erp-form-grid'}>
      <DateField
        name={'ASSET_DATE'}
        label={'Assign Date'}
        values={values}
        errors={errors}
        onChange={onChange}
        required
        readOnly
        disabled={disabled}
      />

      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_ASSIGNMENT_ID'}>
          Assigned Asset<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'ASSET_ASSIGNMENT_ID'}
          name={'ASSET_ASSIGNMENT_ID'}
          className={fieldClass(errors.ASSET_ASSIGNMENT_ID)}
          value={values.ASSET_ASSIGNMENT_ID || ''}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.ASSET_ASSIGNMENT_ID)}
          aria-describedby={errors.ASSET_ASSIGNMENT_ID ? 'ASSET_ASSIGNMENT_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Assigned Asset--</option>
          {(references.assignedAssets || []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError name={'ASSET_ASSIGNMENT_ID'} message={errors.ASSET_ASSIGNMENT_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYEE_DISPLAY'}>
          Assigned Employee<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'EMPLOYEE_DISPLAY'}
          type={'text'}
          className={fieldClass(errors.HR_EMPL_ID, true)}
          value={values.EMPLOYEE_NAME || ''}
          readOnly
          disabled={disabled}
          placeholder={'Auto-populated from assignment'}
          aria-invalid={Boolean(errors.HR_EMPL_ID)}
          aria-describedby={errors.HR_EMPL_ID ? 'HR_EMPL_ID-error' : undefined}
        />
        <FieldError name={'HR_EMPL_ID'} message={errors.HR_EMPL_ID} />
      </div>

      <DateField
        name={'ACTUAL_RETURN_DATE'}
        label={'Actual Return Date'}
        values={values}
        errors={errors}
        onChange={onChange}
        required
        disabled={disabled}
        min={values.ASSET_DATE}
        max={formatIsoDate(new Date())}
      />

      <div>
        <label className={'erp-field-label'} htmlFor={'CONDITION_ON_RETURN'}>
          Condition on Return<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'CONDITION_ON_RETURN'}
          name={'CONDITION_ON_RETURN'}
          className={fieldClass(errors.CONDITION_ON_RETURN)}
          value={values.CONDITION_ON_RETURN || ''}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.CONDITION_ON_RETURN)}
          aria-describedby={errors.CONDITION_ON_RETURN ? 'CONDITION_ON_RETURN-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Condition--</option>
          {(references.conditions || []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError name={'CONDITION_ON_RETURN'} message={errors.CONDITION_ON_RETURN} />
      </div>

      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARKS'}>
          Remarks{remarksRequired && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <AutoGrowTextarea
          id={'REMARKS'}
          name={'REMARKS'}
          className={`${fieldClass(errors.REMARKS)} erp-asset-remarks-textarea`}
          value={values.REMARKS || ''}
          rows={3}
          autoGrow={false}
          maxLength={500}
          required={remarksRequired}
          disabled={disabled}
          placeholder={'Enter return remarks'}
          aria-invalid={Boolean(errors.REMARKS)}
          aria-describedby={errors.REMARKS ? 'REMARKS-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'REMARKS'} message={errors.REMARKS} />
      </div>
    </div>
  )
}

export default AssetReturnEmployeeForm
