/**
 * @file Controlled form presentation for Menu creation/editing.
 * Menu Name and Is Top Menu share the first row. All conditional fields then
 * follow vertically so this exceptional form mirrors the approved sheet.
 */
import MultiSelectField from '../../../../components/shared/MultiSelectField'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function RadioField({ name, label, value, options, onChange }) {
  return (
    <fieldset className={'erp-menu-radio-field'}>
      <legend className={'erp-field-label'}>
        {label}
        <span className={'erp-required'} aria-hidden={'true'}>*</span>
      </legend>
      <div className={'erp-menu-radio-options'}>
        {options.map((option) => (
          <label key={option.value} className={'erp-radio-option'}>
            <input
              type={'radio'}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const yesNoOptions = [
  { value: '1', label: 'Yes' },
  { value: '0', label: 'No' },
]

const statusOptions = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

function CreateMenuForm({
  values,
  errors,
  menuNameRef,
  moduleOptions = [],
  parentMenuOptions = [],
  permissionOptions = [],
  onChange,
  onPermissionChange,
}) {
  const isTopMenu = values.IS_TOP_MENU === '1'

  return (
    <div className={'erp-menu-form-layout'}>
      <div className={'erp-menu-primary-row'}>
        <div>
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

        <RadioField
          name={'IS_TOP_MENU'}
          label={'Is Top Menu?'}
          value={values.IS_TOP_MENU}
          options={yesNoOptions}
          onChange={onChange}
        />
      </div>

      <div className={'erp-menu-stacked-fields'}>
        {isTopMenu && (
          <>
            <RadioField
              name={'IS_PARENT'}
              label={'Is Parent Menu?'}
              value={values.IS_PARENT}
              options={yesNoOptions}
              onChange={onChange}
            />

            <div>
              <label className={'erp-field-label'} htmlFor={'PARENT_MENU_ID'}>
                Parent Menu
              </label>
              <select
                id={'PARENT_MENU_ID'}
                name={'PARENT_MENU_ID'}
                className={fieldClass(errors.PARENT_MENU_ID)}
                value={values.PARENT_MENU_ID}
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

            <div>
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

            <MultiSelectField
              id={'PERMISSION_ID'}
              name={'PERMISSION_ID'}
              label={'Permission'}
              placeholder={'--Select Permissions--'}
              options={permissionOptions}
              value={values.PERMISSION_ID}
              error={errors.PERMISSION_ID}
              growWithContent
              onChange={onPermissionChange}
            />

            <div>
              <label className={'erp-field-label'} htmlFor={'ROUTE_NAME'}>
                Route Name
                <span className={'erp-required'} aria-hidden={'true'}>*</span>
              </label>
              <input
                id={'ROUTE_NAME'}
                name={'ROUTE_NAME'}
                type={'text'}
                className={'erp-form-control erp-readonly'}
                value={'#'}
                readOnly
                aria-readonly={'true'}
              />
            </div>
          </>
        )}

        <div>
          <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>
            Sort Order
          </label>
          <input
            id={'SORT_ORDER'}
            name={'SORT_ORDER'}
            type={'number'}
            className={fieldClass(errors.SORT_ORDER)}
            value={values.SORT_ORDER}
            min={'0'}
            step={'any'}
            placeholder={'Enter sort order'}
            aria-invalid={Boolean(errors.SORT_ORDER)}
            aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
        </div>

        <RadioField
          name={'STATUS'}
          label={'Is Active?'}
          value={values.STATUS}
          options={statusOptions}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default CreateMenuForm
