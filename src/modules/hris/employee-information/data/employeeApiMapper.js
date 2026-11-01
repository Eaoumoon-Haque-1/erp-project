/** @file Maps the existing Employee Information UI to the live Employee/Profile API contracts. */
import { fileToDataUrl } from '../../../../utils/imageDataUrl'
import {
  createCertificationRow,
  createEducationRow,
  createInitialEmployeeValues,
  createJobExperienceRow,
  createTrainingRow,
} from '../validation/employeeInformationValidation'

const text = (value) => value == null ? '' : String(value)
const nullableText = (value) => String(value ?? '').trim() || null
const numberOrNull = (value) => value === '' || value == null || Number.isNaN(Number(value)) ? null : Number(value)
const intOrZero = (value) => numberOrNull(value) ?? 0
const dateOrNull = (value) => value || null
const yes = (value) => value === true || value === 1 || String(value).toUpperCase() === 'YES' || String(value) === '1'
const dateRangeDuration = (value) => {
  const match = String(value ?? '').match(/^(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})$/)
  if (!match) return null
  const start = new Date(`${match[1]}T00:00:00Z`)
  const end = new Date(`${match[2]}T00:00:00Z`)
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}
const rowHasValue = (row) => Object.entries(row).some(([key, value]) => (
  !['_ROW_ID', 'ID', 'STATUS', '_API_DURATION'].includes(key)
  && key !== 'CURRENTLY_WORKING'
  && String(value ?? '').trim() !== ''
))

export function mapEmployeeFromApi(record = {}) {
  return {
    ...createInitialEmployeeValues(),
    ID: text(record.id),
    BG_ID: text(record.bgId),
    BUSINESS_UNIT_ID: text(record.buId),
    EMPLOYEE_NAME: record.employeeName ?? '',
    EMPLOYEE_ID: record.employeeCode ?? '',
    PHOTO: record.photo ?? null,
    DEPARTMENT_ID: text(record.deptId),
    DESIGNATION_ID: text(record.desigId),
    EMPLOYMENT_TYPE_ID: text(record.employmentTypeId),
    JOINING_DATE: record.joiningDate ?? '',
    CONFIRMATION_DATE: record.confirmationDate ?? '',
    EMPLOYMENT_STATUS: text(record.employmentStatusId),
    PROBATIONARY_PERIOD: text(record.probationaryPeriod),
    NOTICE_PERIOD: text(record.noticePeriod),
    SEPARATION_DATE: record.separationDate ?? '',
    // Shift remains visible in the current design, but the updated Employee
    // contract no longer exposes shiftId.
    SHIFT_ID: '',
    OFFICE_IN_TIME: record.officeInTime ?? '',
    OFFICE_OUT_TIME: record.officeOutTime ?? '',
    OVERTIME_ALLOWANCE: record.overtimeAllowance ? 'YES' : 'NO',
    REPORTING_OFFICER_ID: text(record.reportingOfficerId),
    FATHER_NAME: record.fatherName ?? '',
    MOTHER_NAME: record.motherName ?? '',
    SPOUSE_NAME: record.spouseName ?? '',
    DATE_OF_BIRTH: record.dateOfBirth ?? '',
    BIRTH_PLACE: record.birthPlace ?? '',
    GENDER_ID: text(record.gender ?? record.genderId),
    MARITAL_STATUS: record.maritalStatus ?? '',
    DATE_OF_MARRIAGE: record.dateOfMarriage ?? '',
    RELIGION_ID: text(record.religion ?? record.religionId),
    NATIONALITY_ID: text(record.nationalityId),
    HEIGHT_ID: text(record.height),
    WEIGHT_ID: text(record.weight),
    BLOOD_GROUP: text(record.bloodGroup ?? record.bloodGroupId),
    HIGHEST_EDUCATION_ID: text(record.highestEducationId),
    NID: record.nid ?? '',
    PASSPORT_NO: record.passportNo ?? '',
    DRIVING_LICENSE_NO: record.drivingLicenseNo ?? '',
    NO_OF_CHILD: text(record.noOfChild ?? 0),
    MALE_CHILD: text(record.maleChild ?? 0),
    FEMALE_CHILD: text(record.femaleChild ?? 0),
    PRESENT_ADDRESS: record.presentAddress ?? '',
    PERMANENT_ADDRESS: record.permanentAddress ?? '',
    DISTRICT: record.district ?? '',
    THANA: record.thana ?? '',
    OFFICE_MOBILE_NO: record.officeMobileNo ?? '',
    PERSONAL_MOBILE_NO: record.personalMobileNo ?? record.mobileNo ?? '',
    WHATSAPP_NO: record.whatsappNo ?? '',
    RESIDENCE_PHONE: record.residencePhone ?? '',
    EMERGENCY_MOBILE_NO: record.emergencyContact ?? '',
    EMAIL: record.personalEmail ?? record.email ?? '',
    OFFICE_EMAIL: record.officeEmail ?? '',
    DISABILITY_STATUS: Number(record.disabilityStatus) === 1 ? 'YES' : 'NO',
    DISABILITY_TYPES: text(record.disabilityTypeId),
    DISABILITY_DETAILS: record.disabilityDetails ?? '',
    HAS_NATIONAL_DISABILITY_ID: Number(record.hasNationalDisabilityId) === 1 ? 'YES' : 'NO',
    NATIONAL_DISABILITY_ID: record.nationalDisabilityId ?? '',
    STATUS: text(record.status ?? 1),
    CREATED_BY: text(record.createdUserId),
    CREATED_AT: text(record.createdDatetime),
    UPDATED_BY: text(record.updatedUserId),
    UPDATED_AT: text(record.updatedDatetime),
  }
}

