/** @file Controlled four-column Chart of Accounts form using the shared ERP field styles. */
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function Field({ name, label, values, errors, onChange, type = 'text', required = false, readOnly = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <input id={name} name={name} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined} className={fieldClass(errors[name])} value={values[name]} readOnly={readOnly} required={required} aria-invalid={Boolean(errors[name])} onChange={onChange} />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function ChartOfAccountsForm({ values, errors, parentOptions, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <Field name={'SL_NO'} label={'SL No.'} values={values} errors={errors} onChange={onChange} type={'number'} required />
      <Field name={'COMPANY_ID'} label={'Company ID'} values={values} errors={errors} onChange={onChange} type={'number'} required />
      <Field name={'ACCOUNT_CODE'} label={'Account Code'} values={values} errors={errors} onChange={onChange} required />
      <Field name={'ACCOUNT_HEAD'} label={'Account Head'} values={values} errors={errors} onChange={onChange} required />

      <div>
        <label className={'erp-field-label'} htmlFor={'LEDGER_HEAD_TYPE'}>Ledger Head Type<span className={'erp-required'}>*</span></label>
        <select id={'LEDGER_HEAD_TYPE'} name={'LEDGER_HEAD_TYPE'} className={fieldClass(errors.LEDGER_HEAD_TYPE)} value={values.LEDGER_HEAD_TYPE} onChange={onChange}>
          <option value={''}>--Select Ledger Head Type--</option>
          <option value={'GROUP'}>Group</option><option value={'LEDGER'}>Ledger</option>
        </select>
        <FieldError id={'LEDGER_HEAD_TYPE-error'} message={errors.LEDGER_HEAD_TYPE} />
      </div>
      <div>
        <label className={'erp-field-label'} htmlFor={'ACCOUNT_TYPE'}>Account Type<span className={'erp-required'}>*</span></label>
        <select id={'ACCOUNT_TYPE'} name={'ACCOUNT_TYPE'} className={fieldClass(errors.ACCOUNT_TYPE)} value={values.ACCOUNT_TYPE} onChange={onChange}>
          <option value={''}>--Select Account Type--</option>
          {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <FieldError id={'ACCOUNT_TYPE-error'} message={errors.ACCOUNT_TYPE} />
      </div>
      <div>
        <label className={'erp-field-label'} htmlFor={'PARENT_ACCOUNT_HEAD_ID'}>Parent Account Head</label>
        <select id={'PARENT_ACCOUNT_HEAD_ID'} name={'PARENT_ACCOUNT_HEAD_ID'} className={'erp-form-control'} value={values.PARENT_ACCOUNT_HEAD_ID} onChange={onChange}>
          <option value={''}>--No Parent--</option>
          {parentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      <Field name={'ACCOUNT_USAGE'} label={'Account Usage'} values={values} errors={errors} onChange={onChange} />

      <div>
        <label className={'erp-field-label'} htmlFor={'OPENING_DATE'}>Opening Date</label>
        <DateInput id={'OPENING_DATE'} name={'OPENING_DATE'} className={fieldClass(errors.OPENING_DATE)} value={values.OPENING_DATE} onChange={onChange} />
      </div>
      <Field name={'OPENING_BALANCE'} label={'Opening Balance'} values={values} errors={errors} onChange={onChange} type={'number'} />
      <Field name={'BALANCE_DR'} label={'Balance Dr'} values={values} errors={errors} onChange={onChange} type={'number'} />
      <Field name={'BALANCE_CR'} label={'Balance Cr'} values={values} errors={errors} onChange={onChange} type={'number'} />
      <Field name={'CURRENT_DR'} label={'Current Dr'} values={values} errors={errors} onChange={onChange} type={'number'} />
      <Field name={'CURRENT_CR'} label={'Current Cr'} values={values} errors={errors} onChange={onChange} type={'number'} />

      <label className={'erp-switch-field self-end'}><input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'IS_COST_CENTER_MANDATORY'} checked={values.IS_COST_CENTER_MANDATORY === '1'} onChange={onChange} /><span>Cost Center Mandatory</span></label>
      <label className={'erp-switch-field self-end'}><input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'IS_BUDGET_HEAD'} checked={values.IS_BUDGET_HEAD === '1'} onChange={onChange} /><span>Budget Head</span></label>
      <label className={'erp-switch-field self-end'}><input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} /><span>Is Active</span></label>
    </div>
  )
}

export default ChartOfAccountsForm
