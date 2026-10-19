/** @file Read-only Employee Information page backed by the Employee GET endpoint. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { employeesApi } from '../api/employeeApi'
import { mapEmployeeFromApi } from '../data/employeeApiMapper'
import { createEmployeeReferenceNames, loadEmployeeReferences } from '../data/employeeReferences'

const basePath = '/hris/hris-forms/employee-information'

async function loadEmployee(id) {
  const [record, referenceResult] = await Promise.all([employeesApi.get(id), loadEmployeeReferences()])
  const mapped = mapEmployeeFromApi(record)
  const names = createEmployeeReferenceNames(referenceResult.references)
  return {
    ...mapped,
    BUSINESS_UNIT_NAME: names.businessUnits.get(mapped.BUSINESS_UNIT_ID) || '',
    DEPARTMENT_NAME: names.departments.get(mapped.DEPARTMENT_ID) || '',
    DESIGNATION_NAME: names.designations.get(mapped.DESIGNATION_ID) || '',
    EMPLOYMENT_TYPE_NAME: names.employmentTypes.get(mapped.EMPLOYMENT_TYPE_ID) || '',
    EMPLOYMENT_STATUS_NAME: names.employmentStatuses.get(mapped.EMPLOYMENT_STATUS) || '',
    SHIFT_NAME: names.shifts.get(mapped.SHIFT_ID) || '',
    REPORTING_OFFICER_NAME: names.employees.get(mapped.REPORTING_OFFICER_ID) || '',
    GENDER_NAME: names.lookupValues.get(mapped.GENDER_ID) || mapped.GENDER_ID,
    RELIGION_NAME: names.lookupValues.get(mapped.RELIGION_ID) || mapped.RELIGION_ID,
    NATIONALITY_NAME: names.lookupValues.get(mapped.NATIONALITY_ID) || mapped.NATIONALITY_ID,
    BLOOD_GROUP_NAME: names.lookupValues.get(mapped.BLOOD_GROUP) || mapped.BLOOD_GROUP,
    HIGHEST_EDUCATION_NAME: names.levels.get(mapped.HIGHEST_EDUCATION_ID) || mapped.HIGHEST_EDUCATION_ID,
    DISABILITY_TYPE_NAME: names.lookupValues.get(mapped.DISABILITY_TYPES) || mapped.DISABILITY_TYPES,
  }
}

const fields = [
  { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'EMPLOYEE_ID', label: 'Employee ID' },
  { key: 'PHOTO', label: 'Photo', type: 'image' },
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'DESIGNATION_NAME', label: 'Designation' },
  { key: 'EMPLOYMENT_TYPE_NAME', label: 'Employment Type' },
  { key: 'EMPLOYMENT_STATUS_NAME', label: 'Employment Status' },
  { key: 'JOINING_DATE', label: 'Joining Date' },
  { key: 'CONFIRMATION_DATE', label: 'Confirmation Date' },
  { key: 'PROBATIONARY_PERIOD', label: 'Probationary Period' },
  { key: 'NOTICE_PERIOD', label: 'Notice Period' },
  { key: 'SEPARATION_DATE', label: 'Separation Date' },
  { key: 'SHIFT_NAME', label: 'Shift' },
  { key: 'OFFICE_IN_TIME', label: 'Office In Time' },
  { key: 'OFFICE_OUT_TIME', label: 'Office Out Time' },
  { key: 'OVERTIME_ALLOWANCE', label: 'Overtime Allowance' },
  { key: 'REPORTING_OFFICER_NAME', label: 'Reporting Officer' },
  { key: 'FATHER_NAME', label: "Father's Name" },
  { key: 'MOTHER_NAME', label: "Mother's Name" },
  { key: 'SPOUSE_NAME', label: 'Spouse Name' },
  { key: 'DATE_OF_BIRTH', label: 'Date of Birth' },
  { key: 'BIRTH_PLACE', label: 'Birth Place' },
  { key: 'GENDER_NAME', label: 'Gender' },
  { key: 'MARITAL_STATUS', label: 'Marital Status' },
  { key: 'DATE_OF_MARRIAGE', label: 'Date of Marriage' },
  { key: 'RELIGION_NAME', label: 'Religion' },
  { key: 'NATIONALITY_NAME', label: 'Nationality' },
  { key: 'BLOOD_GROUP_NAME', label: 'Blood Group' },
  { key: 'HIGHEST_EDUCATION_NAME', label: 'Highest Education' },
  { key: 'NID', label: 'NID' },
  { key: 'PASSPORT_NO', label: 'Passport No' },
  { key: 'DRIVING_LICENSE_NO', label: 'Driving License No' },
  { key: 'NO_OF_CHILD', label: 'No. of Child' },
  { key: 'MALE_CHILD', label: 'Male Child' },
  { key: 'FEMALE_CHILD', label: 'Female Child' },
  { key: 'PRESENT_ADDRESS', label: 'Present Address', wide: true },
  { key: 'PERMANENT_ADDRESS', label: 'Permanent Address', wide: true },
  { key: 'PERSONAL_MOBILE_NO', label: 'Mobile No' },
  { key: 'WHATSAPP_NO', label: 'WhatsApp No' },
  { key: 'RESIDENCE_PHONE', label: 'Residence Phone' },
  { key: 'EMAIL', label: 'Email' },
  { key: 'FAX', label: 'Fax' },
  { key: 'DISABILITY_STATUS', label: 'Disability Status' },
  { key: 'DISABILITY_TYPE_NAME', label: 'Disability Type' },
  { key: 'DISABILITY_DETAILS', label: 'Disability Details', wide: true },
  { key: 'HAS_NATIONAL_DISABILITY_ID', label: 'Has National Disability ID' },
  { key: 'NATIONAL_DISABILITY_ID', label: 'National Disability ID' },
  { key: 'STATUS', label: 'Status', type: 'status' },
]

const auditFields = [
  { key: 'CREATED_BY', label: 'Created By' },
  { key: 'CREATED_AT', label: 'Created At' },
  { key: 'UPDATED_BY', label: 'Updated By' },
  { key: 'UPDATED_AT', label: 'Updated At' },
]

function EmployeeInformationView() {
  return <ApiRecordViewPage title={'Employee Information View'} param={'employeeId'} listTo={basePath}
    editTo={(id) => `${basePath}/${id}/edit`} loader={loadEmployee} fields={fields} auditFields={auditFields} />
}

export default EmployeeInformationView