export function mapEmployeeListFromApi(record = {}, names = {}) {
  return {
    ID: text(record.id),
    EMPLOYEE_ID: record.employeeCode ?? '',
    EMPLOYEE_NAME: record.employeeName ?? '',
    BUSINESS_UNIT_ID: text(record.buId),
    BUSINESS_UNIT_NAME: names.businessUnits?.get(text(record.buId)) || '',
    DEPARTMENT_ID: text(record.deptId),
    DEPARTMENT_NAME: names.departments?.get(text(record.deptId)) || '',
    DESIGNATION_NAME: names.designations?.get(text(record.desigId)) || '',
    EMPLOYMENT_STATUS: text(record.employmentStatusId),
    EMPLOYMENT_STATUS_NAME: names.employmentStatuses?.get(text(record.employmentStatusId)) || '',
    STATUS: text(record.status ?? 1),
  }
}

export async function mapEmployeeToApi(values, businessUnits = []) {
  const unit = businessUnits.find((item) => String(item.id) === String(values.BUSINESS_UNIT_ID))
  return {
    bgId: numberOrNull(unit?.bgId ?? values.BG_ID),
    buId: numberOrNull(values.BUSINESS_UNIT_ID),
    employeeName: values.EMPLOYEE_NAME,
    employeeCode: values.EMPLOYEE_ID,
    photo: await fileToDataUrl(values.PHOTO),
    deptId: numberOrNull(values.DEPARTMENT_ID),
    desigId: numberOrNull(values.DESIGNATION_ID),
    employmentTypeId: numberOrNull(values.EMPLOYMENT_TYPE_ID),
    joiningDate: dateOrNull(values.JOINING_DATE),
    confirmationDate: dateOrNull(values.CONFIRMATION_DATE),
    employmentStatusId: numberOrNull(values.EMPLOYMENT_STATUS),
    probationaryPeriod: numberOrNull(values.PROBATIONARY_PERIOD),
    noticePeriod: numberOrNull(values.NOTICE_PERIOD),
    separationDate: dateOrNull(values.SEPARATION_DATE),
    officeInTime: nullableText(values.OFFICE_IN_TIME),
    officeOutTime: nullableText(values.OFFICE_OUT_TIME),
    overtimeAllowance: yes(values.OVERTIME_ALLOWANCE),
    reportingOfficerId: numberOrNull(values.REPORTING_OFFICER_ID),
    fatherName: nullableText(values.FATHER_NAME),
    motherName: nullableText(values.MOTHER_NAME),
    spouseName: nullableText(values.SPOUSE_NAME),
    dateOfBirth: dateOrNull(values.DATE_OF_BIRTH),
    birthPlace: String(values.BIRTH_PLACE ?? '').trim(),
    gender: nullableText(values.GENDER_ID),
    maritalStatus: nullableText(values.MARITAL_STATUS),
    dateOfMarriage: dateOrNull(values.DATE_OF_MARRIAGE),
    religion: nullableText(values.RELIGION_ID),
    nationalityId: numberOrNull(values.NATIONALITY_ID),
    bloodGroup: nullableText(values.BLOOD_GROUP),
    highestEducationId: numberOrNull(values.HIGHEST_EDUCATION_ID),
    height: numberOrNull(values.HEIGHT_ID),
    weight: numberOrNull(values.WEIGHT_ID),
    nid: nullableText(values.NID),
    passportNo: nullableText(values.PASSPORT_NO),
    drivingLicenseNo: nullableText(values.DRIVING_LICENSE_NO),
    noOfChild: intOrZero(values.NO_OF_CHILD),
    maleChild: intOrZero(values.MALE_CHILD),
    femaleChild: intOrZero(values.FEMALE_CHILD),
    presentAddress: nullableText(values.PRESENT_ADDRESS),
    permanentAddress: nullableText(values.PERMANENT_ADDRESS),
    district: nullableText(values.DISTRICT),
    thana: nullableText(values.THANA),
    officeMobileNo: nullableText(values.OFFICE_MOBILE_NO),
    personalMobileNo: nullableText(values.PERSONAL_MOBILE_NO),
    whatsappNo: nullableText(values.WHATSAPP_NO),
    emergencyContact: nullableText(values.EMERGENCY_MOBILE_NO),
    officeEmail: nullableText(values.OFFICE_EMAIL),
    personalEmail: nullableText(values.EMAIL),
    disabilityStatus: yes(values.DISABILITY_STATUS) ? 1 : 0,
    disabilityTypeId: yes(values.DISABILITY_STATUS) ? numberOrNull(values.DISABILITY_TYPES) : null,
    disabilityDetails: yes(values.DISABILITY_STATUS) ? nullableText(values.DISABILITY_DETAILS) : null,
    hasNationalDisabilityId: yes(values.HAS_NATIONAL_DISABILITY_ID) ? 1 : 0,
    nationalDisabilityId: yes(values.HAS_NATIONAL_DISABILITY_ID) ? nullableText(values.NATIONAL_DISABILITY_ID) : null,
    status: Number(values.STATUS ?? 1),
  }
}

