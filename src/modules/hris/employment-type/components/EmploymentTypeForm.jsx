/**
 * @file Controlled form presentation for Employment Type.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return [
    'erp-form-control',
    error ? 'erp-form-control-invalid' : '',
  ].filter(Boolean).join(' ')
}

const categoryOptions = [
  { value: 'ET', label: 'Employment Type - ET' },
  { value: 'WS', label: 'Work Schedule - WS' },
  { value: 'PS', label: 'Probation Status - PS' },
  { value: 'ES', label: 'Employment Status - ES' },
]

function EmploymentTypeForm({ values, errors, onChange, typeNameRef }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'TYPE_NAME'}>
          Type Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={typeNameRef}
          id={'TYPE_NAME'}
          name={'TYPE_NAME'}
          type={'text'}
          className={fieldClass(errors.TYPE_NAME)}
          placeholder={'Enter type name'}
          value={values.TYPE_NAME}
          maxLength={50}
          required
          aria-invalid={Boolean(errors.TYPE_NAME)}
          aria-describedby={errors.TYPE_NAME ? 'TYPE_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'TYPE_NAME-error'} message={errors.TYPE_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYMENT_SHORT_NAME'}>
          Short Name
        </label>
        <input
          id={'EMPLOYMENT_SHORT_NAME'}
          name={'SHORT_NAME'}
          type={'text'}
          className={fieldClass(errors.SHORT_NAME)}
          placeholder={'Enter short name'}
          value={values.SHORT_NAME}
          aria-invalid={Boolean(errors.SHORT_NAME)}
          aria-describedby={errors.SHORT_NAME ? 'EMPLOYMENT_SHORT_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'EMPLOYMENT_SHORT_NAME-error'} message={errors.SHORT_NAME} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input
            className={'erp-switch-control'}
            type={'checkbox'}
            role={'switch'}
            name={'IS_DATE_FIELD_REQUIRED'}
            checked={values.IS_DATE_FIELD_REQUIRED === '1'}
            onChange={onChange}
          />
          <span>Is Date Field Required?</span>
        </label>
      </div>

      {values.IS_DATE_FIELD_REQUIRED === '1' && (
        <div>
          <label className={'erp-field-label'} htmlFor={'DATE_FIELD_LABEL'}>
            Date Field Label
            <span className={'erp-required'} aria-hidden={'true'}>*</span>
          </label>
          <input
            id={'DATE_FIELD_LABEL'}
            name={'DATE_FIELD_LABEL'}
            type={'text'}
            className={fieldClass(errors.DATE_FIELD_LABEL)}
            placeholder={'Enter date field label'}
            value={values.DATE_FIELD_LABEL}
            maxLength={100}
            required
            aria-invalid={Boolean(errors.DATE_FIELD_LABEL)}
            aria-describedby={errors.DATE_FIELD_LABEL ? 'DATE_FIELD_LABEL-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'DATE_FIELD_LABEL-error'} message={errors.DATE_FIELD_LABEL} />
        </div>
      )}

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYMENT_CATEGORY'}>
          Category
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'EMPLOYMENT_CATEGORY'}
          name={'CATEGORY'}
          className={fieldClass(errors.CATEGORY)}
          value={values.CATEGORY}
          required
          aria-invalid={Boolean(errors.CATEGORY)}
          aria-describedby={errors.CATEGORY ? 'EMPLOYMENT_CATEGORY-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>--Select Category--</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'EMPLOYMENT_CATEGORY-error'} message={errors.CATEGORY} />
      </div>

      <div>
        <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
        <label className={'erp-switch-field'}>
          <input
            className={'erp-switch-control'}
            type={'checkbox'}
            role={'switch'}
            name={'IS_DEFAULT'}
            checked={values.IS_DEFAULT === '1'}
            onChange={onChange}
          />
          <span>Is Default?</span>
        </label>
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYMENT_SORT_ORDER'}>
          Sort Order
        </label>
        <input
          id={'EMPLOYMENT_SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          placeholder={'Enter sort order'}
          value={values.SORT_ORDER}
          min={'0.000001'}
          step={'any'}
          inputMode={'decimal'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={errors.SORT_ORDER ? 'EMPLOYMENT_SORT_ORDER-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'EMPLOYMENT_SORT_ORDER-error'} message={errors.SORT_ORDER} />
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

export default EmploymentTypeForm
