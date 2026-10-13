/**
 * @file Feature UI component for Role: RolePermissionAssignment.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
import MultiSelectField from '../../../../components/shared/MultiSelectField'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function RolePermissionAssignment({
  values,
  errors,
  moduleOptions = [],
  menuOptions = [],
  permissionOptions = [],
  onChange,
  onAdd,
}) {
  return (
    <div className={'erp-role-assignment-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'MODULE_ID'}>
          Module Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'MODULE_ID'} name={'MODULE_ID'} className={fieldClass(errors.MODULE_ID)} value={values.MODULE_ID} required aria-invalid={Boolean(errors.MODULE_ID)} aria-describedby={errors.MODULE_ID ? 'role-MODULE_ID-error' : undefined} onChange={onChange}>
          <option value={''}>Select...</option>
          {moduleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'role-MODULE_ID-error'} message={errors.MODULE_ID} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'MENU_ID'}>
          Menu Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'MENU_ID'} name={'MENU_ID'} className={fieldClass(errors.MENU_ID)} value={values.MENU_ID} required disabled={!values.MODULE_ID} aria-invalid={Boolean(errors.MENU_ID)} aria-describedby={errors.MENU_ID ? 'role-MENU_ID-error' : undefined} onChange={onChange}>
          <option value={''}>Select...</option>
          {menuOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'role-MENU_ID-error'} message={errors.MENU_ID} />
      </div>

      <MultiSelectField
        id={'PERMISSION_ID'}
        name={'PERMISSION_ID'}
        label={'Permission Name'}
        placeholder={'--Select Permissions--'}
        options={permissionOptions}
        value={values.PERMISSION_ID}
        error={errors.PERMISSION_ID}
        disabled={!values.MENU_ID}
        required
        growWithContent
        onChange={(name, value) => onChange({ target: { name, value } })}
      />

      <button type={onAdd ? 'button' : 'submit'} className={'erp-role-add-button'} aria-label={'Add permission'} title={'Add permission'} onClick={onAdd}>
        <span aria-hidden={'true'}>+</span>
      </button>
    </div>
  )
}

export default RolePermissionAssignment
