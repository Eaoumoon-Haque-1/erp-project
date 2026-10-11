/** @file Controlled signature form for assigning an available Asset to an Employee. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function AssetAssignEmployeeForm({ values, errors, references, onChange }) {
  const remarksRequired = values.CONDITION_ON_ISSUE === 'DAMAGED'

  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_DATE'}>
          Assign Date<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        
        <DateInput id={'ASSET_DATE'} name={'ASSET_DATE'} className={fieldClass(errors.ASSET_DATE)} value={values.ASSET_DATE} required aria-invalid={Boolean(errors.ASSET_DATE)} aria-describedby={errors.ASSET_DATE ? 'ASSET_DATE-error' : undefined} onChange={onChange} />
        <FieldError id={'ASSET_DATE-error'} message={errors.ASSET_DATE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_RECORD_ID'}>
          Asset Item Name & ID<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'ASSET_RECORD_ID'} name={'ASSET_RECORD_ID'} className={fieldClass(errors.ASSET_RECORD_ID)} value={values.ASSET_RECORD_ID} required aria-invalid={Boolean(errors.ASSET_RECORD_ID)} aria-describedby={errors.ASSET_RECORD_ID ? 'ASSET_RECORD_ID-error' : undefined} onChange={onChange}>
          <option value={''}>--Select Available Asset--</option>
          {references.availableAssets.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'ASSET_RECORD_ID-error'} message={errors.ASSET_RECORD_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'HR_EMPL_ID'}>
          Assign To<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'HR_EMPL_ID'} name={'HR_EMPL_ID'} className={fieldClass(errors.HR_EMPL_ID)} value={values.HR_EMPL_ID} required aria-invalid={Boolean(errors.HR_EMPL_ID)} aria-describedby={errors.HR_EMPL_ID ? 'HR_EMPL_ID-error' : undefined} onChange={onChange}>
          <option value={''}>--Select Employee--</option>
          {references.employees.map((record) => <option key={record.value} value={record.value}>{record.employeeId} - {record.name}</option>)}
        </select>
        <FieldError id={'HR_EMPL_ID-error'} message={errors.HR_EMPL_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'CONDITION_ON_ISSUE'}>
          Condition on Issue<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'CONDITION_ON_ISSUE'} name={'CONDITION_ON_ISSUE'} className={fieldClass(errors.CONDITION_ON_ISSUE)} value={values.CONDITION_ON_ISSUE} required aria-invalid={Boolean(errors.CONDITION_ON_ISSUE)} aria-describedby={errors.CONDITION_ON_ISSUE ? 'CONDITION_ON_ISSUE-error' : undefined} onChange={onChange}>
          <option value={''}>--Select Condition--</option>
          {references.conditions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'CONDITION_ON_ISSUE-error'} message={errors.CONDITION_ON_ISSUE} />
      </div>

      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARKS'}>
          Remarks{remarksRequired && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <AutoGrowTextarea id={'REMARKS'} name={'REMARKS'} className={`${fieldClass(errors.REMARKS)} erp-asset-remarks-textarea`} value={values.REMARKS} rows={4} autoGrow={false} maxLength={500} placeholder={'Enter remarks'} required={remarksRequired} aria-invalid={Boolean(errors.REMARKS)} aria-describedby={errors.REMARKS ? 'REMARKS-error' : undefined} onChange={onChange} />
        <FieldError id={'REMARKS-error'} message={errors.REMARKS} />
      </div>
    </div>
  )
}

export default AssetAssignEmployeeForm
