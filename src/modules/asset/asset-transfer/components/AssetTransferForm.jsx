/** @file Sectioned before/after form for transferring a currently assigned Asset. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'
import { getTransferLocations, getTransferSubCustodians } from '../data/assetTransferOptions'

function FieldError({ name, message }) {
  return message ? <p id={`${name}-error`} className={'erp-field-error'}>{message}</p> : null
}

function controlClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function Section({ title, children }) {
  return (
    <section className={'erp-asset-receive-section'}>
      <h2 className={'erp-employee-section-title'}>{title}</h2>
      <div className={'erp-form-grid'}>{children}</div>
    </section>
  )
}

function ReadOnlyField({ name, label, values, errors, required = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>{label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}</label>
      <input id={name} name={name} className={controlClass(errors[name], true)} value={values[name]} readOnly aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function ReadOnlyRemarks({ name, label, values, errors }) {
  return (
    <div className={'erp-asset-remarks-field'}>
      <label className={'erp-field-label'} htmlFor={name}>{label}</label>
      <textarea id={name} name={name} className={`${controlClass(errors[name], true)} erp-asset-remarks-textarea`} value={values[name]} rows={4} readOnly aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function ReadOnlyDateField({ name, label, values, errors }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>{label}<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
      <DateInput id={name} name={name} className={controlClass(errors[name], true)} value={values[name]} readOnly required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function SelectField({ name, label, values, errors, options, placeholder, onChange, disabled = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>{label}<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
      <select id={name} name={name} className={controlClass(errors[name], disabled)} value={values[name]} required disabled={disabled} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange}>
        <option value={''}>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldError name={name} message={errors[name]} />
    </div>
  )
}

function AssetTransferForm({ values, errors, references, onChange }) {
  const subCustodians = getTransferSubCustodians(values.TO_CUSTODIAN_ID, references)
    .map((record) => ({ value: record.ID, label: record.SUB_CUSTODIAN_NAME }))
  const locations = getTransferLocations(values.TO_CUSTODIAN_ID, values.TO_SUB_CUSTODIAN_ID, references)
    .map((record) => ({ value: record.ID, label: record.LOCATION_NAME }))
  const conditionLabel = references.conditions.find((option) => option.value === values.FROM_CONDITION_ON_ISSUE)?.label || values.FROM_CONDITION_ON_ISSUE
  const remarksRequired = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(values.TO_CONDITION_ON_ISSUE)

  return (
    <>
      <Section title={'Asset Information'}>
        <SelectField name={'ASSET_ASSIGNMENT_ID'} label={'Asset Item Name & ID'} values={values} errors={errors} options={references.transferableAssets} placeholder={'--Select Assigned Asset--'} onChange={onChange} />
      </Section>

      <Section title={'Before Asset Transfer'}>
        <ReadOnlyField name={'FROM_CUSTODIAN_NAME'} label={'From Custodian Name'} values={values} errors={{ FROM_CUSTODIAN_NAME: errors.FROM_CUSTODIAN_ID }} required />
        <ReadOnlyField name={'FROM_SUB_CUSTODIAN_NAME'} label={'From Sub Custodian Name'} values={values} errors={{ FROM_SUB_CUSTODIAN_NAME: errors.FROM_SUB_CUSTODIAN_ID }} required />
        <ReadOnlyField name={'FROM_DEPARTMENT_NAME'} label={'From Department'} values={values} errors={{ FROM_DEPARTMENT_NAME: errors.FROM_DEPARTMENT_ID }} required />
        <ReadOnlyField name={'FROM_LOCATION_NAME'} label={'From Location'} values={values} errors={{ FROM_LOCATION_NAME: errors.FROM_LOCATION }} required />
        <ReadOnlyField name={'FROM_BUILDING'} label={'From Building'} values={values} errors={errors} />
        <ReadOnlyField name={'FROM_FLOOR'} label={'From Floor'} values={values} errors={errors} />
        <ReadOnlyField name={'FROM_ROOM'} label={'From Room'} values={values} errors={errors} />
        <ReadOnlyDateField name={'FROM_ASSIGN_DATE'} label={'From Assign Date'} values={values} errors={errors} />
        <ReadOnlyField name={'FROM_CONDITION_DISPLAY'} label={'From Condition on Issue'} values={{ ...values, FROM_CONDITION_DISPLAY: conditionLabel }} errors={{ FROM_CONDITION_DISPLAY: errors.FROM_CONDITION_ON_ISSUE }} required />
        <ReadOnlyRemarks name={'FROM_REMARKS'} label={'From Remarks'} values={values} errors={errors} />
      </Section>

      <Section title={'After Asset Transfer'}>
        <SelectField name={'TO_CUSTODIAN_ID'} label={'To Custodian Name'} values={values} errors={errors} options={references.custodians.map((record) => ({ value: record.ID, label: record.CUSTODIAN_NAME }))} placeholder={'--Select Custodian--'} onChange={onChange} />
        <SelectField name={'TO_SUB_CUSTODIAN_ID'} label={'To Sub Custodian Name'} values={values} errors={errors} options={subCustodians} placeholder={'--Select Sub Custodian--'} onChange={onChange} disabled={!values.TO_CUSTODIAN_ID} />
        <SelectField name={'TO_DEPARTMENT_ID'} label={'To Department'} values={values} errors={errors} options={references.departments} placeholder={'--Select Department--'} onChange={onChange} />
        <SelectField name={'TO_LOCATION'} label={'To Location'} values={values} errors={errors} options={locations} placeholder={'--Select Location--'} onChange={onChange} disabled={!values.TO_SUB_CUSTODIAN_ID} />
        <ReadOnlyField name={'TO_BUILDING'} label={'To Building'} values={values} errors={errors} />
        <ReadOnlyField name={'TO_FLOOR'} label={'To Floor'} values={values} errors={errors} />
        <ReadOnlyField name={'TO_ROOM'} label={'To Room'} values={values} errors={errors} />
        <div>
          <label className={'erp-field-label'} htmlFor={'TO_ASSIGN_DATE'}>To Assign Date<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <DateInput id={'TO_ASSIGN_DATE'} name={'TO_ASSIGN_DATE'} className={controlClass(errors.TO_ASSIGN_DATE)} value={values.TO_ASSIGN_DATE} min={values.FROM_ASSIGN_DATE} required aria-invalid={Boolean(errors.TO_ASSIGN_DATE)} aria-describedby={errors.TO_ASSIGN_DATE ? 'TO_ASSIGN_DATE-error' : undefined} onChange={onChange} />
          <FieldError name={'TO_ASSIGN_DATE'} message={errors.TO_ASSIGN_DATE} />
        </div>
        <SelectField name={'TO_CONDITION_ON_ISSUE'} label={'To Condition on Issue'} values={values} errors={errors} options={references.conditions} placeholder={'--Select Condition--'} onChange={onChange} />
        <div className={'erp-asset-remarks-field'}>
          <label className={'erp-field-label'} htmlFor={'TO_REMARKS'}>To Remarks{remarksRequired && <span className={'erp-required'} aria-hidden={'true'}>*</span>}</label>
          <AutoGrowTextarea id={'TO_REMARKS'} name={'TO_REMARKS'} className={`${controlClass(errors.TO_REMARKS)} erp-asset-remarks-textarea`} value={values.TO_REMARKS} rows={4} autoGrow={false} maxLength={500} required={remarksRequired} placeholder={'Enter transfer remarks'} aria-invalid={Boolean(errors.TO_REMARKS)} aria-describedby={errors.TO_REMARKS ? 'TO_REMARKS-error' : undefined} onChange={onChange} />
          <FieldError name={'TO_REMARKS'} message={errors.TO_REMARKS} />
        </div>
      </Section>
    </>
  )
}

export default AssetTransferForm
