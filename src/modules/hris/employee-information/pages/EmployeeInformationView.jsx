/** @file Employee View using the same read-only layout and tabs as Create/Edit. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import PageHeader from '../../../../components/shared/PageHeader'
import { getImageSource } from '../../../../utils/imageDataUrl'
import { employeeProfilesApi, employeesApi } from '../api/employeeApi'
import EmployeeField from '../components/EmployeeField'
import EmployeeInformationForm from '../components/EmployeeInformationForm'
import EmployeeSectionCard from '../components/EmployeeSectionCard'
import { mapEmployeeFromApi, withProfileRows } from '../data/employeeApiMapper'
import { loadEmployeeReferences } from '../data/employeeReferences'
import { createInitialEmployeeValues } from '../validation/employeeInformationValidation'

const basePath = '/hris/hris-forms/employee-information'

const emptyErrors = {
  fields: {}, education: [], training: [], certification: [], jobExperience: [],
}

function includeOption(options = [], value, label, extra = {}) {
  if (value == null || value === '' || options.some((option) => String(option.value) === String(value))) {
    return options
  }
  return [...options, { value: String(value), label: label || String(value), ...extra }]
}

function optionsForExistingRecord(referenceResult, values) {
  const { references, options } = referenceResult
  const byId = (records, id) => records.find((record) => String(record.id) === String(id))
  const unit = byId(references.businessUnits, values.BUSINESS_UNIT_ID)
  const department = byId(references.departments, values.DEPARTMENT_ID)
  const designation = byId(references.designations, values.DESIGNATION_ID)
  const employmentType = byId(references.employmentTypes, values.EMPLOYMENT_TYPE_ID)
  const employmentStatus = byId(references.employmentStatuses, values.EMPLOYMENT_STATUS)
  const reportingOfficer = byId(references.employees, values.REPORTING_OFFICER_ID)
  const level = byId(references.levels, values.HIGHEST_EDUCATION_ID)
  const lookupName = (id) => byId(references.lookupValues, id)?.value

  return {
    ...options,
    businessUnitOptions: includeOption(options.businessUnitOptions, values.BUSINESS_UNIT_ID, unit?.businessUnit),
    departmentOptions: includeOption(options.departmentOptions, values.DEPARTMENT_ID, department?.departmentName, {
      bgId: String(unit?.bgId ?? ''), businessUnitId: String(values.BUSINESS_UNIT_ID),
    }),
    designationOptions: includeOption(options.designationOptions, values.DESIGNATION_ID, designation?.designationName, {
      bgId: String(unit?.bgId ?? ''), businessUnitId: String(values.BUSINESS_UNIT_ID),
      departmentId: String(values.DEPARTMENT_ID),
    }),
    employmentTypeOptions: includeOption(options.employmentTypeOptions, values.EMPLOYMENT_TYPE_ID, employmentType?.typeName),
    employmentStatusOptions: includeOption(options.employmentStatusOptions, values.EMPLOYMENT_STATUS, employmentStatus?.statusName),
    reportingOfficerOptions: includeOption(options.reportingOfficerOptions, values.REPORTING_OFFICER_ID, reportingOfficer?.employeeName, {
      employeeId: reportingOfficer?.employeeCode ?? '', name: reportingOfficer?.employeeName ?? '',
      bgId: String(reportingOfficer?.bgId ?? ''),
    }),
    educationLevelOptions: includeOption(options.educationLevelOptions, values.HIGHEST_EDUCATION_ID, level?.levelOfEdu),
    genderOptions: includeOption(options.genderOptions, values.GENDER_ID, values.GENDER_ID),
    religionOptions: includeOption(options.religionOptions, values.RELIGION_ID, values.RELIGION_ID),
    nationalityOptions: includeOption(options.nationalityOptions, values.NATIONALITY_ID, lookupName(values.NATIONALITY_ID)),
    bloodGroupOptions: includeOption(options.bloodGroupOptions, values.BLOOD_GROUP, values.BLOOD_GROUP),
    disabilityTypeOptions: includeOption(options.disabilityTypeOptions, values.DISABILITY_TYPES, lookupName(values.DISABILITY_TYPES)),
  }
}

function EmployeeInformationView() {
  const { employeeId } = useParams()
  const [activeTab, setActiveTab] = useState('personal')
  const [values, setValues] = useState(createInitialEmployeeValues)
  const [referenceOptions, setReferenceOptions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      employeesApi.get(employeeId), employeeProfilesApi.getEducations(employeeId),
      employeeProfilesApi.getTrainings(employeeId), employeeProfilesApi.getCertifications(employeeId),
      employeeProfilesApi.getJobExperiences(employeeId), loadEmployeeReferences(),
    ])
      .then(([record, educations, trainings, certifications, jobExperiences, referenceResult]) => {
        if (!active) return
        const mapped = withProfileRows(mapEmployeeFromApi(record), {
          educations, trainings, certifications, jobExperiences,
        })
        setValues(mapped)
        setReferenceOptions(optionsForExistingRecord(referenceResult, mapped))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Employee Information.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [employeeId])

  return (
    <div className={'erp-list-page erp-employee-page'}>
      <PageHeader title={'Employee Information View'} actionLabel={'List'} actionTo={basePath}
        actions={[{ label: 'Edit', to: `${basePath}/${employeeId}/edit` }]} />

      {loading ? <p className={'erp-empty-state'}>Loading Employee Information...</p> : <>
        <EmployeeInformationForm values={values} errors={emptyErrors} activeTab={activeTab}
          previewUrl={getImageSource(values.PHOTO)} onTabChange={setActiveTab}
          referenceOptions={referenceOptions} readOnly />

        <EmployeeSectionCard title={'Audit Information'}>
          <div className={'erp-form-grid erp-employee-form-grid'}>
            <EmployeeField name={'CREATED_BY'} label={'Created By'} value={values.CREATED_BY} readOnly />
            <EmployeeField name={'CREATED_AT'} label={'Created At'} value={values.CREATED_AT} readOnly />
            <EmployeeField name={'UPDATED_BY'} label={'Updated By'} value={values.UPDATED_BY} readOnly />
            <EmployeeField name={'UPDATED_AT'} label={'Updated At'} value={values.UPDATED_AT} readOnly />
          </div>
        </EmployeeSectionCard>
      </>}
    </div>
  )
}

export default EmployeeInformationView
