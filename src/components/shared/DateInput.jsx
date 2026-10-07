/**
 * @file Shared reusable UI/workflow component: DateInput.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatIsoDate, parseIsoDate } from "../../utils/dateFormat";

function DateInput({
  id,
  name,
  value,
  className,
  min,
  max,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder = "DD/MM/YYYY",
  onChange,
  ...accessibilityProps
}) {
  return (
    <DatePicker
      id={id}
      name={name}
      selected={parseIsoDate(value)}
      minDate={parseIsoDate(min)}
      maxDate={parseIsoDate(max) || new Date(9999, 11, 31)}
      dateFormat={"dd/MM/yyyy"}
      strictParsing
      placeholderText={placeholder}
      className={className}
      wrapperClassName={"erp-date-picker-wrapper"}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      autoComplete={"off"}
      {...accessibilityProps}
      onChange={(date) =>
        onChange?.({
          target: {
            name,
            value: formatIsoDate(date),
            type: "text",
          },
        })
      }
    />
  );
}

export default DateInput;
