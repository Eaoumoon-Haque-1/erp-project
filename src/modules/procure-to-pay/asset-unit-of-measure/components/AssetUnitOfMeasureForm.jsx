/** @file Controlled Unit of Measure (UOM) master form. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function AssetUnitOfMeasureForm({ values, errors, unitNameRef, onChange }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'UNIT_NAME'}>Unit Name<span className={'erp-required'} aria-hidden={'true'}>*</span></label>
        <input ref={unitNameRef} id={'UNIT_NAME'} name={'UNIT_NAME'} type={'text'} className={fieldClass(errors.UNIT_NAME)} value={values.UNIT_NAME} minLength={2} maxLength={50} placeholder={'Enter unit name'} required aria-invalid={Boolean(errors.UNIT_NAME)} aria-describedby={errors.UNIT_NAME ? 'UNIT_NAME-error' : undefined} onChange={onChange} />
        <FieldError id={'UNIT_NAME-error'} message={errors.UNIT_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input id={'SORT_ORDER'} name={'SORT_ORDER'} type={'number'} className={fieldClass(errors.SORT_ORDER)} value={values.SORT_ORDER} min={'1'} step={'1'} placeholder={'Enter sort order'} aria-invalid={Boolean(errors.SORT_ORDER)} aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined} onChange={onChange} />
        <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}><input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} /><span>Is Active</span></label>
      </div>
    </div>
  )
}

export default AssetUnitOfMeasureForm