export const mapEducationFromApi = (record = {}) => ({
  ...createEducationRow(), ID: text(record.id), STATUS: text(record.status ?? 1),
  EDUCATION_LEVEL_ID: text(record.levelOfEduId), DEGREE_TITLE_ID: text(record.degreeId),
  MAJOR_GROUP: record.majorGroup ?? '', INSTITUTE_NAME: record.instituteName ?? '',
  RESULT: record.result ?? '', CGPA_MARKS: text(record.cgpaMarks), SCALE_MARKS: text(record.scaleMarks),
  YEAR_OF_PASSING: text(record.yearOfPassing), DURATION: text(record.duration),
})

export const mapTrainingFromApi = (record = {}) => ({
  ...createTrainingRow(), ID: text(record.id), STATUS: text(record.status ?? 1),
  TRAINING_TITLE: record.trainingTitle ?? '', COUNTRY_ID: text(record.countryId),
  TOPICS_COVERED: record.topicsCovered ?? '', TRAINING_YEAR: text(record.trainingYear),
  INSTITUTE_NAME: record.instituteName ?? '', DURATION: text(record.duration), LOCATION: record.location ?? '',
})

export const mapCertificationFromApi = (record = {}) => ({
  ...createCertificationRow(), ID: text(record.id), STATUS: text(record.status ?? 1),
  CERTIFICATION: record.certification ?? '', INSTITUTE_NAME: record.instituteName ?? '',
  LOCATION: record.location ?? '', DURATION: '', _API_DURATION: numberOrNull(record.duration),
})

