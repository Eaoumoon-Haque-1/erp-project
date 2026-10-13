/**
 * @file Route registry for Super Admin.
 * Sections: page imports and relative path-to-component mappings grouped by sidebar section.
 * Keep paths synchronized with menu.js and all List/New/Edit navigation links.
 */
import { Outlet } from "react-router-dom";
import RequireRole from "../../components/auth/RequireRole";
import BusinessGroupCreate from "./business-group/pages/BusinessGroupCreate";
import BusinessGroupEdit from "./business-group/pages/BusinessGroupEdit";
import BusinessGroupList from "./business-group/pages/BusinessGroupList";
import BusinessGroupView from "./business-group/pages/BusinessGroupView";
import BusinessUnitCreate from "./business-unit/pages/BusinessUnitCreate";
import BusinessUnitEdit from "./business-unit/pages/BusinessUnitEdit";
import BusinessUnitList from "./business-unit/pages/BusinessUnitList";
import BusinessUnitView from "./business-unit/pages/BusinessUnitView";
import ModuleCreate from "./module/pages/ModuleCreate";
import ModuleEdit from "./module/pages/ModuleEdit";
import ModuleList from "./module/pages/ModuleList";
import ModuleView from "./module/pages/ModuleView";
import MenuPermissionCreate from "./menu-permission/pages/MenuPermissionCreate";
import MenuPermissionEdit from "./menu-permission/pages/MenuPermissionEdit";
import MenuPermissionList from "./menu-permission/pages/MenuPermissionList";
import MenuPermissionView from "./menu-permission/pages/MenuPermissionView";
import CreateMenuCreate from "./create-menu/pages/CreateMenuCreate";
import CreateMenuEdit from "./create-menu/pages/CreateMenuEdit";
import CreateMenuList from "./create-menu/pages/CreateMenuList";
import CreateMenuView from "./create-menu/pages/CreateMenuView";
import RoleList from "./role/pages/RoleList";
import RoleCreate from "./role/pages/RoleCreate";
import RoleEdit from "./role/pages/RoleEdit";
import RoleView from "./role/pages/RoleView";
import AssignRoleBusinessUnitList from "./assign-role-business-unit/pages/AssignRoleBusinessUnitList";
import AssignRoleBusinessUnitCreate from "./assign-role-business-unit/pages/AssignRoleBusinessUnitCreate";
import MenuAssignRoleList from "./menu-assign-role/pages/MenuAssignRoleList";
import MenuAssignRoleCreate from "./menu-assign-role/pages/MenuAssignRoleCreate";
import MenuAssignRoleView from "./menu-assign-role/pages/MenuAssignRoleView";
import UserTypeList from "./user-type/pages/UserTypeList";
import UserTypeCreate from "./user-type/pages/UserTypeCreate";
import UserTypeEdit from "./user-type/pages/UserTypeEdit";
import UserTypeView from "./user-type/pages/UserTypeView";
import UserTypeGroupList from "./user-type-group/pages/UserTypeGroupList";
import UserTypeGroupCreate from "./user-type-group/pages/UserTypeGroupCreate";
import UserTypeGroupEdit from "./user-type-group/pages/UserTypeGroupEdit";
import UserTypeGroupView from "./user-type-group/pages/UserTypeGroupView";
import UserList from "./user/pages/UserList";
import UserCreate from "./user/pages/UserCreate";
import UserEdit from "./user/pages/UserEdit";
import UserView from "./user/pages/UserView";
import UserCreateSelfServiceList from "./user-create-self-service/pages/UserCreateSelfServiceList";
import LeaveAllocationList from "./leave-allocation/pages/LeaveAllocationList";
import LeaveAllocationCreate from "./leave-allocation/pages/LeaveAllocationCreate";

/**
 * Super Admin routes are nested under one RequireRole boundary. Add protected
 * Super Admin pages inside `children`; do not rely on sidebar visibility alone.
 */
