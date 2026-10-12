/**
 * @file Route registry for HRIS.
 * Sections: page imports and relative path-to-component mappings grouped by sidebar section.
 * Keep paths synchronized with menu.js and all List/New/Edit navigation links.
 */
import DepartmentList from "./department/pages/DepartmentList";
import DepartmentCreate from "./department/pages/DepartmentCreate";
import DepartmentEdit from "./department/pages/DepartmentEdit";
import DesignationList from "./designation/pages/DesignationList";
import DesignationCreate from "./designation/pages/DesignationCreate";
import DesignationEdit from "./designation/pages/DesignationEdit";
import DesignationDepartmentMappingList from "./designation-department-mapping/pages/DesignationDepartmentMappingList";
import DesignationDepartmentMappingCreate from "./designation-department-mapping/pages/DesignationDepartmentMappingCreate";
import EmploymentTypeList from "./employment-type/pages/EmploymentTypeList";
import EmploymentTypeCreate from "./employment-type/pages/EmploymentTypeCreate";
import EmploymentStatusList from "./employment-status/pages/EmploymentStatusList";
import EmploymentStatusCreate from "./employment-status/pages/EmploymentStatusCreate";
import DegreeEducationMappingList from "./degree-education-mapping/pages/DegreeEducationMappingList";
import DegreeEducationMappingCreate from "./degree-education-mapping/pages/DegreeEducationMappingCreate";
import LevelOfEducationList from "./level-of-education/pages/LevelOfEducationList";
import LevelOfEducationCreate from "./level-of-education/pages/LevelOfEducationCreate";
import LeaveTypeList from "./leave-type/pages/LeaveTypeList";
import LeaveTypeCreate from "./leave-type/pages/LeaveTypeCreate";
import LeaveTypeAssignList from "./leave-type-assign/pages/LeaveTypeAssignList";
import LeaveTypeAssignCreate from "./leave-type-assign/pages/LeaveTypeAssignCreate";
import LeaveAllocationList from "../super-admin/leave-allocation/pages/LeaveAllocationList";
import LeaveAllocationCreate from "../super-admin/leave-allocation/pages/LeaveAllocationCreate";
import EmployeeInformationList from "./employee-information/pages/EmployeeInformationList";
import EmployeeInformationCreate from "./employee-information/pages/EmployeeInformationCreate";
import UserCreationFromEmployeeCreate from "./user-creation-from-employee/pages/UserCreationFromEmployeeCreate";
import HrLookupTypeList from "./hr-lookup-type/pages/HrLookupTypeList";
import HrLookupTypeCreate from "./hr-lookup-type/pages/HrLookupTypeCreate";
import HrLookupTypeEdit from "./hr-lookup-type/pages/HrLookupTypeEdit";
import HrLookupTypeView from "./hr-lookup-type/pages/HrLookupTypeView";
import HrLookupValueList from "./hr-lookup-value/pages/HrLookupValueList";
import HrLookupValueCreate from "./hr-lookup-value/pages/HrLookupValueCreate";
import LeaveApplicationList from "./leave-application/pages/LeaveApplicationList";
import LeaveApplicationCreate from "./leave-application/pages/LeaveApplicationCreate";
import EmployeeAttendanceConfigList from "./employee-attendance-config/pages/EmployeeAttendanceConfigList";
import EmployeeAttendanceConfigCreate from "./employee-attendance-config/pages/EmployeeAttendanceConfigCreate";
import ShiftList from "./shift/pages/ShiftList";
import ShiftCreate from "./shift/pages/ShiftCreate";
// import AssignEmplBuUserList from "./assign-empl-bu-user/pages/AssignEmplBuUserList";
// import AssignEmplBuUserCreate from "./assign-empl-bu-user/pages/AssignEmplBuUserCreate";
import WifiInformationList from "./wifi-information/pages/WifiInformationList";
import WifiInformationCreate from "./wifi-information/pages/WifiInformationCreate";
import GpsInformationList from "./gps-information/pages/GpsInformationList";
import GpsInformationCreate from "./gps-information/pages/GpsInformationCreate";
import MobileNotificationList from "./mobile-notification/pages/MobileNotificationList";
import MobileNotificationCreate from "./mobile-notification/pages/MobileNotificationCreate";
import OfficeNoticeList from "./office-notice/pages/OfficeNoticeList";
import OfficeNoticeCreate from "./office-notice/pages/OfficeNoticeCreate";
import ManualAttendanceUpdateList from "./manual-attendance-update/pages/ManualAttendanceUpdateList";
import ManualAttendanceUpdateCreate from "./manual-attendance-update/pages/ManualAttendanceUpdateCreate";
import OfficeCalendarList from "./office-calendar/pages/OfficeCalendarList";
import OfficeCalendarCreate from "./office-calendar/pages/OfficeCalendarCreate";

/**
 * HRIS route registry. Paths here are relative (no leading slash); menu and
 * page navigation links use the same path with a leading slash.
 * Keep each feature beside the sidebar group that owns it.
 */
