/**
 * @file Controlled form presentation for Create Menu.
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

function CheckboxField({ name, label, value, className, onChange }) {
  return (
    <div className={className}>
      <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
      <label className={'erp-checkbox-field'}>
        <input type={'checkbox'} name={name} checked={value === '1'} onChange={onChange} />
        <span>{label}</span>
      </label>
    </div>
  )
}

function CreateMenuForm({
  values,
  errors,
  menuNameRef,
  moduleOptions = [],
  parentMenuOptions = [],
  permissionOptions = [],
  onChange,
}) {
  const isTopMenu = values.IS_TOP_MENU === '1'

  return (
    <div className={'erp-form-grid erp-menu-form-grid'}>
      <div className={'erp-menu-name-field'}>
        <label className={'erp-field-label'} htmlFor={'MENU_NAME'}>
          Menu Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={menuNameRef}
          id={'MENU_NAME'}
          name={'MENU_NAME'}
          type={'text'}
          className={fieldClass(errors.MENU_NAME)}
          value={values.MENU_NAME}
          maxLength={100}
          placeholder={'Enter menu name'}
          required
          aria-invalid={Boolean(errors.MENU_NAME)}
          aria-describedby={errors.MENU_NAME ? 'MENU_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'MENU_NAME-error'} message={errors.MENU_NAME} />
      </div>

      <CheckboxField className={'erp-menu-parent-check'} name={'IS_PARENT'} label={'Is Parent?'} value={values.IS_PARENT} onChange={onChange} />

      <div className={'erp-menu-parent-field'}>
        <label className={'erp-field-label'} htmlFor={'PARENT_MENU_ID'}>
          Parent Menu
          {!isTopMenu && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
        </label>
        <select
          id={'PARENT_MENU_ID'}
          name={'PARENT_MENU_ID'}
          className={fieldClass(errors.PARENT_MENU_ID)}
          value={values.PARENT_MENU_ID}
          required={!isTopMenu}
          disabled={isTopMenu}
          aria-invalid={Boolean(errors.PARENT_MENU_ID)}
          aria-describedby={errors.PARENT_MENU_ID ? 'PARENT_MENU_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Parent Menu--</option>
          {parentMenuOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'PARENT_MENU_ID-error'} message={errors.PARENT_MENU_ID} />
      </div>

      <CheckboxField className={'erp-menu-top-check'} name={'IS_TOP_MENU'} label={'Top Menu?'} value={values.IS_TOP_MENU} onChange={onChange} />

      <div className={'erp-menu-module-field'}>
        <label className={'erp-field-label'} htmlFor={'MODULE_ID'}>
          Module Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'MODULE_ID'}
          name={'MODULE_ID'}
          className={fieldClass(errors.MODULE_ID)}
          value={values.MODULE_ID}
          required
          aria-invalid={Boolean(errors.MODULE_ID)}
          aria-describedby={errors.MODULE_ID ? 'MODULE_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Module--</option>
          {moduleOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'MODULE_ID-error'} message={errors.MODULE_ID} />
      </div>

      <div className={'erp-menu-permission-field'}>
        <label className={'erp-field-label'} htmlFor={'PERMISSION_ID'}>
          Permission
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'PERMISSION_ID'}
          name={'PERMISSION_ID'}
          className={fieldClass(errors.PERMISSION_ID)}
          value={values.PERMISSION_ID}
          required
          aria-invalid={Boolean(errors.PERMISSION_ID)}
          aria-describedby={errors.PERMISSION_ID ? 'PERMISSION_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Permission--</option>
          {permissionOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'PERMISSION_ID-error'} message={errors.PERMISSION_ID} />
      </div>

      <div className={'erp-menu-sort-field'}>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>
          Sort Order
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          value={values.SORT_ORDER}
          min={'2'}
          step={'1'}
          placeholder={'Enter sort order'}
          required
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
      </div>

      <div className={'erp-menu-active-field'}>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} />
          <span>Is Active</span>
        </label>
      </div>

      <div className={'erp-menu-route-field'}>
        <label className={'erp-field-label'} htmlFor={'ROUTE_NAME'}>
          Route Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          id={'ROUTE_NAME'}
          name={'ROUTE_NAME'}
          type={'text'}
          className={fieldClass(errors.ROUTE_NAME)}
          value={values.ROUTE_NAME}
          maxLength={200}
          placeholder={'Enter Route Name'}
          required
          aria-invalid={Boolean(errors.ROUTE_NAME)}
          aria-describedby={errors.ROUTE_NAME ? 'ROUTE_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'ROUTE_NAME-error'} message={errors.ROUTE_NAME} />
      </div>
    </div>
  )
}

export default CreateMenuForm