export const superAdminRoutes = [
  {
    path: "super-admin",
    element: (
      <RequireRole allowedRoles={["SUPER_ADMIN"]}>
        <Outlet />
      </RequireRole>
    ),
    children: [
      {
        path: "business-group",
        element: <BusinessGroupList />,
      },
      {
        path: "business-group/create",
        element: <BusinessGroupCreate />,
      },
      {
        path: "business-group/:businessGroupId/edit",
        element: <BusinessGroupEdit />,
      },
      {
        path: "business-group/:businessGroupId/view",
        element: <BusinessGroupView />,
      },
      {
        path: "business-unit",
        element: <BusinessUnitList />,
      },
      {
        path: "business-unit/create",
        element: <BusinessUnitCreate />,
      },
      {
        path: "business-unit/:businessUnitId/edit",
        element: <BusinessUnitEdit />,
      },
      {
        path: "business-unit/:businessUnitId/view",
        element: <BusinessUnitView />,
      },
      {
        path: "menu-creation/module",
        element: <ModuleList />,
      },
      {
        path: "menu-creation/module/create",
        element: <ModuleCreate />,
      },
      {
        path: "menu-creation/module/:moduleId/edit",
        element: <ModuleEdit />,
      },
      {
        path: "menu-creation/module/:moduleId/view",
        element: <ModuleView />,
      },
      {
        path: "menu-creation/menu-permission",
        element: <MenuPermissionList />,
      },
      {
        path: "menu-creation/menu-permission/create",
        element: <MenuPermissionCreate />,
      },
      {
        path: "menu-creation/menu-permission/:permissionId/edit",
        element: <MenuPermissionEdit />,
      },
      {
        path: "menu-creation/menu-permission/:permissionId/view",
        element: <MenuPermissionView />,
      },
      {
        path: "menu-creation/create-menu",
        element: <CreateMenuList />,
      },
      {
        path: "menu-creation/create-menu/create",
        element: <CreateMenuCreate />,
      },
      {
        path: "menu-creation/create-menu/:menuId/edit",
        element: <CreateMenuEdit />,
      },
      {
        path: "menu-creation/create-menu/:menuId/view",
        element: <CreateMenuView />,
      },
      {
        path: "role-creation/role",
        element: <RoleList />,
      },
      {
        path: "role-creation/role/create",
        element: <RoleCreate />,
      },
      {
        path: "role-creation/role/:roleId/edit",
        element: <RoleEdit />,
      },
      {
        path: "role-creation/role/:roleId/view",
        element: <RoleView />,
      },
      {
        path: "role-creation/assign-role-business-unit",
        element: <AssignRoleBusinessUnitList />,
      },
      {
        path: "role-creation/assign-role-business-unit/create",
        element: <AssignRoleBusinessUnitCreate />,
      },
      {
        path: "role-creation/menu-assign-role",
        element: <MenuAssignRoleList />,
      },
      {
        path: "role-creation/menu-assign-role/create",
        element: <MenuAssignRoleCreate />,
      },
      {
        path: "role-creation/menu-assign-role/:menuAssignmentId/view",
        element: <MenuAssignRoleView />,
      },
      {
        path: "role",
        element: <RoleList />,
      },
      {
        path: "role/create",
        element: <RoleCreate />,
      },
      {
        path: "role/:roleId/edit",
        element: <RoleEdit />,
      },
      {
        path: "user-creation/user-type",
        element: <UserTypeList />,
      },
      {
        path: "user-creation/user-type/create",
        element: <UserTypeCreate />,
      },
      {
        path: "user-creation/user-type/:userTypeId/edit",
        element: <UserTypeEdit />,
      },
      {
        path: "user-creation/user-type/:userTypeId/view",
        element: <UserTypeView />,
      },
      {
        path: "user-creation/user-type-group",
        element: <UserTypeGroupList />,
      },
      {
        path: "user-creation/user-type-group/create",
        element: <UserTypeGroupCreate />,
      },
      {
        path: "user-creation/user-type-group/:userTypeGroupId/edit",
        element: <UserTypeGroupEdit />,
      },
      {
        path: "user-creation/user-type-group/:userTypeGroupId/view",
        element: <UserTypeGroupView />,
      },
      {
        path: "user-creation/user",
        element: <UserList />,
      },
      {
        path: "user-creation/user/create",
        element: <UserCreate />,
      },
      {
        path: "user-creation/user/:userId/edit",
        element: <UserEdit />,
      },
      {
        path: "user-creation/user/:userId/view",
        element: <UserView />,
      },
      {
        path: "user-creation/user-create-self-service",
        element: <UserCreateSelfServiceList />,
      },
      // Legacy short URLs retained for compatibility. New links should use
      // the grouped menu-creation, role-creation, or user-creation paths.
      {
        path: "user-type",
        element: <UserTypeList />,
      },
      {
        path: "user-type/create",
        element: <UserTypeCreate />,
      },
      {
        path: "user-type-group",
        element: <UserTypeGroupList />,
      },
      {
        path: "user-type-group/create",
        element: <UserTypeGroupCreate />,
      },
      {
        path: "user-type-group/:userTypeGroupId/edit",
        element: <UserTypeGroupEdit />,
      },
      {
        path: "user-type-group/:userTypeGroupId/view",
        element: <UserTypeGroupView />,
      },
      {
        path: "user",
        element: <UserList />,
      },
      {
        path: "user/create",
        element: <UserCreate />,
      },
      {
        path: "leave-allocation",
        element: <LeaveAllocationList />,
      },
      {
        path: "leave-allocation/create",
        element: <LeaveAllocationCreate />,
      },
    ],
  },
];
