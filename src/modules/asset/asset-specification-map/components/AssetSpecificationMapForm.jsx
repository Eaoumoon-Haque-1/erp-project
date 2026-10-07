/** @file Controlled four-column presentation for Asset Specification Mapping. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function AssetSpecificationMapForm({
  values,
  errors,
  references,
  assetItemRef,
  onChange,
}) {
  const { assetItems, specificationOptions } = references

  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'ITEM_NAME'}>
          Asset Item Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          ref={assetItemRef}
          id={'ITEM_NAME'}
          name={'ITEM_NAME'}
          className={fieldClass(errors.ITEM_NAME)}
          value={values.ITEM_NAME}
          required
          aria-invalid={Boolean(errors.ITEM_NAME)}
          aria-describedby={errors.ITEM_NAME ? 'ITEM_NAME-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Asset Item--</option>
          {assetItems.map((record) => (
            <option key={record.ID} value={record.ID}>{record.ITEM_NAME}</option>
          ))}
        </select>
        <FieldError id={'ITEM_NAME-error'} message={errors.ITEM_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SPECIFICATION'}>
          Specification<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'SPECIFICATION'}
          name={'SPECIFICATION'}
          className={fieldClass(errors.SPECIFICATION)}
          value={values.SPECIFICATION}
          required
          aria-invalid={Boolean(errors.SPECIFICATION)}
          aria-describedby={errors.SPECIFICATION ? 'SPECIFICATION-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Specification--</option>
          {specificationOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'SPECIFICATION-error'} message={errors.SPECIFICATION} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input
          id={'SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          value={values.SORT_ORDER}
          min={'1'}
          step={'1'}
          placeholder={'Enter sort order'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input
            className={'erp-switch-control'}
            type={'checkbox'}
            role={'switch'}
            name={'STATUS'}
            checked={values.STATUS === '1'}
            onChange={onChange}
          />
          <span>Is Active</span>
        </label>
      </div>
    </div>
  )
}

export default AssetSpecificationMapForm
