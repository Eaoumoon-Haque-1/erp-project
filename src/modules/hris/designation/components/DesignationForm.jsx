/**
 * @file Controlled form presentation for Designation.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error, extra = '') {
  return [
    'erp-form-control',
    extra,
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

function DesignationForm({
  values,
  errors,
  groupOptions = [],
  groupsLoading = false,
  onChange,
  designationNameRef,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'BG_ID'}>
          Group Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'BG_ID'}
          name={'BG_ID'}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          disabled={groupsLoading}
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? 'DESIG_BG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>{groupsLoading ? 'Loading Group Names...' : '--Select Group Name--'}</option>
          {groupOptions.map((group) => (
            <option key={group.value} value={group.value}>{group.label}</option>
          ))}
        </select>
        <FieldError id={'DESIG_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'DESIGNATION_NAME'}>
          Designation Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={designationNameRef}
          id={'DESIGNATION_NAME'}
          name={'DESIGNATION_NAME'}
          type={'text'}
          className={fieldClass(errors.DESIGNATION_NAME)}
          placeholder={'Enter designation name'}
          value={values.DESIGNATION_NAME}
          maxLength={50}
          required
          aria-invalid={Boolean(errors.DESIGNATION_NAME)}
          aria-describedby={
            errors.DESIGNATION_NAME ? 'DESIGNATION_NAME-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={'DESIGNATION_NAME-error'}
          message={errors.DESIGNATION_NAME}
        />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'DESIG_SHORT_NAME'}>Short Name</label>
        <input
          id={'DESIG_SHORT_NAME'}
          name={'SHORT_NAME'}
          type={'text'}
          className={fieldClass(errors.SHORT_NAME)}
          placeholder={'Enter short name'}
          value={values.SHORT_NAME}
          maxLength={5}
          aria-invalid={Boolean(errors.SHORT_NAME)}
          aria-describedby={errors.SHORT_NAME ? 'DESIG_SHORT_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'DESIG_SHORT_NAME-error'} message={errors.SHORT_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'DESIG_SORT_ORDER'}>Sort Order</label>
        <input
          id={'DESIG_SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          placeholder={'Enter sort order'}
          value={values.SORT_ORDER}
          min={'0'}
          step={'any'}
          inputMode={'decimal'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'DESIG_SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'DESIG_SORT_ORDER-error'} message={errors.SORT_ORDER} />
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

export default DesignationForm
