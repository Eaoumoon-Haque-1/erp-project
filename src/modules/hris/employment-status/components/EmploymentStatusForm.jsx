/**
 * @file Controlled form presentation for Employment Status.
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

function EmploymentStatusForm({ values, errors, onChange, statusNameRef }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'STATUS_NAME'}>
          Status Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={statusNameRef}
          id={'STATUS_NAME'}
          name={'STATUS_NAME'}
          type={'text'}
          className={fieldClass(errors.STATUS_NAME)}
          placeholder={'Enter status name'}
          value={values.STATUS_NAME}
          maxLength={50}
          required
          aria-invalid={Boolean(errors.STATUS_NAME)}
          aria-describedby={errors.STATUS_NAME ? 'STATUS_NAME-error' : undefined}
          onChange={onChange}
        />
        <FieldError id={'STATUS_NAME-error'} message={errors.STATUS_NAME} />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYMENT_STATUS_SHORT_NAME'}>
          Short Name
        </label>
        <input
          id={'EMPLOYMENT_STATUS_SHORT_NAME'}
          name={'SHORT_NAME'}
          type={'text'}
          className={fieldClass(errors.SHORT_NAME)}
          placeholder={'Enter short name'}
          value={values.SHORT_NAME}
          maxLength={5}
          aria-invalid={Boolean(errors.SHORT_NAME)}
          aria-describedby={
            errors.SHORT_NAME ? 'EMPLOYMENT_STATUS_SHORT_NAME-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={'EMPLOYMENT_STATUS_SHORT_NAME-error'}
          message={errors.SHORT_NAME}
        />
      </div>

      <div>
        <label className={'erp-field-label'} htmlFor={'EMPLOYMENT_STATUS_SORT_ORDER'}>
          Sort Order
        </label>
        <input
          id={'EMPLOYMENT_STATUS_SORT_ORDER'}
          name={'SORT_ORDER'}
          type={'number'}
          className={fieldClass(errors.SORT_ORDER)}
          placeholder={'Enter sort order'}
          value={values.SORT_ORDER}
          min={'0.000001'}
          step={'any'}
          inputMode={'decimal'}
          aria-invalid={Boolean(errors.SORT_ORDER)}
          aria-describedby={
            errors.SORT_ORDER ? 'EMPLOYMENT_STATUS_SORT_ORDER-error' : undefined
          }
          onChange={onChange}
        />
        <FieldError
          id={'EMPLOYMENT_STATUS_SORT_ORDER-error'}
          message={errors.SORT_ORDER}
        />
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

export default EmploymentStatusForm
