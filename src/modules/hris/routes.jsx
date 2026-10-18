/**
 * @file Route registry for HRIS.
 * Sections: page imports and relative path-to-component mappings grouped by sidebar section.
 * Keep paths synchronized with menu.js and all List/New/Edit navigation links.
 */
import DepartmentList from "./department/pages/DepartmentList";
import DepartmentCreate from "./department/pages/DepartmentCreate";
import DepartmentEdit from "./department/pages/DepartmentEdit";
import DepartmentView from "./department/pages/DepartmentView";
import DesignationList from "./designation/pages/DesignationList";
import DesignationCreate from "./designation/pages/DesignationCreate";
import DesignationEdit from "./designation/pages/DesignationEdit";
import DesignationView from "./designation/pages/DesignationView";
import DesignationDepartmentMappingList from "./designation-department-mapping/pages/DesignationDepartmentMappingList";
import DesignationDepartmentMappingCreate from "./designation-department-mapping/pages/DesignationDepartmentMappingCreate";
import DesignationDepartmentMappingEdit from "./designation-department-mapping/pages/DesignationDepartmentMappingEdit";
import DesignationDepartmentMappingView from "./designation-department-mapping/pages/DesignationDepartmentMappingView";
import EmploymentTypeList from "./employment-type/pages/EmploymentTypeList";
import EmploymentTypeCreate from "./employment-type/pages/EmploymentTypeCreate";
import EmploymentTypeEdit from "./employment-type/pages/EmploymentTypeEdit";
import EmploymentTypeView from "./employment-type/pages/EmploymentTypeView";
import EmploymentStatusList from "./employment-status/pages/EmploymentStatusList";
import EmploymentStatusCreate from "./employment-status/pages/EmploymentStatusCreate";
import DegreeEducationMappingList from "./degree-education-mapping/pages/DegreeEducationMappingList";
import DegreeEducationMappingCreate from "./degree-education-mapping/pages/DegreeEducationMappingCreate";
import DegreeEducationMappingEdit from "./degree-education-mapping/pages/DegreeEducationMappingEdit";
import DegreeEducationMappingView from "./degree-education-mapping/pages/DegreeEducationMappingView";
import LevelOfEducationList from "./level-of-education/pages/LevelOfEducationList";
import LevelOfEducationCreate from "./level-of-education/pages/LevelOfEducationCreate";
import LevelOfEducationEdit from "./level-of-education/pages/LevelOfEducationEdit";
import LevelOfEducationView from "./level-of-education/pages/LevelOfEducationView";
import LeaveTypeList from "./leave-type/pages/LeaveTypeList";
import LeaveTypeCreate from "./leave-type/pages/LeaveTypeCreate";
import LeaveTypeEdit from "./leave-type/pages/LeaveTypeEdit";
import LeaveTypeView from "./leave-type/pages/LeaveTypeView";
import LeaveTypeAssignList from "./leave-type-assign/pages/LeaveTypeAssignList";
import LeaveTypeAssignCreate from "./leave-type-assign/pages/LeaveTypeAssignCreate";
import LeaveTypeAssignEdit from "./leave-type-assign/pages/LeaveTypeAssignEdit";
import LeaveTypeAssignView from "./leave-type-assign/pages/LeaveTypeAssignView";
import LeaveAllocationList from "../super-admin/leave-allocation/pages/LeaveAllocationList";
import LeaveAllocationCreate from "../super-admin/leave-allocation/pages/LeaveAllocationCreate";
import LeaveAllocationEdit from "../super-admin/leave-allocation/pages/LeaveAllocationEdit";
import LeaveAllocationView from "../super-admin/leave-allocation/pages/LeaveAllocationView";
import EmployeeInformationList from "./employee-information/pages/EmployeeInformationList";
import EmployeeInformationCreate from "./employee-information/pages/EmployeeInformationCreate";
import UserCreationFromEmployeeCreate from "./user-creation-from-employee/pages/UserCreationFromEmployeeCreate";
import HrLookupTypeList from "./hr-lookup-type/pages/HrLookupTypeList";
import HrLookupTypeCreate from "./hr-lookup-type/pages/HrLookupTypeCreate";
import HrLookupTypeEdit from "./hr-lookup-type/pages/HrLookupTypeEdit";
import HrLookupTypeView from "./hr-lookup-type/pages/HrLookupTypeView";
import HrLookupValueList from "./hr-lookup-value/pages/HrLookupValueList";
import HrLookupValueCreate from "./hr-lookup-value/pages/HrLookupValueCreate";
import HrLookupValueEdit from "./hr-lookup-value/pages/HrLookupValueEdit";
import HrLookupValueView from "./hr-lookup-value/pages/HrLookupValueView";
import LeaveApplicationList from "./leave-application/pages/LeaveApplicationList";
import LeaveApplicationCreate from "./leave-application/pages/LeaveApplicationCreate";
import LeaveApplicationEdit from "./leave-application/pages/LeaveApplicationEdit";
import LeaveApplicationView from "./leave-application/pages/LeaveApplicationView";
import EmployeeAttendanceConfigList from "./employee-attendance-config/pages/EmployeeAttendanceConfigList";
import EmployeeAttendanceConfigCreate from "./employee-attendance-config/pages/EmployeeAttendanceConfigCreate";
import ShiftList from "./shift/pages/ShiftList";
import ShiftCreate from "./shift/pages/ShiftCreate";
import ShiftEdit from "./shift/pages/ShiftEdit";
import ShiftView from "./shift/pages/ShiftView";
// import AssignEmplBuUserList from "./assign-empl-bu-user/pages/AssignEmplBuUserList";
// import AssignEmplBuUserCreate from "./assign-empl-bu-user/pages/AssignEmplBuUserCreate";
import WifiInformationList from "./wifi-information/pages/WifiInformationList";
import WifiInformationCreate from "./wifi-information/pages/WifiInformationCreate";
import WifiInformationEdit from "./wifi-information/pages/WifiInformationEdit";
import WifiInformationView from "./wifi-information/pages/WifiInformationView";
import GpsInformationList from "./gps-information/pages/GpsInformationList";
import GpsInformationCreate from "./gps-information/pages/GpsInformationCreate";
import GpsInformationEdit from "./gps-information/pages/GpsInformationEdit";
import GpsInformationView from "./gps-information/pages/GpsInformationView";
import MobileNotificationList from "./mobile-notification/pages/MobileNotificationList";
import MobileNotificationCreate from "./mobile-notification/pages/MobileNotificationCreate";
import MobileNotificationEdit from "./mobile-notification/pages/MobileNotificationEdit";
import MobileNotificationView from "./mobile-notification/pages/MobileNotificationView";
import OfficeNoticeList from "./office-notice/pages/OfficeNoticeList";
import OfficeNoticeCreate from "./office-notice/pages/OfficeNoticeCreate";
import OfficeNoticeEdit from "./office-notice/pages/OfficeNoticeEdit";
import OfficeNoticeView from "./office-notice/pages/OfficeNoticeView";
import ManualAttendanceUpdateList from "./manual-attendance-update/pages/ManualAttendanceUpdateList";
import ManualAttendanceUpdateCreate from "./manual-attendance-update/pages/ManualAttendanceUpdateCreate";
import OfficeCalendarList from "./office-calendar/pages/OfficeCalendarList";
import OfficeCalendarCreate from "./office-calendar/pages/OfficeCalendarCreate";
import OfficeCalendarEdit from "./office-calendar/pages/OfficeCalendarEdit";
import OfficeCalendarView from "./office-calendar/pages/OfficeCalendarView";

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
    path: "hris/employee-settings/department/:departmentId/view",
    element: <DepartmentView />,
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
    path: "hris/employee-settings/designation/:designationId/view",
    element: <DesignationView />,
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
    path: "hris/employee-settings/designation-department-mapping/:mappingId/edit",
    element: <DesignationDepartmentMappingEdit />,
  },
  {
    path: "hris/employee-settings/designation-department-mapping/:mappingId/view",
    element: <DesignationDepartmentMappingView />,
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
    path: "hris/employee-settings/employment-type/:employmentTypeId/edit",
    element: <EmploymentTypeEdit />,
  },
  {
    path: "hris/employee-settings/employment-type/:employmentTypeId/view",
    element: <EmploymentTypeView />,
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
    path: "hris/employee-settings/degree-education-mapping/:degreeId/edit",
    element: <DegreeEducationMappingEdit />,
  },
  {
    path: "hris/employee-settings/degree-education-mapping/:degreeId/view",
    element: <DegreeEducationMappingView />,
  },
  {
    path: "hris/employee-settings/level-of-education",
    element: <LevelOfEducationList />,
  },
  {
    path: "hris/employee-settings/level-of-education/create",
    element: <LevelOfEducationCreate />,
  },
  {
    path: "hris/employee-settings/level-of-education/:levelOfEducationId/edit",
    element: <LevelOfEducationEdit />,
  },
  {
    path: "hris/employee-settings/level-of-education/:levelOfEducationId/view",
    element: <LevelOfEducationView />,
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
  {
    path: "hris/hr-lookup-settings/hr-lookup-value/:lookupValueId/edit",
    element: <HrLookupValueEdit />,
  },
  {
    path: "hris/hr-lookup-settings/hr-lookup-value/:lookupValueId/view",
    element: <HrLookupValueView />,
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
    path: "hris/leave-settings/leave-type/:leaveTypeId/edit",
    element: <LeaveTypeEdit />,
  },
  {
    path: "hris/leave-settings/leave-type/:leaveTypeId/view",
    element: <LeaveTypeView />,
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
    path: "hris/leave-settings/leave-type-assign/:assignmentId/edit",
    element: <LeaveTypeAssignEdit />,
  },
  {
    path: "hris/leave-settings/leave-type-assign/:assignmentId/view",
    element: <LeaveTypeAssignView />,
  },
  {
    path: "hris/leave-settings/leave-allocation",
    element: <LeaveAllocationList />,
  },
  {
    path: "hris/leave-settings/leave-allocation/create",
    element: <LeaveAllocationCreate />,
  },
  {
    path: "hris/leave-settings/leave-allocation/:leaveAllocationId/edit",
    element: <LeaveAllocationEdit />,
  },
  {
    path: "hris/leave-settings/leave-allocation/:leaveAllocationId/view",
    element: <LeaveAllocationView />,
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
    path: "hris/attendance-settings/wifi-information/:wifiInformationId/edit",
    element: <WifiInformationEdit />,
  },
  {
    path: "hris/attendance-settings/wifi-information/:wifiInformationId/view",
    element: <WifiInformationView />,
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
    path: "hris/attendance-settings/gps-information/:gpsInformationId/edit",
    element: <GpsInformationEdit />,
  },
  {
    path: "hris/attendance-settings/gps-information/:gpsInformationId/view",
    element: <GpsInformationView />,
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
    path: "hris/attendance-settings/shift/:shiftId/edit",
    element: <ShiftEdit />,
  },
  {
    path: "hris/attendance-settings/shift/:shiftId/view",
    element: <ShiftView />,
  },
  {
    path: "hris/attendance-settings/office-calendar",
    element: <OfficeCalendarList />,
  },
  {
    path: "hris/attendance-settings/office-calendar/create",
    element: <OfficeCalendarCreate />,
  },
  {
    path: "hris/attendance-settings/office-calendar/:officeCalendarId/edit",
    element: <OfficeCalendarEdit />,
  },
  {
    path: "hris/attendance-settings/office-calendar/:officeCalendarId/view",
    element: <OfficeCalendarView />,
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
    path: "hris/hris-forms/leave-application/:leaveApplicationId/edit",
    element: <LeaveApplicationEdit />,
  },
  {
    path: "hris/hris-forms/leave-application/:leaveApplicationId/view",
    element: <LeaveApplicationView />,
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
    path: "hris/hris-forms/mobile-notification/:mobileNotificationId/edit",
    element: <MobileNotificationEdit />,
  },
  {
    path: "hris/hris-forms/mobile-notification/:mobileNotificationId/view",
    element: <MobileNotificationView />,
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
    path: "hris/hris-forms/office-notice/:officeNoticeId/edit",
    element: <OfficeNoticeEdit />,
  },
  {
    path: "hris/hris-forms/office-notice/:officeNoticeId/view",
    element: <OfficeNoticeView />,
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
