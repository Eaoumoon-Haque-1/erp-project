/**
 * @file Create-page controller for Office Notice.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import OfficeNoticeForm from "../components/OfficeNoticeForm";
import {
  OFFICE_NOTICE_TABLE,
  createInitialOfficeNoticeValues,
  temporaryOfficeNoticeBusinessUnits,
  validateOfficeNotice,
} from "../validation/officeNoticeValidation";

const listPath = "/hris/hris-forms/office-notice";

function OfficeNoticeCreate() {
  const navigate = useNavigate();
  const businessUnitRef = useRef(null);
  const [values, setValues] = useState(createInitialOfficeNoticeValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateOfficeNotice(values);
    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate(listPath);
  };

  const handleReset = () => {
    setValues(createInitialOfficeNoticeValues());
    setErrors({});
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"Office Notice Create"}
      listTo={listPath}
      tableName={OFFICE_NOTICE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <OfficeNoticeForm
        values={values}
        errors={errors}
        businessUnits={temporaryOfficeNoticeBusinessUnits}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
      />
    </FormPage>
  );
}

export default OfficeNoticeCreate;
