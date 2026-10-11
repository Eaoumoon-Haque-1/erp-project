/**
 * @file Controlled form presentation for User Type.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function UserTypeForm({
  values,
  errors,
  groupOptions = [],
  groupsLoading = false,
  typeNameRef,
  onChange,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'BG_ID'}>
          Group Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'BG_ID'}
          name={'BG_ID'}
          className={fieldClass(errors.BG_ID)}
          value={values.BG_ID}
          required
          disabled={groupsLoading}
          aria-invalid={Boolean(errors.BG_ID)}
          aria-describedby={errors.BG_ID ? 'BG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>
            {groupsLoading ? 'Loading Group Names...' : '--Select Group Name--'}
          </option>
          {groupOptions.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <FieldError id={'BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'TYPE_NAME'}>
          Type Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input ref={typeNameRef} id={'TYPE_NAME'} name={'TYPE_NAME'} type={'text'} className={fieldClass(errors.TYPE_NAME)} value={values.TYPE_NAME} maxLength={50} placeholder={'Enter type name'} required aria-invalid={Boolean(errors.TYPE_NAME)} aria-describedby={errors.TYPE_NAME ? 'TYPE_NAME-error' : undefined} onChange={onChange} />
        <FieldError id={'TYPE_NAME-error'} message={errors.TYPE_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SHORT_NAME'}>Short Name</label>
        <input id={'SHORT_NAME'} name={'SHORT_NAME'} type={'text'} className={fieldClass(errors.SHORT_NAME)} value={values.SHORT_NAME} maxLength={5} placeholder={'Enter short name'} aria-invalid={Boolean(errors.SHORT_NAME)} aria-describedby={errors.SHORT_NAME ? 'SHORT_NAME-error' : undefined} onChange={onChange} />
        <FieldError id={'SHORT_NAME-error'} message={errors.SHORT_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input id={'SORT_ORDER'} name={'SORT_ORDER'} type={'number'} className={fieldClass(errors.SORT_ORDER)} value={values.SORT_ORDER} min={'1'} step={'1'} placeholder={'Enter sort order'} aria-invalid={Boolean(errors.SORT_ORDER)} aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined} onChange={onChange} />
        <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} />
          <span>Is Active</span>
        </label>
      </div>
    </div>
  )
}

export default UserTypeForm
