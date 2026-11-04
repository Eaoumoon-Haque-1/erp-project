/** @file Controlled signature form for Asset Maintenance / AMC. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'
import { maintenanceTypeRules } from '../data/maintenanceAmcOptions'

function FieldError({ name, message }) {
  return message ? <p id={`${name}-error`} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, disabled = false) {
  return ['erp-form-control', disabled ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function SelectField({ name, label, values, errors, options = [], placeholder, onChange, disabled = false, required = true }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        className={fieldClass(errors[name], disabled)}
        value={values[name] || ''}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={''}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value ?? option.id} value={option.value ?? option.id}>
            {option.label ?? option.name}
          </option>
        ))}
      </select>
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function MaintenanceAmcForm({ values, errors, references, onChange, disabled = false }) {
  const rules = maintenanceTypeRules(values.MAINTENANCE_TYPE, references)

  return (
    <div className={'erp-form-grid'}>
      <SelectField
        name={'ITEM_NAME'}
        label={'Asset Item'}
        values={values}
        errors={errors}
        options={(references.assetItems || []).map((r) => ({ value: r.id, label: r.label }))}
        placeholder={'--Select Asset Item--'}
        onChange={onChange}
        disabled={disabled}
      />

      <SelectField
        name={'MAINTENANCE_TYPE'}
        label={'Maintenance Type'}
        values={values}
        errors={errors}
        options={references.maintenanceTypes || []}
        placeholder={'--Select Maintenance Type--'}
        onChange={onChange}
        disabled={disabled}
      />

      <SelectField
        name={'MAINTENANCE_PRIORITY'}
        label={'Priority'}
        values={values}
        errors={errors}
        options={references.priorities || []}
        placeholder={'--Select Priority--'}
        onChange={onChange}
        disabled={disabled}
        required={false}
      />

      <SelectField
        name={'VENDOR_ID'}
        label={'Vendor'}
        values={values}
        errors={errors}
        options={(references.vendors || []).map((r) => ({ value: r.id, label: r.label }))}
        placeholder={'--Select Vendor--'}
        onChange={onChange}
        disabled={disabled}
      />

      <div>
        <label className={'erp-field-label'} htmlFor={'START_DATE'}>
          Start Date<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <DateInput
          id={'START_DATE'}
          name={'START_DATE'}
          className={fieldClass(errors.START_DATE, disabled)}
          value={values.START_DATE || ''}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.START_DATE)}
          aria-describedby={errors.START_DATE ? 'START_DATE-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'START_DATE'} message={errors.START_DATE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'END_DATE'}>
          End Date{rules.requiresEndDate && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <DateInput
          id={'END_DATE'}
          name={'END_DATE'}
          className={fieldClass(errors.END_DATE, disabled)}
          value={values.END_DATE || ''}
          min={values.START_DATE}
          required={rules.requiresEndDate}
          disabled={disabled}
          aria-invalid={Boolean(errors.END_DATE)}
          aria-describedby={errors.END_DATE ? 'END_DATE-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'END_DATE'} message={errors.END_DATE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'COST'}>
          Cost<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'COST'}
          name={'COST'}
          type={'number'}
          className={fieldClass(errors.COST, disabled)}
          value={values.COST || ''}
          min={'0'}
          step={'0.01'}
          required
          disabled={disabled}
          placeholder={'Enter cost'}
          aria-invalid={Boolean(errors.COST)}
          aria-describedby={errors.COST ? 'COST-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'COST'} message={errors.COST} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'NEXT_DUE_DATE'}>
          Next Due Date{rules.requiresNextDueDate && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <DateInput
          id={'NEXT_DUE_DATE'}
          name={'NEXT_DUE_DATE'}
          className={fieldClass(errors.NEXT_DUE_DATE, disabled)}
          value={values.NEXT_DUE_DATE || ''}
          min={values.START_DATE}
          required={rules.requiresNextDueDate}
          disabled={disabled}
          aria-invalid={Boolean(errors.NEXT_DUE_DATE)}
          aria-describedby={errors.NEXT_DUE_DATE ? 'NEXT_DUE_DATE-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'NEXT_DUE_DATE'} message={errors.NEXT_DUE_DATE} />
      </div>

      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARK'}>
          Remark
        </label>
        <AutoGrowTextarea
          id={'REMARK'}
          name={'REMARK'}
          className={`${fieldClass(errors.REMARK, disabled)} erp-asset-remarks-textarea`}
          value={values.REMARK || ''}
          rows={3}
          autoGrow={false}
          maxLength={500}
          disabled={disabled}
          placeholder={'Enter maintenance details'}
          aria-invalid={Boolean(errors.REMARK)}
          aria-describedby={errors.REMARK ? 'REMARK-error' : undefined}
          onChange={onChange}
        />
        <FieldError name={'REMARK'} message={errors.REMARK} />
      </div>
    </div>
  )
}

export default MaintenanceAmcForm
