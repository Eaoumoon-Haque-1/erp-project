/** @file Controlled signature form for Asset Repair Information. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ name, message }) {
  return message ? <p id={`${name}-error`} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function SelectField({ name, label, values, errors, options, placeholder, onChange }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}<span className={'erp-required'} aria-hidden={'true'}>*</span></label><select id={name} name={name} className={fieldClass(errors[name])} value={values[name]} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange}><option value={''}>{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><FieldError name={name} message={errors[name]} /></div>
}

function DateField({ name, label, values, errors, onChange, required = false, min }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}</label><DateInput id={name} name={name} className={fieldClass(errors[name])} value={values[name]} min={min} required={required} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange} /><FieldError name={name} message={errors[name]} /></div>
}

function AssetRepairForm({ values, errors, references, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <SelectField name={'ASSET_RECORD_ID'} label={'Asset Item Name & ID'} values={values} errors={errors} options={references.eligibleAssets} placeholder={'--Select Eligible Asset--'} onChange={onChange} />
      <DateField name={'RECEIVE_DATE'} label={'Receive Date'} values={values} errors={errors} onChange={onChange} required />
      <SelectField name={'RECEIVE_ID'} label={'Receive By'} values={values} errors={errors} options={references.vendors.map((record) => ({ value: record.ID, label: `${record.VENDOR_CODE} - ${record.VENDOR_NAME}` }))} placeholder={'--Select Vendor / Service Provider--'} onChange={onChange} />

      <div>
        <label className={'erp-field-label'} htmlFor={'PROB_SPEC'}>Problem Specification<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
        <AutoGrowTextarea id={'PROB_SPEC'} name={'PROB_SPEC'} className={fieldClass(errors.PROB_SPEC)} value={values.PROB_SPEC} maxLength={1000} required placeholder={'Describe the reported problem or defect'} aria-invalid={Boolean(errors.PROB_SPEC)} aria-describedby={errors.PROB_SPEC ? 'PROB_SPEC-error' : undefined} onChange={onChange} />
        <FieldError name={'PROB_SPEC'} message={errors.PROB_SPEC} />
      </div>

      <SelectField name={'SUPPORT_ENGINEER'} label={'Support Engineer'} values={values} errors={errors} options={references.engineers.map((record) => ({ value: record.value, label: `${record.employeeId} - ${record.name}` }))} placeholder={'--Select Support Engineer--'} onChange={onChange} />
      <DateField name={'START_DATE'} label={'Start Date'} values={values} errors={errors} onChange={onChange} min={values.RECEIVE_DATE} />
      <DateField name={'FINISH_DATE'} label={'Finish Date'} values={values} errors={errors} onChange={onChange} min={values.START_DATE || values.RECEIVE_DATE} />
      <DateField name={'DELIVERY_DATE'} label={'Delivery Date'} values={values} errors={errors} onChange={onChange} min={values.FINISH_DATE || values.RECEIVE_DATE} />

      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARK'}>Remarks</label>
        <AutoGrowTextarea id={'REMARK'} name={'REMARK'} className={`${fieldClass(errors.REMARK)} erp-asset-remarks-textarea`} value={values.REMARK} rows={4} autoGrow={false} maxLength={500} placeholder={'Enter repair result, replaced parts, cost, or reference'} aria-invalid={Boolean(errors.REMARK)} aria-describedby={errors.REMARK ? 'REMARK-error' : undefined} onChange={onChange} />
        <FieldError name={'REMARK'} message={errors.REMARK} />
      </div>
    </div>
  )
}

export default AssetRepairForm
