/** @file Controlled single-record Degree form used by Edit. */
function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className={'erp-field-error'}>{message}</p>
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function DegreeForm({ values, errors, levelOptions = [], loadingLevels = false, degreeNameRef, onChange }) {
  return (
    <div className={'grid grid-cols-1 gap-x-[30px] gap-y-3.5 md:grid-cols-2 lg:grid-cols-4'}>
      <div>
        <label className={'erp-field-label'} htmlFor={'LEVEL_OF_EDU_ID'}>
          Level of Education <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select id={'LEVEL_OF_EDU_ID'} name={'LEVEL_OF_EDU_ID'} className={fieldClass(errors.LEVEL_OF_EDU_ID)} value={values.LEVEL_OF_EDU_ID} required disabled={loadingLevels} aria-invalid={Boolean(errors.LEVEL_OF_EDU_ID)} aria-describedby={errors.LEVEL_OF_EDU_ID ? 'degree-level-error' : undefined} onChange={onChange}>
          <option value={''}>{loadingLevels ? 'Loading...' : '--Select Level of Education--'}</option>
          {levelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <FieldError id={'degree-level-error'} message={errors.LEVEL_OF_EDU_ID} />
      </div>
      <div>
        <label className={'erp-field-label'} htmlFor={'DEGREE_NAME'}>
          Degree Name <span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <input ref={degreeNameRef} id={'DEGREE_NAME'} name={'DEGREE_NAME'} type={'text'} maxLength={50} className={fieldClass(errors.DEGREE_NAME)} value={values.DEGREE_NAME} required aria-invalid={Boolean(errors.DEGREE_NAME)} aria-describedby={errors.DEGREE_NAME ? 'degree-name-error' : undefined} onChange={onChange} />
        <FieldError id={'degree-name-error'} message={errors.DEGREE_NAME} />
      </div>
      <div>
        <label className={'erp-field-label'} htmlFor={'SHORT_NAME'}>Short Name</label>
        <input id={'SHORT_NAME'} name={'SHORT_NAME'} type={'text'} className={fieldClass(errors.SHORT_NAME)} value={values.SHORT_NAME} aria-invalid={Boolean(errors.SHORT_NAME)} aria-describedby={errors.SHORT_NAME ? 'degree-short-name-error' : undefined} onChange={onChange} />
        <FieldError id={'degree-short-name-error'} message={errors.SHORT_NAME} />
      </div>
      <div>
        <label className={'erp-field-label'} htmlFor={'SORT_ORDER'}>Sort Order</label>
        <input id={'SORT_ORDER'} name={'SORT_ORDER'} type={'number'} min={1} step={'1'} inputMode={'numeric'} className={fieldClass(errors.SORT_ORDER)} value={values.SORT_ORDER} aria-invalid={Boolean(errors.SORT_ORDER)} aria-describedby={errors.SORT_ORDER ? 'degree-sort-order-error' : undefined} onChange={onChange} />
        <FieldError id={'degree-sort-order-error'} message={errors.SORT_ORDER} />
      </div>
      <div>
        <label className={'erp-switch-field'}>
          <input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} />
          <span>Is Active?</span>
        </label>
      </div>
    </div>
  )
}

export default DegreeForm
