/**
 * @file Controlled form presentation for Employee Information.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import EmployeeField from "./EmployeeField";
import EmployeePhotoField from "./EmployeePhotoField";
import EmployeeSectionCard from "./EmployeeSectionCard";
import RepeatableEmployeeTable from "./RepeatableEmployeeTable";
import {
  bloodGroupOptions,
  businessUnitOptions,
  countryOptions,
  degreeTitleOptions,
  departmentOptions,
  designationOptions,
  disabilityTypeOptions,
  thanaOptions,
  districtOptions,
  educationLevelOptions,
  employmentStatusOptions,
  employmentTypeOptions,
  genderOptions,
  maritalStatusOptions,
  nationalityOptions,
  religionOptions,
  reportingOfficerOptions,
  boardOptions,
  resultOptions,
  toSelectOptions,
} from "../data/employeeOptions";
import {
  EMPLOYEE_CERTIFICATION_TABLE,
  EMPLOYEE_EDUCATION_TABLE,
  EMPLOYEE_JOB_EXPERIENCE_TABLE,
  EMPLOYEE_TRAINING_TABLE,
} from "../validation/employeeInformationValidation";

const yesNoOptions = [
  { value: "NO", label: "No" },
  { value: "YES", label: "Yes" },
];

function Grid({ children, className = "" }) {
  return (
    <div
      className={["erp-form-grid", "erp-employee-form-grid", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function DerivedOfficerFields({ officer }) {
  const fields = [
    ["Officerâ€™s ID", officer?.employeeId || ""],
    ["Officerâ€™s Name", officer?.name || ""],
    ["Department", officer?.department || ""],
    ["Designation", officer?.designation || ""],
  ];
  return fields.map(([label, value]) => (
    <div className={"erp-employee-field"} key={label}>
      <span className={"erp-field-label"}>{label}</span>
      <input
        className={"erp-form-control erp-readonly"}
        type={"text"}
        value={value}
        readOnly
        aria-label={label}
      />
    </div>
  ));
}

function EmployeeInformationForm({
  values,
  errors,
  activeTab,
  previewUrl,
  photoInputRef,
  onChange,
  onTabChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onReorderRows,
}) {
  const fieldErrors = errors.fields || {};
  const officer = reportingOfficerOptions.find(
    (item) => item.value === values.REPORTING_OFFICER_ID,
  );
  const departments = departmentOptions.filter(
    (item) =>
      !values.BUSINESS_UNIT_ID ||
      item.businessUnitId === values.BUSINESS_UNIT_ID,
  );
  const field = (name, label, props = {}) => (
    <EmployeeField
      key={name}
      name={name}
      label={label}
      value={values[name]}
      error={fieldErrors[name]}
      onChange={onChange}
      {...props}
    />
  );

  const educationColumns = [
    {
      key: "EDUCATION_LEVEL_ID",
      label: "Education Level",
      // required: true,
      options: toSelectOptions(educationLevelOptions),
      className: "erp-table-cell-wide",
    },
    {
      key: "DEGREE_TITLE_ID",
      label: "Degree Title",
      // required: true,
      options: toSelectOptions(degreeTitleOptions),
      className: "erp-table-cell-wide",
    },
    { key: "MAJOR_GROUP", label: "Major/Group", maxLength: 150 },
    {
      key: "INSTITUTE_NAME",
      label: "Institute Name",
      // required: true,
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "Board",
      label: "Board",
      // required: true,
      maxLength: 200,
      className: "erp-table-cell-xwide",
      options: toSelectOptions(boardOptions),
    },
    {
      key: "RESULT",
      label: "Result",
      // required: true,
      options: toSelectOptions(resultOptions),
    },
    {
      key: "CGPA_MARKS",
      label: "CGPA/Marks",
      type: "number",
      min: "0",
      step: "any",
    },
    {
      key: "SCALE_MARKS",
      label: "Scale/Marks",
      type: "number",
      min: "0.01",
      step: "any",
    },
    {
      key: "YEAR_OF_PASSING",
      label: "Year of Passing",
      // required: true,
      type: "text",
      maxLength: 4,
      digitsOnly: true,
    },
    {
      key: "DURATION",
      label: "Duration (Years)",
      type: "number",
      min: "0.01",
      step: "any",
    },
  ];
  // Label er por required: true,
  const trainingColumns = [
    {
      key: "TRAINING_TITLE",
      label: "Training Title",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "COUNTRY_ID",
      label: "Country",
      options: toSelectOptions(countryOptions),
      className: "erp-table-cell-wide",
    },
    {
      key: "TOPICS_COVERED",
      label: "Topics Covered",
      maxLength: 500,
      className: "erp-table-cell-xwide",
    },
    {
      key: "TRAINING_YEAR",
      label: "Training Year",
      type: "number",
      min: "1900",
      step: "1",
      maxLength: 4,
      digitsOnly: true,
    },
    {
      key: "INSTITUTE_NAME",
      label: "Institute Name",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "DURATION",
      label: "Duration",
      type: "text",
      min: "0.01",
      step: "any",
    },
    { key: "LOCATION", label: "Location", maxLength: 150 },
  ];
  // Label er por required: true,
  const certificationColumns = [
    {
      key: "CERTIFICATION",
      label: "Certification",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "INSTITUTE_NAME",
      label: "Institute Name",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "LOCATION",
      label: "Location",
      maxLength: 150,
      className: "erp-table-cell-wide",
    },
    {
      key: "DURATION",
      label: "Duration",
      type: "date-range",
      className: "erp-duration-column",
    },
  ];

  // Label er por required: true,
  const jobColumns = [
    {
      key: "COMPANY_NAME",
      label: "Company Name",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    {
      key: "COMPANY_BUSINESS",
      label: "Company Business",
      maxLength: 200,
      className: "erp-table-cell-xwide",
    },
    { key: "DESIGNATION", label: "Designation", maxLength: 150 },
    { key: "DEPARTMENT", label: "Department", maxLength: 200 },
    { key: "EMPLOYMENT_PERIOD_START_DT", label: "Start Date", type: "date" },
    {
      key: "EMPLOYMENT_PERIOD_END_DT",
      label: "End Date",
      type: "date",
      disabled: (row) => row.CURRENTLY_WORKING === "1",
    },
    {
      key: "CURRENTLY_WORKING",
      label: "Currently Working",
      type: "checkbox",
      checkboxLabel: "Yes",
    },
    {
      key: "RESPONSIBILITIES",
      label: "Responsibilities",
      textarea: true,
      maxLength: 500,
      className: "erp-table-cell-xwide",
    },
  ];

  return (
    <>
      <EmployeeSectionCard
        title={"Employee Information"}
        className={"erp-employee-primary-section"}
      >
        <div className={"erp-employee-information-layout"}>
          <Grid className={"erp-employee-information-fields"}>
            {field("EMPLOYEE_NAME", "Employee Name", {
              required: true,
              maxLength: 150,
              placeholder: "Enter employee name",
            })}
            {field("EMPLOYEE_ID", "Employee ID", {
              required: true,
              readOnly: true,
            })}
            {field("BUSINESS_UNIT_ID", "Business Unit", {
              required: true,
              options: businessUnitOptions,
            })}
            {/* {field('GENDER_ID', 'Gender', { required: true, options: toSelectOptions(genderOptions) })} */}
            {field("DEPARTMENT_ID", "Department", {
              required: true,
              options: departments,
              disabled: !values.BUSINESS_UNIT_ID,
            })}
            {field("DESIGNATION_ID", "Designation", {
              required: true,
              options: designationOptions,
            })}
            {field("JOINING_DATE", "Joining Date", {
              required: true,
              type: "date",
            })}
            {field("EMPLOYMENT_TYPE_ID", "Employment Type", {
              required: true,
              options: employmentTypeOptions,
            })}
            {field("EMPLOYMENT_STATUS", "Employment Status", {
              required: true,
              options: employmentStatusOptions,
            })}
            {field("CONFIRMATION_DATE", "Confirmation Date", { type: "date" })}
            {field("PROBATIONARY_PERIOD", "Probationary Period", {
              required: true,
              type: "number",
              min: "1",
              step: "1",
              placeholder: "Enter days",
            })}
            {field("NOTICE_PERIOD", "Notice Period", {
              required: true,
              type: "number",
              min: "0",
              step: "1",
              placeholder: "Enter days",
            })}
            {field("SEPARATION_DATE", "Separation Date", {
              required: values.EMPLOYMENT_STATUS === "SEPARATED",
              type: "date",
              disabled: values.EMPLOYMENT_STATUS !== "SEPARATED",
            })}
          </Grid>
          <EmployeePhotoField
            previewUrl={previewUrl}
            error={fieldErrors.PHOTO}
            inputRef={photoInputRef}
            onChange={onChange}
          />
        </div>
      </EmployeeSectionCard>

      <section className={"erp-employee-card erp-employee-tabs"}>
        <div
          className={"erp-employee-tab-list"}
          role={"tablist"}
          aria-label={"Employee information sections"}
        >
          {[
            // ["office", "Office Time"],
            ["personal", "Personal Information"],
            ["address", "Address & Contact"],
            ["marital", "Marital Status"],
            ["reporting", "Reporting Officer"],
            ["disability", "Disability"],
            ["education", "Education"],
            ["experience", "Job Experience"],
            ["training", "Training"],
            ["certification", "Professional Certification"],
          ].map(([key, label]) => (
            <button
              key={key}
              type={"button"}
              role={"tab"}
              className={[
                "erp-employee-tab",
                activeTab === key ? "erp-employee-tab-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-selected={activeTab === key}
              aria-controls={`employee-tab-${key}`}
              onClick={() => onTabChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className={"erp-employee-tab-panel"}
          id={`employee-tab-${activeTab}`}
          role={"tabpanel"}
        >
          {/* {activeTab === "office" && (
            <EmployeeSectionCard title={"Office Time"}>
              <Grid>
                {field("SHIFT_ID", "Shift", {
                  required: true,
                  options: shiftOptions,
                })}
                {field("OFFICE_IN_TIME", "Office In Time", {
                  required: true,
                  type: "time",
                })}
                {field("OFFICE_OUT_TIME", "Office Out Time", {
                  required: true,
                  type: "time",
                })}
                {field("OVERTIME_ALLOWANCE", "Overtime Allowance", {
                  required: true,
                  options: yesNoOptions,
                })}
              </Grid>
            </EmployeeSectionCard>
          )} */}

          {activeTab === "reporting" && (
            <EmployeeSectionCard title={"Reporting Officer"}>
              <Grid>
                {field("REPORTING_OFFICER_ID", "Reporting Officer", {
                  required: true,
                  options: reportingOfficerOptions.map((item) => ({
                    value: item.value,
                    label: `${item.employeeId} â€” ${item.name}`,
                  })),
                })}
                <DerivedOfficerFields officer={officer} />
              </Grid>
            </EmployeeSectionCard>
          )}

          {activeTab === "personal" && (
            <EmployeeSectionCard title={"Personal Information"}>
              <Grid>
                {field("FATHER_NAME", "Father's Name", {
                  // required: true,
                  maxLength: 150,
                })}
                {field("MOTHER_NAME", "Mother's Name", {
                  // required: true,
                  maxLength: 150,
                })}
                {field("DATE_OF_BIRTH", "Date of Birth", {
                  // required: true,
                  type: "date",
                })}
                {/* {field('BIRTH_PLACE', 'Birth Place', { required: true, maxLength: 150 })} */}
                {field("GENDER_ID", "Gender", {
                  // required: true,
                  options: toSelectOptions(genderOptions),
                })}
                {field("RELIGION_ID", "Religion", {
                  // required: true,
                  options: toSelectOptions(religionOptions),
                })}
                {field("NATIONALITY_ID", "Nationality", {
                  // required: true,
                  options: toSelectOptions(nationalityOptions),
                })}
                {field("HEIGHT_ID", "Height (Meters)", {
                  // required: true,
                })}
                {field("WEIGHT_ID", "Weight (Kg)", {
                  // required: true,
                })}
                {field("BLOOD_GROUP", "Blood Group", {
                  // required: true,
                  options: toSelectOptions(bloodGroupOptions),
                })}
                {field("HIGHEST_EDUCATION_ID", "Highest Education", {
                  // required: true,
                  options: toSelectOptions(educationLevelOptions),
                })}
                {field("NID", "NID", {
                  // required: true,
                  maxLength: 17,
                  placeholder: "10, 13, or 17 digits",
                })}
                {field("PASSPORT_NO", "Passport No", { maxLength: 20 })}
                {field("DRIVING_LICENSE_NO", "Driving License No", {
                  maxLength: 30,
                })}
              </Grid>
            </EmployeeSectionCard>
          )}

          {activeTab === "disability" && (
            <EmployeeSectionCard title={"Disability"}>
              <Grid>
                {field("DISABILITY_STATUS", "Disability Status", {
                  required: true,
                  options: yesNoOptions,
                })}
                {field("DISABILITY_TYPES", "Disability Type", {
                  required: values.DISABILITY_STATUS === "YES",
                  options: toSelectOptions(disabilityTypeOptions),
                  disabled: values.DISABILITY_STATUS !== "YES",
                })}
                {field("DISABILITY_DETAILS", "Disability Details", {
                  textarea: true,
                  maxLength: 500,
                  rows: 3,
                  placeholder: "Enter disability details",
                  disabled: values.DISABILITY_STATUS !== "YES",
                })}
                {field(
                  "HAS_NATIONAL_DISABILITY_ID",
                  "National Disability ID No",
                  {
                    required: values.DISABILITY_STATUS === "YES",
                    options: yesNoOptions,
                    disabled: values.DISABILITY_STATUS !== "YES",
                  },
                )}
                {field("NATIONAL_DISABILITY_ID", "National Disability ID", {
                  required:
                    values.DISABILITY_STATUS === "YES" &&
                    values.HAS_NATIONAL_DISABILITY_ID === "YES",
                  maxLength: 50,
                  placeholder: "Enter National Disability ID",
                  disabled:
                    values.DISABILITY_STATUS !== "YES" ||
                    values.HAS_NATIONAL_DISABILITY_ID !== "YES",
                })}
              </Grid>
            </EmployeeSectionCard>
          )}

          {activeTab === "marital" && (
            <EmployeeSectionCard title={"Marital Status"}>
              <Grid>
                {field("MARITAL_STATUS", "Marital Status", {
                  // required: true,
                  options: toSelectOptions(maritalStatusOptions),
                })}
                {field("SPOUSE_NAME", "Spouse Name", {
                  // required: values.MARITAL_STATUS === "Married",
                  maxLength: 150,
                  disabled: values.MARITAL_STATUS !== "Married",
                })}
                {field("DATE_OF_MARRIAGE", "Date of Marriage", {
                  // required: values.MARITAL_STATUS === "Married",
                  type: "date",
                  disabled: values.MARITAL_STATUS !== "Married",
                })}
                {field("NO_OF_CHILD", "No. of Child", {
                  type: "number",
                  min: "0",
                  step: "1",
                  readOnly: true,
                })}
                {field("MALE_CHILD", "Male Child", {
                  type: "number",
                  min: "0",
                  step: "1",
                  disabled: values.MARITAL_STATUS === "Single",
                })}
                {field("FEMALE_CHILD", "Female Child", {
                  type: "number",
                  min: "0",
                  step: "1",
                  disabled: values.MARITAL_STATUS === "Single",
                })}
              </Grid>
            </EmployeeSectionCard>
          )}

          {activeTab === "address" && (
            <EmployeeSectionCard title={"Address"}>
              <Grid>
                {field("PRESENT_ADDRESS", "Present Address", {
                  // required: true,
                  maxLength: 500,
                  textarea: true,
                })}
                {field("PERMANENT_ADDRESS", "Permanent Address", {
                  // required: true,
                  maxLength: 500,
                  textarea: true,
                })}
                {field("DISTRICT", "District", {
                  // required: true,
                  options: toSelectOptions(districtOptions),
                })}
                {field("THANA", "Thana", {
                  // required: true,
                  options: toSelectOptions(thanaOptions),
                })}
                {/* </Grid>
      </EmployeeSectionCard>

      <EmployeeSectionCard title={'Contact Number'}>
        <Grid> */}
                {field("OFFICE_MOBILE_NO", "Office Mobile No", {
                  // required: true,
                  type: "tel",
                  inputMode: "numeric",
                  digitsOnly: true,
                  maxLength: 11,
                  placeholder: "01XXXXXXXXX",
                })}
                {field("PERSONAL_MOBILE_NO", "Personal Mobile No", {
                  // required: true,
                  type: "tel",
                  inputMode: "numeric",
                  digitsOnly: true,
                  maxLength: 11,
                  placeholder: "01XXXXXXXXX",
                })}
                {field("EMERGENCY_MOBILE_NO", "Emergency Contact", {
                  // required: true,
                  type: "tel",
                  inputMode: "numeric",
                  digitsOnly: true,
                  maxLength: 11,
                  placeholder: "01XXXXXXXXX",
                })}
                {field("WHATSAPP_NO", "WhatsApp No", {
                  type: "tel",
                  inputMode: "numeric",
                  digitsOnly: true,
                  maxLength: 11,
                  placeholder: "01XXXXXXXXX",
                })}
                {field("EMAIL", "Personal Email", {
                  // required: true,
                  type: "email",
                  maxLength: 150,
                })}
                {field("OFFICE_EMAIL", "Office Email", {
                  // required: true,
                  type: "email",
                  maxLength: 150,
                })}
              </Grid>
            </EmployeeSectionCard>
          )}

          {activeTab === "education" && (
            <RepeatableEmployeeTable
              embedded
              title={"Education"}
              tableName={EMPLOYEE_EDUCATION_TABLE}
              rows={values.education}
              errors={errors.education}
              columns={educationColumns}
              onChange={(index, key, value) =>
                onRowChange("education", index, key, value)
              }
              onAdd={() => onAddRow("education")}
              onRemove={(index) => onRemoveRow("education", index)}
              onReorder={(sourceIndex, targetIndex) =>
                onReorderRows("education", sourceIndex, targetIndex)
              }
            />
          )}
          {activeTab === "training" && (
            <RepeatableEmployeeTable
              embedded
              title={"Training"}
              tableName={EMPLOYEE_TRAINING_TABLE}
              rows={values.training}
              errors={errors.training}
              columns={trainingColumns}
              onChange={(index, key, value) =>
                onRowChange("training", index, key, value)
              }
              onAdd={() => onAddRow("training")}
              onRemove={(index) => onRemoveRow("training", index)}
              onReorder={(sourceIndex, targetIndex) =>
                onReorderRows("training", sourceIndex, targetIndex)
              }
            />
          )}
          {activeTab === "certification" && (
            <RepeatableEmployeeTable
              embedded
              title={"Professional Certification"}
              tableName={EMPLOYEE_CERTIFICATION_TABLE}
              rows={values.certification}
              errors={errors.certification}
              columns={certificationColumns}
              onChange={(index, key, value) =>
                onRowChange("certification", index, key, value)
              }
              onAdd={() => onAddRow("certification")}
              onRemove={(index) => onRemoveRow("certification", index)}
              onReorder={(sourceIndex, targetIndex) =>
                onReorderRows("certification", sourceIndex, targetIndex)
              }
            />
          )}
          {activeTab === "experience" && (
            <RepeatableEmployeeTable
              embedded
              title={"Job Experience"}
              tableName={EMPLOYEE_JOB_EXPERIENCE_TABLE}
              rows={values.jobExperience}
              errors={errors.jobExperience}
              columns={jobColumns}
              onChange={(index, key, value) =>
                onRowChange("jobExperience", index, key, value)
              }
              onAdd={() => onAddRow("jobExperience")}
              onRemove={(index) => onRemoveRow("jobExperience", index)}
              onReorder={(sourceIndex, targetIndex) =>
                onReorderRows("jobExperience", sourceIndex, targetIndex)
              }
            />
          )}
        </div>
      </section>
    </>
  );
}

export default EmployeeInformationForm;
