/** @file Controlled signature form for assigning an Asset Item to an Employee. */
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

function AssetAssignEmployeeForm({ values, errors, references, onChange, disabled = false }) {
  const remarksRequired = values.CONDITION_ON_ISSUE === 'DAMAGED'

  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_DATE'}>
          Assign Date<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <DateInput
          id={'ASSET_DATE'}
          name={'ASSET_DATE'}
          className={fieldClass(errors.ASSET_DATE)}
          value={values.ASSET_DATE}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.ASSET_DATE)}
          aria-describedby={errors.ASSET_DATE ? 'ASSET_DATE-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ASSET_DATE-error'} message={errors.ASSET_DATE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ITEM_ID'}>
          Asset Item<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'ITEM_ID'}
          name={'ITEM_ID'}
          className={fieldClass(errors.ITEM_ID)}
          value={values.ITEM_ID}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.ITEM_ID)}
          aria-describedby={errors.ITEM_ID ? 'ITEM_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Asset Item--</option>
          {(references.assetItems || []).map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <FieldError id={'ITEM_ID-error'} message={errors.ITEM_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'HR_EMPL_ID'}>
          Assign To Employee<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'HR_EMPL_ID'}
          name={'HR_EMPL_ID'}
          className={fieldClass(errors.HR_EMPL_ID)}
          value={values.HR_EMPL_ID}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.HR_EMPL_ID)}
          aria-describedby={errors.HR_EMPL_ID ? 'HR_EMPL_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Employee--</option>
          {(references.employees || []).map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.label}</option>
          ))}
        </select>
        <FieldError id={'HR_EMPL_ID-error'} message={errors.HR_EMPL_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'CONDITION_ON_ISSUE'}>
          Condition on Issue<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'CONDITION_ON_ISSUE'}
          name={'CONDITION_ON_ISSUE'}
          className={fieldClass(errors.CONDITION_ON_ISSUE)}
          value={values.CONDITION_ON_ISSUE}
          required
          disabled={disabled}
          aria-invalid={Boolean(errors.CONDITION_ON_ISSUE)}
          aria-describedby={errors.CONDITION_ON_ISSUE ? 'CONDITION_ON_ISSUE-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Condition--</option>
          {(references.conditions || []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'CONDITION_ON_ISSUE-error'} message={errors.CONDITION_ON_ISSUE} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EXPECTED_RETURN_DATE'}>
          Expected Return Date
        </label>
        <DateInput
          id={'EXPECTED_RETURN_DATE'}
          name={'EXPECTED_RETURN_DATE'}
          className={fieldClass(errors.EXPECTED_RETURN_DATE)}
          value={values.EXPECTED_RETURN_DATE}
          disabled={disabled}
          aria-invalid={Boolean(errors.EXPECTED_RETURN_DATE)}
          aria-describedby={errors.EXPECTED_RETURN_DATE ? 'EXPECTED_RETURN_DATE-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'EXPECTED_RETURN_DATE-error'} message={errors.EXPECTED_RETURN_DATE} />
      </div>

      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARKS'}>
          Remarks{remarksRequired && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <AutoGrowTextarea
          id={'REMARKS'}
          name={'REMARKS'}
          className={`${fieldClass(errors.REMARKS)} erp-asset-remarks-textarea`}
          value={values.REMARKS}
          rows={3}
          autoGrow={false}
          maxLength={500}
          placeholder={'Enter remarks'}
          required={remarksRequired}
          disabled={disabled}
          aria-invalid={Boolean(errors.REMARKS)}
          aria-describedby={errors.REMARKS ? 'REMARKS-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'REMARKS-error'} message={errors.REMARKS} />
      </div>
    </div>
  )
}

export default AssetAssignEmployeeForm
