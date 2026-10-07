/**
 * @file Create-page controller for GPS Information.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import GpsInformationForm from "../components/GpsInformationForm";
import {
  GPS_INFO_TABLE,
  initialGpsInformationValues,
  temporaryGpsInformationBusinessUnits,
  validateGpsInformation,
} from "../validation/gpsInformationValidation";

function GpsInformationCreate() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialGpsInformationValues);
  const [errors, setErrors] = useState({});
  const businessUnitRef = useRef(null);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;

    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateGpsInformation(values);

    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate("/hris/attendance-settings/gps-information");
  };

  const handleReset = () => {
    setValues(initialGpsInformationValues);
    setErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"GPS Information Create"}
      listTo={"/hris/attendance-settings/gps-information"}
      tableName={GPS_INFO_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <GpsInformationForm
        values={values}
        errors={errors}
        businessUnits={temporaryGpsInformationBusinessUnits}
        onChange={handleChange}
        businessUnitRef={businessUnitRef}
      />
    </FormPage>
  );
}

export default GpsInformationCreate;
