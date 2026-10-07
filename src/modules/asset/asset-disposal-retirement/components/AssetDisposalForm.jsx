/** @file Sectioned Asset Information and Disposal Information form. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ name, message }) {
  return message ? <p id={`${name}-error`} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function Section({ title, children }) {
  return <section className={'erp-asset-receive-section'}><h2 className={'erp-employee-section-title'}>{title}</h2><div className={'erp-form-grid'}>{children}</div></section>
}

function ReadOnlyField({ name, label, values, errors }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}</label><input id={name} name={name} className={fieldClass(errors[name], true)} value={values[name]} readOnly aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} /><FieldError name={name} message={errors[name]} /></div>
}

function ReadOnlyDate({ name, label, values, errors }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}</label><DateInput id={name} name={name} className={fieldClass(errors[name], true)} value={values[name]} readOnly aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} /><FieldError name={name} message={errors[name]} /></div>
}

function SelectField({ name, label, values, errors, options, placeholder, onChange, required = true }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}</label><select id={name} name={name} className={fieldClass(errors[name])} value={values[name]} required={required} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange}><option value={''}>{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><FieldError name={name} message={errors[name]} /></div>
}

function AssetDisposalForm({ values, errors, references, onChange }) {
  const approverRequired = ['APPROVED', 'COMPLETED'].includes(values.DISPOSAL_STATUS)
  const typeLabel = references.disposalTypes.find((option) => option.value === values.DISPOSAL_TYPE)?.label.toLowerCase() || ''
  const reasonLabel = references.reasons.find((option) => option.value === values.REASON)?.label.toLowerCase() || ''
  const remarksRequired = ['lost', 'damaged', 'write-off', 'write off', 'beyond repair'].some((term) => typeLabel.includes(term) || reasonLabel.includes(term))

  return (
    <>
      <Section title={'Asset Information'}>
        <SelectField name={'ASSET_RECORD_ID'} label={'Asset Item Name & ID'} values={values} errors={errors} options={references.eligibleAssets} placeholder={'--Select Eligible Asset--'} onChange={onChange} />
        <ReadOnlyDate name={'PURCHASE_DATE'} label={'Purchase Date'} values={values} errors={errors} />
        <ReadOnlyField name={'PURCHASE_PRICE'} label={'Purchase Price'} values={values} errors={errors} />
        <ReadOnlyDate name={'GL_DATE'} label={'GL Date'} values={values} errors={errors} />
        <ReadOnlyDate name={'DEPRI_START_DATE'} label={'Depreciation Start Date'} values={values} errors={errors} />
        <ReadOnlyDate name={'DEPRI_END_DATE'} label={'Depreciation End Date'} values={values} errors={errors} />
        <ReadOnlyField name={'TOTAL_DEPRECIATION_VALUE'} label={'Total Depreciation Value'} values={values} errors={errors} />
        <ReadOnlyField name={'WRITTEN_DOWN_VALUE'} label={'Written Down Value'} values={values} errors={errors} />
      </Section>

      <Section title={'Asset Disposal Information'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'DISPOSAL_DATE'}>Disposal Date<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <DateInput id={'DISPOSAL_DATE'} name={'DISPOSAL_DATE'} className={fieldClass(errors.DISPOSAL_DATE)} value={values.DISPOSAL_DATE} min={values.DEPRI_START_DATE || values.GL_DATE || values.PURCHASE_DATE} required aria-invalid={Boolean(errors.DISPOSAL_DATE)} aria-describedby={errors.DISPOSAL_DATE ? 'DISPOSAL_DATE-error' : undefined} onChange={onChange} />
          <FieldError name={'DISPOSAL_DATE'} message={errors.DISPOSAL_DATE} />
        </div>
        <SelectField name={'DISPOSAL_TYPE'} label={'Disposal Type'} values={values} errors={errors} options={references.disposalTypes} placeholder={'--Select Disposal Type--'} onChange={onChange} />
        <div>
          <label className={'erp-field-label'} htmlFor={'DISPOSAL_VALUE'}>Disposal Value<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <input id={'DISPOSAL_VALUE'} name={'DISPOSAL_VALUE'} type={'number'} className={fieldClass(errors.DISPOSAL_VALUE)} value={values.DISPOSAL_VALUE} min={'0'} step={'0.01'} required aria-invalid={Boolean(errors.DISPOSAL_VALUE)} aria-describedby={errors.DISPOSAL_VALUE ? 'DISPOSAL_VALUE-error' : undefined} onChange={onChange} />
          <FieldError name={'DISPOSAL_VALUE'} message={errors.DISPOSAL_VALUE} />
        </div>
        <ReadOnlyField name={'GAIN_ON_DISPOSAL'} label={'Gain on Disposal'} values={values} errors={errors} />
        <ReadOnlyField name={'LOSS_ON_DISPOSAL'} label={'Loss on Disposal'} values={values} errors={errors} />
        <SelectField name={'APPROVED_BY'} label={'Approved By'} values={values} errors={errors} options={references.approvers.map((record) => ({ value: record.value, label: `${record.employeeId} - ${record.name}` }))} placeholder={'--Select Approver--'} onChange={onChange} required={approverRequired} />
        <SelectField name={'REASON'} label={'Reason'} values={values} errors={errors} options={references.reasons} placeholder={'--Select Reason--'} onChange={onChange} />
        <SelectField name={'DISPOSAL_STATUS'} label={'Disposal Status'} values={values} errors={errors} options={references.statuses} placeholder={'--Select Status--'} onChange={onChange} />
        <div className={'erp-asset-remarks-field'}>
          <label className={'erp-field-label'} htmlFor={'REMARK'}>Remarks{remarksRequired && <span className={'erp-required'} aria-hidden={'true'}>*</span>}</label>
          <AutoGrowTextarea id={'REMARK'} name={'REMARK'} className={`${fieldClass(errors.REMARK)} erp-asset-remarks-textarea`} value={values.REMARK} rows={4} autoGrow={false} maxLength={500} required={remarksRequired} placeholder={'Enter disposal details'} aria-invalid={Boolean(errors.REMARK)} aria-describedby={errors.REMARK ? 'REMARK-error' : undefined} onChange={onChange} />
          <FieldError name={'REMARK'} message={errors.REMARK} />
        </div>
      </Section>
    </>
  )
}

export default AssetDisposalForm
