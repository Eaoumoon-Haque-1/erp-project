/**
 * @file Controlled form presentation for Designation Department Mapping.
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

function RequiredLabel({ htmlFor, children }) {
  return (
    <label className={'erp-field-label'} htmlFor={htmlFor}>
      {children}
      <span className={'erp-required'} aria-hidden={'true'}>*</span>
    </label>
  )
}

function DesignationDepartmentMappingForm({
  values,
  errors,
  departmentOptions = [],
  designationOptions = [],
  optionsLoading = false,
  onChange,
  departmentRef,
  designationRef,
}) {
  return (
    <div className={'erp-form-grid'}>
      <div>
        <RequiredLabel htmlFor={'DEPT_ID'}>Department Name</RequiredLabel>
        <select
          ref={departmentRef}
          id={'DEPT_ID'}
          name={'DEPT_ID'}
          className={fieldClass(errors.DEPT_ID)}
          value={values.DEPT_ID}
          required
          disabled={!values.BU_ID || optionsLoading}
          aria-invalid={Boolean(errors.DEPT_ID)}
          aria-describedby={errors.DEPT_ID ? 'DEPT_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>{optionsLoading ? 'Loading...' : '--Select Department--'}</option>
          {departmentOptions.map((department) => (
            <option key={department.value} value={department.value}>
              {department.label}
            </option>
          ))}
        </select>
        <FieldError id={'DEPT_ID-error'} message={errors.DEPT_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'DESIG_ID'}>Designation Name</RequiredLabel>
        <select
          ref={designationRef}
          id={'DESIG_ID'}
          name={'DESIG_ID'}
          className={fieldClass(errors.DESIG_ID)}
          value={values.DESIG_ID}
          required
          disabled={!values.BU_ID || optionsLoading}
          aria-invalid={Boolean(errors.DESIG_ID)}
          aria-describedby={errors.DESIG_ID ? 'DESIG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>{optionsLoading ? 'Loading...' : '--Select Designation--'}</option>
          {designationOptions.map((designation) => (
            <option key={designation.value} value={designation.value}>
              {designation.label}
            </option>
          ))}
        </select>
        <FieldError id={'DESIG_ID-error'} message={errors.DESIG_ID} />
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

export default DesignationDepartmentMappingForm
