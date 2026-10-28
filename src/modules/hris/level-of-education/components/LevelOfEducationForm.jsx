/**
 * @file Controlled form presentation for Level Of Education.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className={'erp-field-error'}>
      {message}
    </p>
  )
}

function fieldClass(error, extra = '') {
  return ['erp-form-control', extra, error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      <span className={'erp-required'} aria-hidden={'true'}>
        *
      </span>
    </label>
  )
}

function LevelOfEducationForm({ values, errors, levelOfEducationRef, onChange }) {
  return (
    <div className={'erp-level-of-education-form'}>
      {/* 4 columns layout since there are 4 fields */}
      <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[30px] gap-y-3.5'}>
        {/* 1. Level of Education */}
        <div>
          <RequiredLabel htmlFor={'LEVEL_OF_EDU'}>Level of Education</RequiredLabel>
          <input
            ref={levelOfEducationRef}
            id={'LEVEL_OF_EDU'}
            name={'LEVEL_OF_EDU'}
            type={'text'}
            maxLength={50}
            className={fieldClass(errors.LEVEL_OF_EDU)}
            placeholder={'Enter Level of Education'}
            value={values.LEVEL_OF_EDU || ''}
            required
            aria-invalid={Boolean(errors.LEVEL_OF_EDU)}
            aria-describedby={errors.LEVEL_OF_EDU ? 'LEVEL_OF_EDU-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'LEVEL_OF_EDU-error'} message={errors.LEVEL_OF_EDU} />
        </div>

        {/* 2. Short Name */}
        <div>
          <label className={'erp-field-label'} htmlFor={'SHORT_NAME'}>
            Short Name
          </label>
          <input
            id={'SHORT_NAME'}
            name={'SHORT_NAME'}
            type={'text'}
            className={fieldClass(errors.SHORT_NAME)}
            placeholder={'e.g. SSC, BSc'}
            value={values.SHORT_NAME || ''}
            aria-invalid={Boolean(errors.SHORT_NAME)}
            aria-describedby={errors.SHORT_NAME ? 'SHORT_NAME-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'SHORT_NAME-error'} message={errors.SHORT_NAME} />
        </div>

        {/* 3. Sort Order */}
        <div>
          <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>
            Sort Order
          </label>
          <input
            id={'SORT_ORDER'}
            name={'SORT_ORDER'}
            type={'number'}
            min={1}
            className={fieldClass(errors.SORT_ORDER)}
            placeholder={'e.g. 1'}
            value={values.SORT_ORDER || ''}
            step={'1'}
            inputMode={'numeric'}
            aria-invalid={Boolean(errors.SORT_ORDER)}
            aria-describedby={errors.SORT_ORDER ? 'SORT_ORDER-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'SORT_ORDER-error'} message={errors.SORT_ORDER} />
        </div>

        {/* 4. Is Active? Switch */}
        <div className={'flex flex-col justify-end pb-2'}>
          <label className={'erp-switch-field cursor-pointer items-center'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'STATUS'}
              checked={values.STATUS === '1'}
              onChange={(e) =>
                onChange({
                  target: {
                    name: 'STATUS',
                    type: 'checkbox',
                    checked: e.target.checked,
                  },
                })
              }
            />
            <span className={'text-sm font-semibold text-gray-700'}>Is Active?</span>
          </label>
          <FieldError id={'STATUS-error'} message={errors.STATUS} />
        </div>
      </div>
    </div>
  )
}

export default LevelOfEducationForm
