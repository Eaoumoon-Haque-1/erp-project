/**
 * @file Create-page controller for Employee Attendance Config.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormPage from "../../../../components/shared/FormPage";
import EmployeeAttendanceConfigForm from "../components/EmployeeAttendanceConfigForm";
import {
  EMPLOYEE_ATTENDANCE_CONFIG_TABLE,
  createGpsConfigRow,
  createInitialEmployeeAttendanceConfigValues,
  createMachineConfigRow,
  createWifiConfigRow,
  mockEmployeeOptions,
  mockGpsOptions,
  mockWifiOptions,
  temporaryEmployeeAttendanceConfigBusinessUnits,
  validateEmployeeAttendanceConfig,
} from "../validation/employeeAttendanceConfigValidation";

const listPath = "/hris/hris-forms/employee-attendance-config";

function EmployeeAttendanceConfigCreate() {
  const navigate = useNavigate();
  const businessUnitRef = useRef(null);
  const [values, setValues] = useState(
    createInitialEmployeeAttendanceConfigValues,
  );
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("wifi");
  const [wifiRows, setWifiRows] = useState(() => [createWifiConfigRow()]);
  const [gpsRows, setGpsRows] = useState(() => [createGpsConfigRow()]);
  const [machineRows, setMachineRows] = useState(() => [
    createMachineConfigRow(),
  ]);

  const handleChange = (event) => {
    if (!event?.target) return;
    const { name, type, value, checked } = event.target;
    const nextValue =
      type === "checkbox" && typeof checked === "boolean"
        ? checked
          ? "1"
          : "0"
        : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "SHIFT_MODE"
        ? {
            SHIFT_ID:
              nextValue === "Multiple"
                ? Array.isArray(current.SHIFT_ID)
                  ? current.SHIFT_ID
                  : current.SHIFT_ID
                    ? [current.SHIFT_ID]
                    : []
                : Array.isArray(current.SHIFT_ID)
                  ? current.SHIFT_ID[0] ?? ""
                  : current.SHIFT_ID,
          }
        : {}),
      ...(name === "BU_ID"
        ? {
            EMPLOYEE_ID: "",
            EMPLOYEE_CODE: "",
            EMPLOYEE_NAME: "",
            EMPLOYEE_TYPE: "",
            DEPARTMENT_NAME: "",
            DESIGNATION_NAME: "",
          }
        : {}),
      ...(name === "WIFI_FLEXIBLE"
        ? {
            WIFI_IN_FLEXIBLE: nextValue,
            WIFI_OUT_FLEXIBLE: nextValue,
          }
        : {}),
      ...(name === "GPS_FLEXIBLE"
        ? {
            GPS_IN_FLEXIBLE: nextValue,
            GPS_OUT_FLEXIBLE: nextValue,
          }
        : {}),
      ...(name === "GPS_TRACKING" && nextValue === "0"
        ? { TRACKING_FROM_TIME: "", TRACKING_TO_TIME: "" }
        : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === "SHIFT_MODE" ? { SHIFT_ID: undefined } : {}),
    }));

    if (name === "BU_ID") {
      setWifiRows([createWifiConfigRow()]);
      setGpsRows([createGpsConfigRow()]);
      setMachineRows([createMachineConfigRow()]);
    }
  };

  const handleShiftMultiSelectChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleEmployeeChange = (event) => {
    const employee = mockEmployeeOptions.find(
      (item) => item.id === event.target.value,
    );
    setValues((current) => ({
      ...current,
      EMPLOYEE_ID: employee?.id ?? "",
      EMPLOYEE_CODE: employee?.code ?? "",
      EMPLOYEE_NAME: employee?.name ?? "",
      EMPLOYEE_TYPE: employee?.type ?? "",
      DEPARTMENT_NAME: employee?.department ?? "",
      DESIGNATION_NAME: employee?.designation ?? "",
    }));
    setErrors((current) => ({ ...current, EMPLOYEE_ID: undefined }));
  };

  const handlePermissionChange = (permission) => {
    setValues((current) => {
      const permissions = current.ATTENDANCE_PERMISSIONS.includes(permission)
        ? current.ATTENDANCE_PERMISSIONS.filter((item) => item !== permission)
        : [...current.ATTENDANCE_PERMISSIONS, permission];
      const next = { ...current, ATTENDANCE_PERMISSIONS: permissions };
      if (!permissions.includes("WiFi")) {
        next.WIFI_FLEXIBLE = "0";
        next.WIFI_IN_FLEXIBLE = "0";
        next.WIFI_OUT_FLEXIBLE = "0";
      }
      if (!permissions.includes("GPS")) {
        next.GPS_FLEXIBLE = "0";
        next.GPS_IN_FLEXIBLE = "0";
        next.GPS_OUT_FLEXIBLE = "0";
        next.GPS_TRACKING = "0";
        next.TRACKING_FROM_TIME = "";
        next.TRACKING_TO_TIME = "";
      }
      return next;
    });
    setErrors((current) => ({
      ...current,
      ATTENDANCE_PERMISSIONS: undefined,
      WIFI_ROWS: undefined,
      GPS_ROWS: undefined,
      MACHINE_ROWS: undefined,
    }));
  };

  const handleWifiSelection = (index, wifiId) => {
    const wifi = mockWifiOptions.find((item) => item.ID === wifiId);
    setWifiRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              WIFI_ID: wifi?.ID ?? "",
              MAC_ADDRESS: wifi?.MAC_ADDRESS ?? "",
              STATUS: wifi?.STATUS ?? "",
            }
          : row,
      ),
    );
    setErrors((current) => ({ ...current, WIFI_ROWS: undefined }));
  };

  const handleGpsSelection = (index, locationId) => {
    const location = mockGpsOptions.find((item) => item.ID === locationId);
    setGpsRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              LOCATION_ID: location?.ID ?? "",
              LATITUDE: location?.LATITUDE ?? "",
              LONGITUDE: location?.LONGITUDE ?? "",
              STATUS: location?.STATUS ?? "",
            }
          : row,
      ),
    );
    setErrors((current) => ({ ...current, GPS_ROWS: undefined }));
  };

  const handleMachineChange = (index, field, value) => {
    setMachineRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
    setErrors((current) => ({ ...current, MACHINE_ROWS: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateEmployeeAttendanceConfig(
      values,
      wifiRows,
      gpsRows,
      machineRows,
    );
    setValues(result.values);
    setErrors(result.errors);

    if (!result.isValid) {
      if (result.errors.WIFI_ROWS) setActiveTab("wifi");
      else if (result.errors.GPS_ROWS) setActiveTab("gps");
      else if (result.errors.MACHINE_ROWS) setActiveTab("machine");
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    navigate(listPath);
  };

  const handleReset = () => {
    setValues(createInitialEmployeeAttendanceConfigValues());
    setErrors({});
    setActiveTab("wifi");
    setWifiRows([createWifiConfigRow()]);
    setGpsRows([createGpsConfigRow()]);
    setMachineRows([createMachineConfigRow()]);
    requestAnimationFrame(() => businessUnitRef.current?.focus());
  };

  return (
    <FormPage
      title={"Employee Attendance Config Create"}
      listTo={listPath}
      tableName={EMPLOYEE_ATTENDANCE_CONFIG_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <EmployeeAttendanceConfigForm
        values={values}
        errors={errors}
        businessUnitRef={businessUnitRef}
        businessUnits={temporaryEmployeeAttendanceConfigBusinessUnits}
        wifiRows={wifiRows}
        gpsRows={gpsRows}
        machineRows={machineRows}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChange={handleChange}
        onShiftMultiSelectChange={handleShiftMultiSelectChange}
        onEmployeeChange={handleEmployeeChange}
        onPermissionChange={handlePermissionChange}
        onWifiSelection={handleWifiSelection}
        onGpsSelection={handleGpsSelection}
        onMachineChange={handleMachineChange}
        onAddWifiRow={() =>
          setWifiRows((current) => [...current, createWifiConfigRow()])
        }
        onRemoveWifiRow={(indexToRemove) =>
          setWifiRows((current) =>
            current.length === 1
              ? [createWifiConfigRow()]
              : current.filter((_, index) => index !== indexToRemove),
          )
        }
        onAddGpsRow={() =>
          setGpsRows((current) => [...current, createGpsConfigRow()])
        }
        onRemoveGpsRow={(indexToRemove) =>
          setGpsRows((current) =>
            current.length === 1
              ? [createGpsConfigRow()]
              : current.filter((_, index) => index !== indexToRemove),
          )
        }
        onAddMachineRow={() =>
          setMachineRows((current) => [...current, createMachineConfigRow()])
        }
        onRemoveMachineRow={(indexToRemove) =>
          setMachineRows((current) =>
            current.length === 1
              ? [createMachineConfigRow()]
              : current.filter((_, index) => index !== indexToRemove),
          )
        }
      />
    </FormPage>
  );
}

export default EmployeeAttendanceConfigCreate;
