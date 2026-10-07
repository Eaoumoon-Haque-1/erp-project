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
  businessGroup,
  businessUnits,
  departments,
  designations,
  onChange,
  businessUnitRef,
  departmentRef,
  designationRef,
}) {
  const availableBusinessUnits = businessUnits.filter(
    (unit) => String(unit.BG_ID) === String(values.BG_ID),
  )
  const availableDepartments = departments.filter(
    (department) => String(department.BU_ID) === String(values.BU_ID),
  )
  const availableDesignations = designations.filter(
    (designation) => String(designation.DEPT_ID) === String(values.DEPT_ID),
  )

  return (
    <div className={'erp-form-grid'}>
      <div>
        <RequiredLabel htmlFor={'MAPPING_BG_ID-display'}>Group Name</RequiredLabel>
        <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
        <input
          id={'MAPPING_BG_ID-display'}
          className={'erp-form-control erp-readonly'}
          type={'text'}
          value={businessGroup.GROUP_NAME}
          readOnly
          aria-describedby={errors.BG_ID ? 'MAPPING_BG_ID-error' : undefined}
        />
        <FieldError id={'MAPPING_BG_ID-error'} message={errors.BG_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'BU_ID'}>Business Unit</RequiredLabel>
        <select
          ref={businessUnitRef}
          id={'BU_ID'}
          name={'BU_ID'}
          className={fieldClass(errors.BU_ID)}
          value={values.BU_ID}
          required
          aria-invalid={Boolean(errors.BU_ID)}
          aria-describedby={errors.BU_ID ? 'BU_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>Select...</option>
          {availableBusinessUnits.map((unit) => (
            <option key={unit.ID} value={unit.ID}>{unit.BUSINESS_UNIT}</option>
          ))}
        </select>
        <FieldError id={'BU_ID-error'} message={errors.BU_ID} />
      </div>

      <div>
        <RequiredLabel htmlFor={'DEPT_ID'}>Department Name</RequiredLabel>
        <select
          ref={departmentRef}
          id={'DEPT_ID'}
          name={'DEPT_ID'}
          className={fieldClass(errors.DEPT_ID)}
          value={values.DEPT_ID}
          required
          disabled={!values.BU_ID}
          aria-invalid={Boolean(errors.DEPT_ID)}
          aria-describedby={errors.DEPT_ID ? 'DEPT_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>Select...</option>
          {availableDepartments.map((department) => (
            <option key={department.ID} value={department.ID}>
              {department.DEPARTMENT_NAME}
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
          disabled={!values.DEPT_ID}
          aria-invalid={Boolean(errors.DESIG_ID)}
          aria-describedby={errors.DESIG_ID ? 'DESIG_ID-error' : undefined}
          onChange={onChange}
        >
          <option value={''}>Select...</option>
          {availableDesignations.map((designation) => (
            <option key={designation.ID} value={designation.ID}>
              {designation.DESIGNATION_NAME}
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
