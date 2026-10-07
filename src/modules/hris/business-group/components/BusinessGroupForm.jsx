/**
 * @file Controlled form presentation for Business Group.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function BusinessGroupForm({ values, errors, onChange, groupNameRef }) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'GROUP_NAME'}>
          Group Name
          <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input
          ref={groupNameRef}
          id={'GROUP_NAME'}
          name={'GROUP_NAME'}
          type={'text'}
          className={[
            'erp-form-control',
            errors.GROUP_NAME ? 'erp-form-control-invalid' : '',
          ].join(' ')}
          placeholder={'Enter group name'}
          value={values.GROUP_NAME}
          maxLength={100}
          required
          aria-invalid={Boolean(errors.GROUP_NAME)}
          aria-describedby={errors.GROUP_NAME ? 'GROUP_NAME-error' : undefined}
          onChange={onChange}
        />
        {errors.GROUP_NAME && (
          <p id={'GROUP_NAME-error'} className={'erp-field-error'}>
            {errors.GROUP_NAME}
          </p>
        )}
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

export default BusinessGroupForm
