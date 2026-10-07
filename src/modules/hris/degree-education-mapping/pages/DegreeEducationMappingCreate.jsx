/**
 * @file Create-page controller for Degree Education Mapping.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import DegreeEducationMappingForm from "../components/DegreeEducationMappingForm";
import {
  DEGREE_TABLE,
  initialDegreeEntryValues,
  levelOfEducationOptions,
  validateDegreeEntry,
  validateDegreeSubmission,
} from "../validation/degreeEducationMappingValidation";

const listPath = "/hris/employee-settings/degree-education-mapping";

function DegreeEducationMappingCreate() {
  const navigate = useNavigate();
  const degreeNameRef = useRef(null);
  const [levelOfEducationId, setLevelOfEducationId] = useState("");
  const [entryValues, setEntryValues] = useState(initialDegreeEntryValues);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});

  const handleLevelChange = (event) => {
    setLevelOfEducationId(event.target.value);
    setErrors((current) => ({
      ...current,
      LEVEL_OF_EDU_ID: undefined,
    }));
  };

  const handleEntryChange = (event) => {
    const { name, type, value, checked } = event.target;
    setEntryValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleAdd = () => {
    if (!levelOfEducationId) {
      setErrors((current) => ({
        ...current,
        LEVEL_OF_EDU_ID: "Level of Education is required.",
      }));
      requestAnimationFrame(() =>
        document.getElementById("LEVEL_OF_EDU_ID")?.focus(),
      );
      return;
    }

    const result = validateDegreeEntry(entryValues, rows);
    setEntryValues(result.values);
    setErrors((current) => ({ ...current, ...result.errors }));
    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    setRows((current) => [
      ...current,
      {
        ID: `${Date.now()}-${current.length}`,
        LEVEL_OF_EDU_ID: levelOfEducationId,
        LEVEL_OF_EDU_NAME:
          levelOfEducationOptions.find(
            (option) => option.value === levelOfEducationId,
          )?.label ?? "",
        ...result.values,
      },
    ]);
    setEntryValues(initialDegreeEntryValues);
    setErrors((current) => ({
      ...current,
      DEGREE_NAME: undefined,
      SHORT_NAME: undefined,
      SORT_ORDER: undefined,
      DEGREES: undefined,
    }));
    requestAnimationFrame(() => degreeNameRef.current?.focus());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateDegreeSubmission(levelOfEducationId, rows);
    setLevelOfEducationId(result.levelOfEducationId);
    setErrors((current) => ({ ...current, ...result.errors }));
    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate(listPath);
  };

  const handleReset = () => {
    setLevelOfEducationId("");
    setEntryValues(initialDegreeEntryValues);
    setRows([]);
    setErrors({});
  };

  return (
    <FormPage
      title={"Degree & Education Mapping Create"}
      listTo={listPath}
      tableName={DEGREE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <DegreeEducationMappingForm
        levelOfEducationId={levelOfEducationId}
        entryValues={entryValues}
        errors={errors}
        rows={rows}
        degreeNameRef={degreeNameRef}
        onLevelChange={handleLevelChange}
        onEntryChange={handleEntryChange}
        onAdd={handleAdd}
        onRemove={(id) =>
          setRows((current) => current.filter((row) => row.ID !== id))
        }
      />
    </FormPage>
  );
}

export default DegreeEducationMappingCreate;
