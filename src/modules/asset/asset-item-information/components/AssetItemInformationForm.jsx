/** @file Controlled four-column presentation for Asset Item Information. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function ReadonlyField({ name, label, value, error }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}<span className={'erp-required'} aria-hidden={'true'}>*</span>
      </label>
      <input
        id={name}
        name={name}
        type={'text'}
        className={fieldClass(error)}
        value={value}
        readOnly
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function AssetItemInformationForm({
  values,
  errors,
  references,
  itemNameRef,
  onChange,
}) {
  const { assetGroups, depreciationCategories, uomOptions } = references

  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'ITEM_NAME'}>
          Item Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={itemNameRef}
          id={'ITEM_NAME'}
          name={'ITEM_NAME'}
          type={'text'}
          className={fieldClass(errors.ITEM_NAME)}
          value={values.ITEM_NAME}
          maxLength={100}
          placeholder={'Enter item name'}
          required
          aria-invalid={Boolean(errors.ITEM_NAME)}
          aria-describedby={errors.ITEM_NAME ? 'ITEM_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ITEM_NAME-error'} message={errors.ITEM_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ITEM_GROUP'}>
          Item Group<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'ITEM_GROUP'}
          name={'ITEM_GROUP'}
          className={fieldClass(errors.ITEM_GROUP)}
          value={values.ITEM_GROUP}
          required
          aria-invalid={Boolean(errors.ITEM_GROUP)}
          aria-describedby={errors.ITEM_GROUP ? 'ITEM_GROUP-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Asset Group--</option>
          {assetGroups.map((record) => (
            <option key={record.ID} value={record.ID}>{record.ASSET_GROUP}</option>
          ))}
        </select>
        <FieldError id={'ITEM_GROUP-error'} message={errors.ITEM_GROUP} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'ASSET_DEPRI_CATE_ID'}>
          Depreciation Category<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'ASSET_DEPRI_CATE_ID'}
          name={'ASSET_DEPRI_CATE_ID'}
          className={fieldClass(errors.ASSET_DEPRI_CATE_ID)}
          value={values.ASSET_DEPRI_CATE_ID}
          required
          aria-invalid={Boolean(errors.ASSET_DEPRI_CATE_ID)}
          aria-describedby={errors.ASSET_DEPRI_CATE_ID ? 'ASSET_DEPRI_CATE_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Depreciation Category--</option>
          {depreciationCategories.map((record) => (
            <option key={record.ID} value={record.ID}>{record.DEPRI_CATEGORY}</option>
          ))}
        </select>
        <FieldError id={'ASSET_DEPRI_CATE_ID-error'} message={errors.ASSET_DEPRI_CATE_ID} />
      </div>

      <ReadonlyField
        name={'CATEGORY_TYPE'}
        label={'Category Type'}
        value={values.CATEGORY_TYPE}
        error={errors.CATEGORY_TYPE}
      />
      <ReadonlyField
        name={'DEPRI_METHOD'}
        label={'Depreciation Method'}
        value={values.DEPRI_METHOD}
        error={errors.DEPRI_METHOD}
      />
      <ReadonlyField
        name={'DEPRI_LIFE'}
        label={'Depreciation Life (Months)'}
        value={values.DEPRI_LIFE}
        error={errors.DEPRI_LIFE}
      />
      <ReadonlyField
        name={'DEPRI_PERCENTAGE'}
        label={'Depreciation (%)'}
        value={values.DEPRI_PERCENTAGE}
        error={errors.DEPRI_PERCENTAGE}
      />

      <div>
        <label className={'erp-field-label'} htmlFor={'UOM'}>
          UOM<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'UOM'}
          name={'UOM'}
          className={fieldClass(errors.UOM)}
          value={values.UOM}
          required
          aria-invalid={Boolean(errors.UOM)}
          aria-describedby={errors.UOM ? 'UOM-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select UOM--</option>
          {uomOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'UOM-error'} message={errors.UOM} />
      </div>

      <ReadonlyField
        name={'ASSET_OWNER'}
        label={'Asset Owner'}
        value={values.ASSET_OWNER}
        error={errors.ASSET_OWNER}
      />

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

export default AssetItemInformationForm