export const mapJobExperienceFromApi = (record = {}) => ({
  ...createJobExperienceRow(), ID: text(record.id), STATUS: text(record.status ?? 1),
  COMPANY_NAME: record.companyName ?? '', COMPANY_BUSINESS: record.companyBusiness ?? '',
  DESIGNATION: record.designation ?? '', DEPARTMENT: record.department ?? '',
  EMPLOYMENT_PERIOD_START_DT: record.employmentPeriodStartDt ?? '',
  EMPLOYMENT_PERIOD_END_DT: record.employmentPeriodEndDt ?? '',
  CURRENTLY_WORKING: text(record.currentlyWorking ?? 0), RESPONSIBILITIES: record.responsibilities ?? '',
})

const commonProfileFields = (row, employeeId) => ({
  ...(row.ID ? { id: Number(row.ID) } : {}), employeeId: Number(employeeId), status: Number(row.STATUS ?? 1),
})

export const mapEducationsToApi = (rows, employeeId) => rows.filter(rowHasValue).map((row) => ({
  ...commonProfileFields(row, employeeId), levelOfEduId: numberOrNull(row.EDUCATION_LEVEL_ID),
  degreeId: numberOrNull(row.DEGREE_TITLE_ID), majorGroup: nullableText(row.MAJOR_GROUP),
  instituteName: nullableText(row.INSTITUTE_NAME), result: nullableText(row.RESULT),
  cgpaMarks: numberOrNull(row.CGPA_MARKS), scaleMarks: numberOrNull(row.SCALE_MARKS),
  yearOfPassing: numberOrNull(row.YEAR_OF_PASSING), duration: numberOrNull(row.DURATION),
}))

export const mapTrainingsToApi = (rows, employeeId) => rows.filter(rowHasValue).map((row) => ({
  ...commonProfileFields(row, employeeId), trainingTitle: nullableText(row.TRAINING_TITLE),
  countryId: numberOrNull(row.COUNTRY_ID), topicsCovered: nullableText(row.TOPICS_COVERED),
  trainingYear: numberOrNull(row.TRAINING_YEAR), instituteName: nullableText(row.INSTITUTE_NAME),
  duration: numberOrNull(row.DURATION), location: nullableText(row.LOCATION),
}))

export const mapCertificationsToApi = (rows, employeeId) => rows.filter(rowHasValue).map((row) => ({
  ...commonProfileFields(row, employeeId), certification: nullableText(row.CERTIFICATION),
  instituteName: nullableText(row.INSTITUTE_NAME), location: nullableText(row.LOCATION),
  duration: dateRangeDuration(row.DURATION) ?? numberOrNull(row._API_DURATION),
}))

export const mapJobExperiencesToApi = (rows, employeeId) => rows.filter(rowHasValue).map((row) => ({
  ...commonProfileFields(row, employeeId), companyName: nullableText(row.COMPANY_NAME),
  companyBusiness: nullableText(row.COMPANY_BUSINESS), designation: nullableText(row.DESIGNATION),
  department: nullableText(row.DEPARTMENT), employmentPeriodStartDt: dateOrNull(row.EMPLOYMENT_PERIOD_START_DT),
  employmentPeriodEndDt: row.CURRENTLY_WORKING === '1' ? null : dateOrNull(row.EMPLOYMENT_PERIOD_END_DT),
  currentlyWorking: Number(row.CURRENTLY_WORKING ?? 0), responsibilities: nullableText(row.RESPONSIBILITIES),
}))

export function withProfileRows(values, { educations = [], trainings = [], certifications = [], jobExperiences = [] }) {
  return {
    ...values,
    education: educations.length ? educations.map(mapEducationFromApi) : [createEducationRow()],
    training: trainings.length ? trainings.map(mapTrainingFromApi) : [createTrainingRow()],
    certification: certifications.length ? certifications.map(mapCertificationFromApi) : [createCertificationRow()],
    jobExperience: jobExperiences.length ? jobExperiences.map(mapJobExperienceFromApi) : [createJobExperienceRow()],
  }
}
