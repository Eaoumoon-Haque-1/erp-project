/**
 * @file Sidebar menu configuration for HRIS.
 * Sections: parent groups and leaf items containing visible labels, stable keys, and absolute paths.
 * Every leaf path must match the corresponding routes.jsx entry and page navigation links.
 */
export const hrisMenu = [
  // A leaf path must match routes.jsx with a leading slash. Keys must be
  // stable and unique among siblings because the sidebar accordion uses them.
  {
    label: "HRIS",
    key: "hris",
    children: [
      {
        label: "Employee Settings",
        key: "employee-settings",
        children: [
          {
            label: "Department",
            key: "department",
            path: "/hris/employee-settings/department",
          },
          {
            label: "Designation",
            key: "designation",
            path: "/hris/employee-settings/designation",
          },
          {
            label: "Designation Department Mapping",
            key: "designation-department-mapping",
            path: "/hris/employee-settings/designation-department-mapping",
          },
          {
            label: "Employment Type",
            key: "employment-type",
            path: "/hris/employee-settings/employment-type",
          },
          {
            label: "Employment Status",
            key: "employment-status",
            path: "/hris/employee-settings/employment-status",
          },
          {
            label: "Degree & Education Mapping",
            key: "degree-education-mapping",
            path: "/hris/employee-settings/degree-education-mapping",
          },
          {
            label: "Level of Education",
            key: "level-of-education",
            path: "/hris/employee-settings/level-of-education",
          },
          // {
          //   label: "Assign Empl and BU to User",
          //   key: "assign-empl-bu-user",
          //   path: "/hris/employee-settings/assign-empl-bu-user",
          // },
          // {
          //   label: "Pay Scale",
          //   key: "payscale",
          //   path: "/hris/employee-settings/payscale",
          // },
        ],
      },
      {
        label: "HR Lookup Settings",
        key: "hr-lookup-settings",
        children: [
          {
            label: "HR Lookup Type",
            key: "hr-lookup-type",
            path: "/hris/hr-lookup-settings/hr-lookup-type",
          },
          {
            label: "HR Lookup Value",
            key: "hr-lookup-value",
            path: "/hris/hr-lookup-settings/hr-lookup-value",
          },
        ],
      },
      {
        label: "Leave Settings",
        key: "leave-settings",
        children: [
          {
            label: "Leave Type",
            key: "leave-type",
            path: "/hris/leave-settings/leave-type",
          },
          {
            label: "Leave Type Assign",
            key: "leave-type-assign",
            path: "/hris/leave-settings/leave-type-assign",
          },
          {
            label: "Leave Allocation",
            key: "leave-allocation",
            path: "/hris/leave-settings/leave-allocation",
          },
        ],
      },
      {
        label: "Attendance Settings",
        key: "attendance-settings",
        children: [
          {
            label: "WiFi Information",
            key: "wifi-information",
            path: "/hris/attendance-settings/wifi-information",
          },
          {
            label: "GPS Information",
            key: "gps-information",
            path: "/hris/attendance-settings/gps-information",
          },
          {
            label: "Shift",
            key: "shift",
            path: "/hris/attendance-settings/shift",
          },
          {
            label: "Office Calendar",
            key: "office-calendar",
            path: "/hris/attendance-settings/office-calendar",
          },
        ],
      },
      {
        label: "HRIS Forms",
        key: "hris-forms",
        children: [
          {
            label: "Employee Information",
            key: "employee-information",
            path: "/hris/hris-forms/employee-information",
          },
          {
            label: "Leave Application",
            key: "leave-application",
            path: "/hris/hris-forms/leave-application",
          },
          {
            label: "Employee Attendance Config",
            key: "employee-attendance-config",
            path: "/hris/hris-forms/employee-attendance-config",
          },
          {
            label: "Mobile Notification",
            key: "mobile-notification",
            path: "/hris/hris-forms/mobile-notification",
          },
          {
            label: "Office Notice",
            key: "office-notice",
            path: "/hris/hris-forms/office-notice",
          },
          {
            label: "Manual Attendance Update",
            key: "manual-attendance-update",
            path: "/hris/hris-forms/manual-attendance-update",
          },
        ],
      },
    ],
  },
];
