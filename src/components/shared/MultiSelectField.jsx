/**
 * @file Shared reusable UI/workflow component: MultiSelectField.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useEffect, useMemo, useRef, useState } from "react";

function MultiSelectField({
  id,
  name,
  label,
  placeholder,
  options,
  value = [],
  error,
  disabled = false,
  required = false,
  growWithContent = false,
  inputRef,
  className = "",
  buttonClassName = "",
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => selectedValues.map(String).includes(String(option.value)))
        .map((option) => option.label),
    [options, selectedValues],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const toggleOption = (optionValue) => {
    const valStr = String(optionValue);
    const exists = selectedValues.some((item) => String(item) === valStr);
    const nextValue = exists
      ? selectedValues.filter((item) => String(item) !== valStr)
      : [...selectedValues, valStr];
    onChange?.(name, nextValue);
  };

  return (
    <div ref={rootRef} className={className}>
      {label && (
        <label className={"erp-field-label"} htmlFor={id}>
          {label}
          {required && (
            <span className={"erp-required"} aria-hidden={"true"}>
              *
            </span>
          )}
        </label>
      )}
      <div className={"erp-multi-select"}>
        <button
          ref={inputRef}
          id={id}
          type={"button"}
          className={[
            "erp-form-control",
            "erp-multi-select-trigger",
            growWithContent ? "erp-multi-select-trigger-grow" : "",
            error ? "erp-form-control-invalid" : "",
            buttonClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          aria-haspopup={"listbox"}
          aria-expanded={isOpen}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className={selectedLabels.length ? "" : "erp-select-placeholder"}>
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <span className={"erp-multi-select-arrow"} aria-hidden={"true"}>
            ▾
          </span>
        </button>

        {selectedValues.map((selectedValue) => (
          <input
            key={selectedValue}
            type={"hidden"}
            name={`${name}[]`}
            value={selectedValue}
          />
        ))}

        {isOpen && !disabled && (
          <div
            className={"erp-multi-select-menu"}
            role={"listbox"}
            aria-multiselectable={"true"}
          >
            {options.length === 0 ? (
              <p className={"erp-multi-select-empty"}>No options available</p>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className={"erp-multi-select-option"}
                >
                  <input
                    type={"checkbox"}
                    checked={value.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={"erp-field-error"}>
          {error}
        </p>
      )}
    </div>
  );
}

export default MultiSelectField;