export const hrisRoutes = [
  // Employee Settings
  {
    path: "hris/employee-settings/department",
    element: <DepartmentList />,
  },
  {
    path: "hris/employee-settings/department/create",
    element: <DepartmentCreate />,
  },
  {
    path: "hris/employee-settings/department/:departmentId/edit",
    element: <DepartmentEdit />,
  },
  {
    path: "hris/employee-settings/designation",
    element: <DesignationList />,
  },
  {
    path: "hris/employee-settings/designation/create",
    element: <DesignationCreate />,
  },
  {
    path: "hris/employee-settings/designation/:designationId/edit",
    element: <DesignationEdit />,
  },
  {
    path: "hris/employee-settings/designation-department-mapping",
    element: <DesignationDepartmentMappingList />,
  },
  {
    path: "hris/employee-settings/designation-department-mapping/create",
    element: <DesignationDepartmentMappingCreate />,
  },
  {
    path: "hris/employee-settings/employment-type",
    element: <EmploymentTypeList />,
  },
  {
    path: "hris/employee-settings/employment-type/create",
    element: <EmploymentTypeCreate />,
  },
  {
    path: "hris/employee-settings/employment-status",
    element: <EmploymentStatusList />,
  },
  {
    path: "hris/employee-settings/employment-status/create",
    element: <EmploymentStatusCreate />,
  },
  {
    path: "hris/employee-settings/degree-education-mapping",
    element: <DegreeEducationMappingList />,
  },
  {
    path: "hris/employee-settings/degree-education-mapping/create",
    element: <DegreeEducationMappingCreate />,
  },
  {
    path: "hris/employee-settings/level-of-education",
    element: <LevelOfEducationList />,
  },
  {
    path: "hris/employee-settings/level-of-education/create",
    element: <LevelOfEducationCreate />,
  },
  // {
  //   path: "hris/employee-settings/payscale",
  //   element: <PayscaleList />,
  // },
  // {
  //   path: "hris/employee-settings/payscale/create",
  //   element: <PayscaleCreate />,
  // },
  // {
  //   path: "hris/employee-settings/assign-empl-bu-user",
  //   element: <AssignEmplBuUserList />,
  // },
  // {
  //   path: "hris/employee-settings/assign-empl-bu-user/create",
  //   element: <AssignEmplBuUserCreate />,
  // },

  // HR Lookup Settings
  {
    path: "hris/hr-lookup-settings/hr-lookup-type",
    element: <HrLookupTypeList />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-type/create",
    element: <HrLookupTypeCreate />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-type/:lookupTypeId/edit",
    element: <HrLookupTypeEdit />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-type/:lookupTypeId/view",
    element: <HrLookupTypeView />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-value",
    element: <HrLookupValueList />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-value/create",
    element: <HrLookupValueCreate />,
  },

  // Leave Settings
  {
    path: "hris/leave-settings/leave-type",
    element: <LeaveTypeList />,
  },
  {
    path: "hris/leave-settings/leave-type/create",
    element: <LeaveTypeCreate />,
  },
  {
    path: "hris/leave-settings/leave-type-assign",
    element: <LeaveTypeAssignList />,
  },
  {
    path: "hris/leave-settings/leave-type-assign/create",
    element: <LeaveTypeAssignCreate />,
  },
  {
    path: "hris/leave-settings/leave-allocation",
    element: <LeaveAllocationList />,
  },
  {
    path: "hris/leave-settings/leave-allocation/create",
    element: <LeaveAllocationCreate />,
  },

  // Attendance Settings
  {
    path: "hris/attendance-settings/wifi-information",
    element: <WifiInformationList />,
  },
  {
    path: "hris/attendance-settings/wifi-information/create",
    element: <WifiInformationCreate />,
  },
  {
    path: "hris/attendance-settings/gps-information",
    element: <GpsInformationList />,
  },
  {
    path: "hris/attendance-settings/gps-information/create",
    element: <GpsInformationCreate />,
  },
  {
    path: "hris/attendance-settings/shift",
    element: <ShiftList />,
  },
  {
    path: "hris/attendance-settings/shift/create",
    element: <ShiftCreate />,
  },
  {
    path: "hris/attendance-settings/office-calendar",
    element: <OfficeCalendarList />,
  },
  {
    path: "hris/attendance-settings/office-calendar/create",
    element: <OfficeCalendarCreate />,
  },

  // HRIS Forms
  {
    path: "hris/hris-forms/employee-information",
    element: <EmployeeInformationList />,
  },
  {
    path: "hris/hris-forms/employee-information/create",
    element: <EmployeeInformationCreate />,
  },
  {
    path: "hris/hris-forms/employee-information/:employeeId/user-creation",
    element: <UserCreationFromEmployeeCreate />,
  },
  {
    path: "hris/hris-forms/leave-application",
    element: <LeaveApplicationList />,
  },
  {
    path: "hris/hris-forms/leave-application/create",
    element: <LeaveApplicationCreate />,
  },
  {
    path: "hris/hris-forms/employee-attendance-config",
    element: <EmployeeAttendanceConfigList />,
  },
  {
    path: "hris/hris-forms/employee-attendance-config/create",
    element: <EmployeeAttendanceConfigCreate />,
  },
  {
    path: "hris/hris-forms/mobile-notification",
    element: <MobileNotificationList />,
  },
  {
    path: "hris/hris-forms/mobile-notification/create",
    element: <MobileNotificationCreate />,
  },
  {
    path: "hris/hris-forms/office-notice",
    element: <OfficeNoticeList />,
  },
  {
    path: "hris/hris-forms/office-notice/create",
    element: <OfficeNoticeCreate />,
  },
  {
    path: "hris/hris-forms/manual-attendance-update",
    element: <ManualAttendanceUpdateList />,
  },
  {
    path: "hris/hris-forms/manual-attendance-update/create",
    element: <ManualAttendanceUpdateCreate />,
  },
];
