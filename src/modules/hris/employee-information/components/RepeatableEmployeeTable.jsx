/**
 * @file Feature UI component for Employee Information: RepeatableEmployeeTable.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
import EmployeeSectionCard from "./EmployeeSectionCard";
import DateInput from "../../../../components/shared/DateInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

function controlClass(error) {
  return ["erp-employee-table-control", error ? "erp-form-control-invalid" : ""]
    .filter(Boolean)
    .join(" ");
}

function formatDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateRange(value) {
  const [start, end] = String(value || "").split(" - ");
  return [parseDate(start), parseDate(end)];
}

function DateRangeControl({ column, row, inputId, error, onChange }) {
  const [startDate, endDate] = parseDateRange(row[column.key]);

  return (
    <DatePicker
      id={inputId}
      className={controlClass(error)}
      selected={startDate}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      monthsShown={2}
      maxDate={new Date(9999, 11, 31)}
      dateFormat={"dd/MM/yyyy"}
      strictParsing
      placeholderText={"DD/MM/YYYY - DD/MM/YYYY"}
      isClearable
      aria-invalid={Boolean(error)}
      onChange={(dates) => {
        const [nextStartDate, nextEndDate] = dates || [];
        onChange(
          nextStartDate
            ? `${formatDate(nextStartDate)}${nextEndDate ? ` - ${formatDate(nextEndDate)}` : ""}`
            : "",
        );
      }}
    />
  );
}

function RecordControl({ column, row, rowIndex, inputId, error, onChange }) {
  if (column.type === "checkbox") {
    return (
      <label className={"erp-table-checkbox"}>
        <input
          id={inputId}
          name={column.key}
          type={"checkbox"}
          checked={row[column.key] === "1"}
          onChange={(event) =>
            onChange(rowIndex, column.key, event.target.checked ? "1" : "0")
          }
        />
        <span>{column.checkboxLabel}</span>
      </label>
    );
  }

  if (column.type === "date-range") {
    return (
      <DateRangeControl
        column={column}
        row={row}
        inputId={inputId}
        error={error}
        onChange={(value) => onChange(rowIndex, column.key, value)}
      />
    );
  }

  if (column.type === "date") {
    return (
      <DateInput
        id={inputId}
        name={column.key}
        className={controlClass(error)}
        value={row[column.key]}
        min={typeof column.min === "function" ? column.min(row) : column.min}
        disabled={column.disabled?.(row)}
        aria-invalid={Boolean(error)}
        onChange={(event) =>
          onChange(rowIndex, column.key, event.target.value)
        }
      />
    );
  }

  if (column.options) {
    return (
      <select
        id={inputId}
        name={column.key}
        className={controlClass(error)}
        value={row[column.key]}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(rowIndex, column.key, event.target.value)}
      >
        <option value={""}>Select...</option>
        {column.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (column.textarea) {
    return (
      <textarea
        id={inputId}
        name={column.key}
        className={controlClass(error)}
        value={row[column.key]}
        maxLength={column.maxLength}
        placeholder={column.placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(rowIndex, column.key, event.target.value)}
      />
    );
  }

  return (
    <input
      id={inputId}
      name={column.key}
      type={column.digitsOnly ? "text" : column.type || "text"}
      className={controlClass(error)}
      value={row[column.key]}
      maxLength={column.maxLength}
      min={column.min}
      step={column.step}
      inputMode={column.digitsOnly ? "numeric" : undefined}
      placeholder={column.placeholder}
      disabled={column.disabled?.(row)}
      aria-invalid={Boolean(error)}
      onChange={(event) => {
        const value = column.digitsOnly
          ? event.target.value.replace(/\D/g, "")
          : event.target.value;
        onChange(rowIndex, column.key, value);
      }}
    />
  );
}

function RepeatableEmployeeTable({
  title,
  tableName,
  rows,
  errors,
  columns,
  onChange,
  onAdd,
  onRemove,
  onReorder,
  embedded = false,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDrop = (targetIndex) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const content = (
    <>
      <div className={"erp-employee-table-wrap"}>
        <table className={"erp-table erp-employee-entry-table"}>
          <thead>
            <tr>
              <th className={"erp-number-column"}>#</th>
              {columns.map((column) => (
                <th key={column.key} className={column.className || undefined}>
                  {column.label}
                  {column.required && <span className={"erp-required"}>*</span>}
                </th>
              ))}
              <th className={"erp-action-column"}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row._ROW_ID}
                className={
                  dragOverIndex === rowIndex ? "erp-table-row-drag-over" : ""
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverIndex(rowIndex);
                }}
                onDrop={() => handleDrop(rowIndex)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
              >
                <td className={"erp-number-column"} data-label={"Record"}>
                  <button
                    type={"button"}
                    className={"erp-row-drag-handle"}
                    draggable
                    aria-label={`Move ${title} row ${rowIndex + 1}`}
                    onDragStart={() => setDraggedIndex(rowIndex)}
                  >
                    ::
                  </button>
                  {rowIndex + 1}
                </td>
                {columns.map((column) => {
                  const error = errors?.[rowIndex]?.[column.key];
                  const inputId = `${tableName}-${row._ROW_ID}-${column.key}`;
                  return (
                    <td
                      key={column.key}
                      data-label={column.label}
                      className={column.className || undefined}
                    >
                      <RecordControl
                        column={column}
                        row={row}
                        rowIndex={rowIndex}
                        inputId={inputId}
                        error={error}
                        onChange={onChange}
                      />
                      {error && <p className={"erp-field-error"}>{error}</p>}
                    </td>
                  );
                })}
                <td className={"erp-action-column"} data-label={"Action"}>
                  <button
                    type={"button"}
                    className={"erp-remove-row-button"}
                    onClick={() => onRemove(rowIndex)}
                    aria-label={`Remove ${title} row ${rowIndex + 1}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type={"button"}
        className={"primary-button erp-add-row-button"}
        onClick={onAdd}
      >
        + Add More
      </button>
    </>
  );

  if (embedded) {
    return <div data-table={tableName}>{content}</div>;
  }

  return (
    <EmployeeSectionCard title={title} tableName={tableName}>
      {content}
    </EmployeeSectionCard>
  );
}

export default RepeatableEmployeeTable;
