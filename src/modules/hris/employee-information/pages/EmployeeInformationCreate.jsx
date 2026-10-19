/**
 * @file Create-page controller for Employee Information.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Handles create/edit API calls while field markup stays in the matching form component.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage, normalizeApiError } from "../../../../api/errors";
import ActionForm from "../../../../components/shared/ActionForm";
import PageHeader from "../../../../components/shared/PageHeader";
import { getImageSource } from "../../../../utils/imageDataUrl";
import { employeeProfilesApi, employeesApi } from "../api/employeeApi";
import EmployeeInformationForm from "../components/EmployeeInformationForm";
import {
  mapCertificationsToApi,
  mapEducationsToApi,
  mapEmployeeFromApi,
  mapEmployeeToApi,
  mapJobExperiencesToApi,
  mapTrainingsToApi,
  withProfileRows,
} from "../data/employeeApiMapper";
import { loadEmployeeReferences } from "../data/employeeReferences";
import {
  EMPLOYEE_TABLE,
  createCertificationRow,
  createEducationRow,
  createInitialEmployeeValues,
  createJobExperienceRow,
  createTrainingRow,
  validateEmployeeInformation,
} from "../validation/employeeInformationValidation";

const rowFactories = {
  education: createEducationRow,
  training: createTrainingRow,
  certification: createCertificationRow,
  jobExperience: createJobExperienceRow,
};

const emptyReferenceOptions = {
  businessUnitOptions: [],
  departmentOptions: [],
  designationOptions: [],
  employmentTypeOptions: [],
  employmentStatusOptions: [],
  reportingOfficerOptions: [],
  educationLevelOptions: [],
  degreeTitleOptions: [],
  genderOptions: [],
  religionOptions: [],
  nationalityOptions: [],
  bloodGroupOptions: [],
  disabilityTypeOptions: [],
  countryOptions: [],
};

const emptyErrors = () => ({
  fields: {},
  education: [],
  training: [],
  certification: [],
  jobExperience: [],
});

const visibleEmployeeFields = new Set([
  "BUSINESS_UNIT_ID",
  "EMPLOYEE_NAME",
  "EMPLOYEE_ID",
  "PHOTO",
  "DEPARTMENT_ID",
  "DESIGNATION_ID",
  "EMPLOYMENT_TYPE_ID",
  "JOINING_DATE",
  "CONFIRMATION_DATE",
  "EMPLOYMENT_STATUS",
  "PROBATIONARY_PERIOD",
  "NOTICE_PERIOD",
  "SEPARATION_DATE",
]);

const tabFields = {
  office: [
    "SHIFT_ID",
    "OFFICE_IN_TIME",
    "OFFICE_OUT_TIME",
    "OVERTIME_ALLOWANCE",
  ],
  reporting: ["REPORTING_OFFICER_ID"],
  personal: [
    "FATHER_NAME",
    "MOTHER_NAME",
    "DATE_OF_BIRTH",
    "GENDER_ID",
    "RELIGION_ID",
    "NATIONALITY_ID",
    "BLOOD_GROUP",
    "HIGHEST_EDUCATION_ID",
    "NID",
    "PASSPORT_NO",
    "DRIVING_LICENSE_NO",
  ],
  disability: [
    "DISABILITY_STATUS",
    "DISABILITY_TYPES",
    "DISABILITY_DETAILS",
    "HAS_NATIONAL_DISABILITY_ID",
    "NATIONAL_DISABILITY_ID",
  ],
  marital: [
    "MARITAL_STATUS",
    "SPOUSE_NAME",
    "DATE_OF_MARRIAGE",
    "NO_OF_CHILD",
    "MALE_CHILD",
    "FEMALE_CHILD",
  ],
  address: [
    "PRESENT_ADDRESS",
    "PERMANENT_ADDRESS",
    "DISTRICT",
    "THANA",
    "OFFICE_MOBILE_NO",
    "PERSONAL_MOBILE_NO",
    "WHATSAPP_NO",
    "EMERGENCY_MOBILE_NO",
    "EMAIL",
    "OFFICE_EMAIL",
  ],
};

function findInvalidTab(errors) {
  const fieldNames = Object.keys(errors.fields || {});
  if (fieldNames.some((name) => visibleEmployeeFields.has(name))) return null;

  const fieldTab = Object.entries(tabFields).find(([, names]) =>
    names.some((name) => fieldNames.includes(name)),
  );
  if (fieldTab) return fieldTab[0];
  if (errors.education.some((row) => Object.keys(row).length))
    return "education";
  if (errors.training.some((row) => Object.keys(row).length)) return "training";
  if (errors.certification.some((row) => Object.keys(row).length))
    return "certification";
  if (errors.jobExperience.some((row) => Object.keys(row).length))
    return "experience";
  return null;
}

function EmployeeInformationCreate() {
  const { employeeId } = useParams();
  const isEdit = Boolean(employeeId);
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const [values, setValues] = useState(createInitialEmployeeValues);
  const [errors, setErrors] = useState(emptyErrors);
  const [activeTab, setActiveTab] = useState("personal");
  const [referenceOptions, setReferenceOptions] = useState(emptyReferenceOptions);
  const [referenceData, setReferenceData] = useState({ businessUnits: [] });
  const [originalValues, setOriginalValues] = useState(null);
  const [createdEmployeeId, setCreatedEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const previewUrl = useMemo(
    () => values.PHOTO instanceof File ? URL.createObjectURL(values.PHOTO) : getImageSource(values.PHOTO),
    [values.PHOTO],
  );

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    let active = true;
    const referenceRequest = loadEmployeeReferences();
    const recordRequest = isEdit
      ? Promise.all([
          employeesApi.get(employeeId),
          employeeProfilesApi.getEducations(employeeId),
          employeeProfilesApi.getTrainings(employeeId),
          employeeProfilesApi.getCertifications(employeeId),
          employeeProfilesApi.getJobExperiences(employeeId),
        ])
      : Promise.resolve(null);

    Promise.all([referenceRequest, recordRequest])
      .then(([referenceResult, recordResult]) => {
        if (!active) return;
        setReferenceOptions(referenceResult.options);
        setReferenceData(referenceResult.references);
        if (recordResult) {
          const [record, educations, trainings, certifications, jobExperiences] = recordResult;
          const mapped = withProfileRows(mapEmployeeFromApi(record), {
            educations, trainings, certifications, jobExperiences,
          });
          setValues(mapped);
          setOriginalValues(mapped);
        }
      })
      .catch((error) => getApiErrorMessage(error, `Unable to load ${isEdit ? "Employee Information" : "employee dropdown options"}.`));
    return () => { active = false; };
  }, [employeeId, isEdit]);

  const handleChange = (event) => {
    const { name, type, value, files } = event.target;
    const nextValue = type === "file" ? (files?.[0] ?? null) : value;
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "MALE_CHILD" || name === "FEMALE_CHILD"
        ? {
            NO_OF_CHILD: String(
              Number(name === "MALE_CHILD" ? value : current.MALE_CHILD) +
                Number(name === "FEMALE_CHILD" ? value : current.FEMALE_CHILD),
            ),
          }
        : {}),
      ...(name === "BUSINESS_UNIT_ID"
        ? { DEPARTMENT_ID: "", DESIGNATION_ID: "", REPORTING_OFFICER_ID: "" }
        : {}),
      ...(name === "MARITAL_STATUS" && value !== "Married"
        ? { SPOUSE_NAME: "", DATE_OF_MARRIAGE: "" }
        : {}),
      ...(name === "DISABILITY_STATUS" && value !== "YES"
        ? {
            DISABILITY_TYPES: "",
            DISABILITY_DETAILS: "",
            HAS_NATIONAL_DISABILITY_ID: "NO",
            NATIONAL_DISABILITY_ID: "",
          }
        : {}),
      ...(name === "HAS_NATIONAL_DISABILITY_ID" && value !== "YES"
        ? { NATIONAL_DISABILITY_ID: "" }
        : {}),
    }));
    setErrors((current) => ({
      ...current,
      fields: {
        ...current.fields,
        [name]: undefined,
        ...(name === "DISABILITY_STATUS"
          ? {
              DISABILITY_TYPES: undefined,
              DISABILITY_DETAILS: undefined,
              HAS_NATIONAL_DISABILITY_ID: undefined,
              NATIONAL_DISABILITY_ID: undefined,
            }
          : {}),
        ...(name === "HAS_NATIONAL_DISABILITY_ID"
          ? { NATIONAL_DISABILITY_ID: undefined }
          : {}),
      },
    }));
  };

  const handleRowChange = (section, index, key, value) => {
    setValues((current) => ({
      ...current,
      [section]: current[section].map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [key]: value,
              ...(key === "CURRENTLY_WORKING" && value === "1"
                ? { EMPLOYMENT_PERIOD_END_DT: "" }
                : {}),
            }
          : row,
      ),
    }));
    setErrors((current) => ({
      ...current,
      [section]: current[section].map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: undefined } : row,
      ),
    }));
  };

  const handleAddRow = (section) => {
    setValues((current) => ({
      ...current,
      [section]: [...current[section], rowFactories[section]()],
    }));
  };

  const handleRemoveRow = (section, index) => {
    setValues((current) => ({
      ...current,
      [section]:
        current[section].length === 1
          ? [rowFactories[section]()]
          : current[section].filter((_, rowIndex) => rowIndex !== index),
    }));
    setErrors((current) => ({
      ...current,
      [section]: current[section].filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleReorderRows = (section, sourceIndex, targetIndex) => {
    const moveItem = (items) => {
      const nextItems = [...items];
      const [movedItem] = nextItems.splice(sourceIndex, 1);
      nextItems.splice(targetIndex, 0, movedItem);
      return nextItems;
    };

    setValues((current) => ({
      ...current,
      [section]: moveItem(current[section]),
    }));
    setErrors((current) => ({
      ...current,
      [section]: moveItem(current[section]),
    }));
  };

  const saveProfileSections = (id, nextValues) => Promise.all([
    employeeProfilesApi.saveEducations(id, mapEducationsToApi(nextValues.education, id)),
    employeeProfilesApi.saveTrainings(id, mapTrainingsToApi(nextValues.training, id)),
    employeeProfilesApi.saveCertifications(id, mapCertificationsToApi(nextValues.certification, id)),
    employeeProfilesApi.saveJobExperiences(id, mapJobExperiencesToApi(nextValues.jobExperience, id)),
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateEmployeeInformation(values);
    setValues(result.values);
    setErrors(result.errors);
    if (!result.isValid) {
      const invalidTab = findInvalidTab(result.errors);
      if (invalidTab) setActiveTab(invalidTab);
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return false;
    }
    setSubmitting(true);
    let savedId = employeeId || createdEmployeeId;
    try {
      const payload = await mapEmployeeToApi(result.values, referenceData.businessUnits);
      if (savedId) {
        await employeesApi.update(savedId, payload);
      } else {
        const created = await employeesApi.create(payload);
        savedId = created?.id;
        if (!savedId) throw new Error("Employee was saved, but the API did not return its ID.");
        setCreatedEmployeeId(String(savedId));
      }
      await saveProfileSections(savedId, result.values);
      navigate("/hris/hris-forms/employee-information");
      return true;
    } catch (error) {
      const normalized = normalizeApiError(error, `Unable to ${isEdit || createdEmployeeId ? "update" : "create"} Employee Information.`, {
        buId: "BUSINESS_UNIT_ID", employeeName: "EMPLOYEE_NAME", employeeCode: "EMPLOYEE_ID",
        deptId: "DEPARTMENT_ID", desigId: "DESIGNATION_ID", employmentTypeId: "EMPLOYMENT_TYPE_ID",
        joiningDate: "JOINING_DATE", employmentStatusId: "EMPLOYMENT_STATUS",
        reportingOfficerId: "REPORTING_OFFICER_ID", mobileNo: "PERSONAL_MOBILE_NO", email: "EMAIL",
      });
      setErrors((current) => ({ ...current, fields: { ...current.fields, ...normalized.fieldErrors } }));
      getApiErrorMessage(error, normalized.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues(isEdit && originalValues ? originalValues : createInitialEmployeeValues());
    setErrors(emptyErrors());
    setActiveTab("personal");
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  return (
    <div className={"erp-list-page erp-employee-page"}>
      <PageHeader
        title={`Employee Information ${isEdit ? "Edit" : "Create"}`}
        actionLabel={"List"}
        actionTo={"/hris/hris-forms/employee-information"}
      />
      <ActionForm
        entityName={"Employee Information"}
        action={isEdit ? "update" : "create"}
        data-table={EMPLOYEE_TABLE}
        onSubmit={handleSubmit}
        onReset={handleReset}
        noValidate
      >
        <EmployeeInformationForm
          values={values}
          errors={errors}
          activeTab={activeTab}
          previewUrl={previewUrl}
          photoInputRef={photoInputRef}
          onChange={handleChange}
          onTabChange={setActiveTab}
          onRowChange={handleRowChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onReorderRows={handleReorderRows}
          referenceOptions={referenceOptions}
        />
        <section className={"erp-employee-card erp-employee-submit-card"}>
          <div className={"erp-form-actions"}>
            <button type={"reset"} className={"secondary-button"}>
              Reset
            </button>
            <button type={"submit"} className={"primary-button"} disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
          </div>
        </section>
      </ActionForm>
    </div>
  );
}

export default EmployeeInformationCreate;
