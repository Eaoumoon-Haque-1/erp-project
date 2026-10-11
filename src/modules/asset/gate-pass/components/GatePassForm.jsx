/** @file Signature Gate Pass form with header data and repeatable Asset Item details. */
import AutoGrowTextarea from '../../../../components/shared/AutoGrowTextarea'
import DateInput from '../../../../components/shared/DateInput'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function DeleteIcon() {
  return <svg viewBox={'0 0 24 24'} className={'size-4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}><path d={'M4 7h16'} /><path d={'M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5'} /></svg>
}

function SelectField({ name, label, value, error, options, placeholder, onChange, inputRef }) {
  return <div><label className={'erp-field-label'} htmlFor={name}>{label}<span className={'erp-required'} aria-hidden={'true'}>*</span></label><select ref={inputRef} id={name} name={name} className={fieldClass(error)} value={value} required aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} onChange={onChange}><option value={''}>{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><FieldError id={`${name}-error`} message={error} /></div>
}

function GatePassForm({ values, entryValues, rows, errors, references, gatePassNoRef, itemRef, onChange, onEntryChange, onAdd, onRemove }) {
  return (
    <div className={'erp-gate-pass-form'}>
      <div className={'erp-form-grid'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'GATE_PASS_DATE'}>Gate Pass Date<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <DateInput id={'GATE_PASS_DATE'} name={'GATE_PASS_DATE'} className={fieldClass(errors.GATE_PASS_DATE)} value={values.GATE_PASS_DATE} required aria-invalid={Boolean(errors.GATE_PASS_DATE)} aria-describedby={errors.GATE_PASS_DATE ? 'GATE_PASS_DATE-error' : undefined} onChange={onChange} />
          <FieldError id={'GATE_PASS_DATE-error'} message={errors.GATE_PASS_DATE} />
        </div>
        <div>
          <label className={'erp-field-label'} htmlFor={'GATE_PASS_NO'}>Gate Pass No<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <input ref={gatePassNoRef} id={'GATE_PASS_NO'} name={'GATE_PASS_NO'} className={fieldClass(errors.GATE_PASS_NO, true)} value={values.GATE_PASS_NO} readOnly required aria-invalid={Boolean(errors.GATE_PASS_NO)} aria-describedby={errors.GATE_PASS_NO ? 'GATE_PASS_NO-error' : undefined} />
          <FieldError id={'GATE_PASS_NO-error'} message={errors.GATE_PASS_NO} />
        </div>
        <SelectField name={'SUPPLIER_ID'} label={'Supplier'} value={values.SUPPLIER_ID} error={errors.SUPPLIER_ID} options={references.vendors.map((record) => ({ value: record.ID, label: `${record.VENDOR_CODE} - ${record.VENDOR_NAME}` }))} placeholder={'--Select Supplier--'} onChange={onChange} />
        <SelectField name={'CUSTODIAN'} label={'Custodian'} value={values.CUSTODIAN} error={errors.CUSTODIAN} options={references.custodians.map((record) => ({ value: record.ID, label: record.CUSTODIAN_NAME }))} placeholder={'--Select Custodian--'} onChange={onChange} />
      </div>

      <div className={'erp-role-divider'} />
      <h2 className={'erp-employee-section-title'}>Item Details</h2>
      <div className={'erp-gate-pass-entry-grid'}>
        <SelectField name={'ITEM_NAME'} label={'Asset Item Name and ID'} value={entryValues.ITEM_NAME} error={errors.ITEM_NAME} options={references.assetItems.map((record) => ({ value: record.ID, label: `${record.ID} - ${record.ITEM_NAME}` }))} placeholder={'--Select Asset Item--'} onChange={onEntryChange} inputRef={itemRef} />
        <div>
          <label className={'erp-field-label'} htmlFor={'QUANTITY'}>Quantity<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
          <input id={'QUANTITY'} name={'QUANTITY'} type={'number'} className={fieldClass(errors.QUANTITY)} value={entryValues.QUANTITY} min={'1'} step={'1'} required aria-invalid={Boolean(errors.QUANTITY)} aria-describedby={errors.QUANTITY ? 'QUANTITY-error' : undefined} onChange={onEntryChange} />
          <FieldError id={'QUANTITY-error'} message={errors.QUANTITY} />
        </div>
        <button type={'button'} className={'erp-role-add-button'} aria-label={'Add Asset Item'} title={'Add'} onClick={onAdd}><span aria-hidden={'true'}>+</span></button>
      </div>

      <div className={'erp-table-wrap erp-gate-pass-table-wrap'}>
        <table className={'erp-table erp-gate-pass-table'} data-table={'ASSET_GATE_PASS_DTLS'}>
          <thead><tr><th className={'erp-number-column'}>#</th><th>Asset Item Name and ID</th><th className={'erp-quantity-column'}>Quantity</th><th className={'erp-action-column'}>Action</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td className={'erp-empty-cell'} colSpan={4}>No Asset Item has been added.</td></tr> : rows.map((row, index) => <tr key={row.ID}><td className={'erp-number-column'}>{index + 1}</td><td>{row.ITEM_NAME} - {row.ITEM_NAME_LABEL}</td><td className={'erp-quantity-column'}>{row.QUANTITY}</td><td className={'erp-action-column'}><button type={'button'} className={'erp-role-delete-button'} aria-label={`Remove ${row.ITEM_NAME_LABEL}`} title={'Remove'} onClick={() => onRemove(row.ID)}><DeleteIcon /></button></td></tr>)}
          </tbody>
        </table>
      </div>
      <FieldError id={'ITEMS-error'} message={errors.ITEMS} />

      <div className={'erp-role-divider'} />
      <div className={'erp-asset-remarks-field'}>
        <label className={'erp-field-label'} htmlFor={'REMARK'}>Remarks</label>
        <AutoGrowTextarea id={'REMARK'} name={'REMARK'} className={`${fieldClass(errors.REMARK)} erp-asset-remarks-textarea`} value={values.REMARK} rows={4} autoGrow={false} maxLength={500} placeholder={'Enter additional Gate Pass information'} aria-invalid={Boolean(errors.REMARK)} aria-describedby={errors.REMARK ? 'REMARK-error' : undefined} onChange={onChange} />
        <FieldError id={'REMARK-error'} message={errors.REMARK} />
      </div>
    </div>
  )
}

export default GatePassForm
