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
  value,
  error,
  disabled = false,
  required = false,
  inputRef,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => value.includes(option.value))
        .map((option) => option.label),
    [options, value],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const toggleOption = (optionValue) => {
    const nextValue = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(name, nextValue);
  };

  return (
    <div ref={rootRef}>
      <label className={"erp-field-label"} htmlFor={id}>
        {label}
        {required && (
          <span className={"erp-required"} aria-hidden={"true"}>
            *
          </span>
        )}
      </label>
      <div className={"erp-multi-select"}>
        <button
          ref={inputRef}
          id={id}
          type={"button"}
          className={[
            "erp-form-control",
            "erp-multi-select-trigger",
            error ? "erp-form-control-invalid" : "",
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

        {value.map((selectedValue) => (
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
