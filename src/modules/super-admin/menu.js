/**
 * @file Sidebar menu configuration for Super Admin.
 * Sections: parent groups and leaf items containing visible labels, stable keys, and absolute paths.
 * Every leaf path must match the corresponding routes.jsx entry and page navigation links.
 */
export const superAdminMenu = [
  // `allowedRoles` controls frontend visibility only. Keep matching route and
  // backend authorization in place for every protected feature.
  {
    label: "SUPER ADMIN",
    key: "super-admin",
    allowedRoles: ["SUPER_ADMIN"],
    children: [
      {
        label: "Business Group",
        key: "business-group",
        path: "/super-admin/business-group",
      },
      {
        label: "Business Unit",
        key: "business-unit",
        path: "/super-admin/business-unit",
      },
      {
        label: "Menu Creation",
        key: "menu-creation",
        children: [
          {
            label: "Module",
            key: "module",
            path: "/super-admin/menu-creation/module",
          },
          {
            label: "Menu Permission",
            key: "menu-permission",
            path: "/super-admin/menu-creation/menu-permission",
          },
          {
            label: "Create Menu",
            key: "create-menu",
            path: "/super-admin/menu-creation/create-menu",
          },
        ],
      },
      {
        label: "Role Creation",
        key: "role-creation",
        children: [
          {
            label: "Create Role",
            key: "role",
            path: "/super-admin/role-creation/role",
          },
          {
            label: "Assign Role to Business Unit",
            key: "assign-role-business-unit",
            path: "/super-admin/role-creation/assign-role-business-unit",
          },
          {
            label: "Menu Assign to Role",
            key: "menu-assign-role",
            path: "/super-admin/role-creation/menu-assign-role",
          },
        ],
      },
      {
        label: "User Creation",
        key: "user-creation",
        children: [
          {
            label: "User Type",
            key: "user-type",
            path: "/super-admin/user-creation/user-type",
          },
          {
            label: "User Type Group",
            key: "user-type-group",
            path: "/super-admin/user-creation/user-type-group",
          },
          {
            label: "Create User",
            key: "user",
            path: "/super-admin/user-creation/user",
          },
          {
            label: "User Create Self Service",
            key: "user-create-self-service",
            path: "/super-admin/user-creation/user-create-self-service",
          },
        ],
      },
    ],
  },
];
