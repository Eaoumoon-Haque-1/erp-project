/**
 * @file Feature UI component for Employee Information: EmployeeField.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
import AutoGrowTextarea from "../../../../components/shared/AutoGrowTextarea";
import DateInput from "../../../../components/shared/DateInput";

function EmployeeField({
  name,
  label,
  value = "",
  error,
  required = false,
  options,
  type = "text",
  placeholder,
  readOnly = false,
  disabled = false,
  maxLength,
  min,
  step,
  inputMode,
  digitsOnly = false,
  textarea = false,
  rows = 1,
  textareaClass = '',
  autoGrow = true,
  onChange,
}) {
  const className = [
    "erp-form-control",
    textarea ? "erp-textarea" : "",
    textareaClass,
    readOnly || disabled ? "erp-readonly" : "",
    error ? "erp-form-control-invalid" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const describedBy = error ? `${name}-error` : undefined;
  const handleChange = (event) => {
    if (!digitsOnly) {
      onChange(event);
      return;
    }

    const digits = event.target.value.replace(/\D/g, "");
    if (digits !== event.target.value) event.target.value = digits;
    onChange(event);
  };

  return (
    <div className={"erp-employee-field"}>
      <label className={"erp-field-label"} htmlFor={name}>
        {label}
        {required && (
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        )}
      </label>
      {options ? (
        <select
          id={name}
          name={name}
          className={className}
          value={value}
          required={required}
          disabled={readOnly || disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange}
        >
          <option value={""}>{placeholder || `--Select ${label}--`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <AutoGrowTextarea
          id={name}
          name={name}
          className={className}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          rows={rows}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          autoGrow={autoGrow}
          onChange={handleChange}
        />
      ) : type === "date" ? (
        <DateInput
          id={name}
          name={name}
          className={className}
          value={value}
          placeholder={placeholder}
          min={min}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={className}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          step={step}
          inputMode={inputMode}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      )}
      {error && (
        <p id={`${name}-error`} className={"erp-field-error"}>
          {error}
        </p>
      )}
    </div>
  );
}

export default EmployeeField;
