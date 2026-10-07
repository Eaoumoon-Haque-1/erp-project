/**
 * @file Create-page controller for WiFi Information.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import WifiInformationForm from "../components/WifiInformationForm";
import {
  WIFI_INFORMATION_TABLE,
  initialWifiInformationValues,
  temporaryWifiInformationBusinessUnits,
  validateWifiInformation,
} from "../validation/wifiInformationValidation";

function WifiInformationCreate() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialWifiInformationValues);
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
    const result = validateWifiInformation(values);

    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate("/hris/attendance-settings/wifi-information");
  };

  const handleReset = () => {
    setValues(initialWifiInformationValues);
    setErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"WiFi Information Create"}
      listTo={"/hris/attendance-settings/wifi-information"}
      tableName={WIFI_INFORMATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <WifiInformationForm
        values={values}
        errors={errors}
        businessUnits={temporaryWifiInformationBusinessUnits}
        onChange={handleChange}
        businessUnitRef={businessUnitRef}
      />
    </FormPage>
  );
}

export default WifiInformationCreate;
