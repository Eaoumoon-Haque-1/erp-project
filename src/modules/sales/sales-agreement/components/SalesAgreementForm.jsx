/**
 * @file Controlled form presentation for Sales Agreement.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'
import MultiSelectField from '../../../../components/shared/MultiSelectField'
import {
  billingAfterOptions,
  billingCycleOptions,
  moduleOptions,
  productOptions,
  subscriptionStatusOptions,
} from '../validation/salesAgreementValidation'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, extra = '') {
  return ['erp-form-control', extra, error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function Label({ htmlFor, required = false, children }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      {required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
    </label>
  )
}

function TextField({ name, label, values, errors, required = false, inputRef, ...props }) {
  return (
    <div>
      <Label htmlFor={name} required={required}>{label}</Label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        className={fieldClass(errors[name])}
        value={values[name]}
        required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...props}
      />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function SelectField({ name, label, values, errors, options, required = false, inputRef, onChange }) {
  return (
    <div>
      <Label htmlFor={name} required={required}>{label}</Label>
      <select
        ref={inputRef}
        id={name}
        name={name}
        className={fieldClass(errors[name])}
        value={values[name]}
        required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={''}>{`--Select ${label}--`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function DateField({ name, label, values, errors, required = false, min, onChange }) {
  return (
    <div>
      <Label htmlFor={name} required={required}>{label}</Label>
      <DateInput
        id={name}
        name={name}
        className={fieldClass(errors[name])}
        value={values[name]}
        min={min}
        required={required}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function TextAreaField({ name, label, values, errors, onChange }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <AutoGrowTextarea
        id={name}
        name={name}
        maxLength={500}
        className={fieldClass(errors[name], 'erp-textarea')}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={values[name]}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function SalesAgreementForm({ values, errors, businessUnits, salesPeople, businessUnitRef, onChange, onMultiSelectChange }) {
  const businessUnitOptions = businessUnits.map((unit) => ({ value: unit.ID, label: unit.BUSINESS_UNIT }))
  const salesPersonOptions = salesPeople.map((person) => ({ value: person.ID, label: person.EMPLOYEE_NAME }))

  return (
    <div className={'erp-form-grid'}>
      <SelectField name={'BU_ID'} label={'Business Unit'} values={values} errors={errors} options={businessUnitOptions} required inputRef={businessUnitRef} onChange={onChange} />
      <TextField name={'AGREEMENT_NO'} label={'Agreement No.'} values={values} errors={errors} type={'text'} maxLength={50} placeholder={'Enter agreement no.'} required onChange={onChange} />
      <DateField name={'AGREEMENT_DATE'} label={'Agreement Date'} values={values} errors={errors} required onChange={onChange} />
      <TextField name={'CUSTOMER'} label={'Customer Contact Person'} values={values} errors={errors} type={'text'} minLength={2} maxLength={20} placeholder={'Enter contact person'} required onChange={onChange} />
      <SelectField name={'SALES_PERSON_ID'} label={'Sales Person'} values={values} errors={errors} options={salesPersonOptions} required onChange={onChange} />

      <DateField name={'AGREEMENT_START_DATE'} label={'Agreement Start Date'} values={values} errors={errors} required onChange={onChange} />
      <DateField name={'AGREEMENT_END_DATE'} label={'Agreement End Date'} values={values} errors={errors} min={values.AGREEMENT_START_DATE || undefined} required onChange={onChange} />
      <TextField name={'NO_OF_USER'} label={'No. of Users'} values={values} errors={errors} type={'number'} min={'1'} step={'1'} placeholder={'Enter number of users'} required onChange={onChange} />
      <TextField name={'TRAIL_PERIOD'} label={'Trial Period (Number of Days)'} values={values} errors={errors} type={'number'} min={'1'} step={'1'} placeholder={'Enter trial days'} onChange={onChange} />
      <SelectField name={'BILLING_CYCLE'} label={'Billing Cycle'} values={values} errors={errors} options={billingCycleOptions} onChange={onChange} />

      <DateField name={'Bill_START_DATE'} label={'Bill Start Date'} values={values} errors={errors} required onChange={onChange} />
      <SelectField name={'BILL_AFTER_DAYS'} label={'Billing After (No. of Days)'} values={values} errors={errors} options={billingAfterOptions.map((value) => ({ value, label: value }))} required onChange={onChange} />
      <DateField name={'BILL_UNSUBSCRIPTION_DATE'} label={'Bill Unsubscription Date (If Not Paid)'} values={values} errors={errors} min={values.Bill_START_DATE || undefined} required onChange={onChange} />
      <SelectField name={'PRODUCT_TITLE'} label={'Product Title'} values={values} errors={errors} options={productOptions} required onChange={onChange} />
      <TextField name={'BILLING_AMOUNT'} label={'Billing Amount'} values={values} errors={errors} type={'number'} min={'0.01'} step={'0.01'} placeholder={'Enter billing amount'} required onChange={onChange} />

      <TextAreaField name={'BILLING_LETTER_HEAD'} label={'Billing Letter Head'} values={values} errors={errors} onChange={onChange} />
      <TextAreaField name={'BILLING_LETTER_BODY'} label={'Billing Letter Body'} values={values} errors={errors} onChange={onChange} />
      <TextAreaField name={'BILLING_LETTER_FOOTER'} label={'Billing Letter Footer'} values={values} errors={errors} onChange={onChange} />
      <DateField name={'AUTO_MAIL_DATE'} label={'Auto Mail Date'} values={values} errors={errors} onChange={onChange} />
      <MultiSelectField id={'MODULE_TAKEN'} name={'MODULE_TAKEN'} label={'Service/Module Taken'} placeholder={'--Select Service/Module--'} options={moduleOptions} value={values.MODULE_TAKEN} error={errors.MODULE_TAKEN} onChange={onMultiSelectChange} />

      <SelectField name={'SUBSCRIPTION_STATUS'} label={'Subscription Status'} values={values} errors={errors} options={subscriptionStatusOptions} required onChange={onChange} />
      <TextAreaField name={'REMARKS'} label={'Remarks'} values={values} errors={errors} onChange={onChange} />
    </div>
  )
}

export default SalesAgreementForm
