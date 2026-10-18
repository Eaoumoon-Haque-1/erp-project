# API-Integrated Forms and Pages

Last updated: 17 October 2026

This checklist records only pages that currently communicate with the backend API. Pages not listed here may still use temporary frontend data.

## Authentication

- [x] Login
  - Login with username and password.
  - Stores the returned access token and attaches it to API requests.
- [x] Logout
  - Calls the logout endpoint and clears the frontend session.
- [x] Real-backend-only authentication
  - All environments use `VITE_API_BASE_URL`; the temporary mock adapter and login bypass have been removed.
- [x] Automatic token refresh frontend flow
  - A `401` triggers one shared refresh request, updates the stored session, and retries the original request without duplicating concurrent refresh calls.
  - If refresh is unavailable or fails, the session is cleared normally.
  - Live Swagger's `TokenResponse` has no separate `refreshToken`, so the current compatibility flow submits the returned access token in the documented `{ refreshToken }` body. A distinct backend refresh token automatically takes priority when introduced.

## Super Admin — Business Setup

### Business Group

- [x] Business Group List — get all records
- [x] Business Group Create — create record
- [x] Business Group Edit — get one and update record
- [x] Business Group View — get one read-only record
- [x] Delete Business Group
- [x] Change Business Group status

### Business Unit

- [x] Business Unit List — get all records
- [x] Business Unit Create — create record
- [x] Business Unit Edit — get one and update record
- [x] Business Unit View — get one read-only record
- [x] Delete Business Unit
- [x] Change Business Unit status
- [x] Load Business Units by Business Group
- [x] Populate Create/Edit Group Name from active Business Group API records

The Business Unit logo is sent as a string/data URL because Swagger does not document a multipart file upload.

## Super Admin — Menu Creation

### Module

- [x] Module List — get all records
- [x] Module Create — create record
- [x] Module Edit — get one and update record
- [x] Module View — get one read-only record
- [x] Delete Module
- [x] Change Module status

### Menu Permission

- [x] Menu Permission List — get all records
- [x] Menu Permission Create — create record
- [x] Menu Permission Edit — get one and update record
- [x] Menu Permission View — get one read-only record
- [x] Delete Menu Permission
- [x] Change Menu Permission status
- [x] Load permissions by Module
- [x] Create multiple Menu Permissions in one form; rows remain temporary until Save and are posted sequentially as individual records

### Create Menu

- [x] Menu List — get all records
- [x] Menu Create — create record
- [x] Menu Edit — get one and update record
- [x] Menu View — get one read-only record
- [x] Delete Menu
- [x] Change Menu status
- [x] Load Menus by Module
- [x] Load Parent Menu and Permission options

Menu permissions are submitted in the deployed backend format: `permissionId` is a JSON-array string such as `"[1,2]"`. Menu names are checked within the selected Module, and positive fractional Sort Order values are supported.

## Super Admin — Role Creation

### Role

- [x] Role List — get all records
- [x] Role Create — create record
- [x] Role Edit — get one and update record
  - Permission `+` actions stage complete Module/Menu groups locally; the main Update action saves the Role and then submits each staged group with one `permissionIds` array.
- [x] Role View — get one with assigned permissions
- [x] Delete Role
- [x] Change Role status

### Role Permission Assignment

- [x] Load assigned permissions for a Role
- [x] Load available permissions by Role, Module, and Menu
- [x] Select and assign multiple permissions to a Role in one request
- [x] Remove permission from a Role

Role Edit, Role View, and Menu Assign to Role share `rolePermissionsApi`. Active leaf menus only (`isTopMenu = 0`, `isParent = 0`, `status = 1`) are eligible for new assignments.

These APIs are used by both Role Edit and Menu Assign to Role.
Both pages use the same staged-add rule: `+` never persists; the page Save/Update action performs the API requests.

### Menu Assign to Role

- [x] Role list with assigned-permission count
- [x] Select Role
- [x] Load Module, Menu, and Permission options
- [x] `+` stages the complete multi-selection as one Module/Menu row without calling the API
- [x] One Permission List displays existing and staged assignments; permissions are grouped by Module and Menu
- [x] Save submits each staged row using one `permissionIds` array
- [x] Remove assigned permission
- [x] View the selected Role and its assigned permissions

### Assign Role to Business Unit

- [x] Load Business Units
- [x] Load Roles
- [x] Load roles assigned to a Business Unit
- [x] Assign Role to Business Unit
- [x] Remove Role from Business Unit

## Super Admin — User Creation

### User Type

- [x] User Type List — get all records
- [x] User Type Create — create record
- [x] User Type Edit — get one and update record
- [x] User Type View — get one read-only record
- [x] Delete User Type
- [x] Change User Type status

The deployed contract persists `bgId`, `typeName`, `shortName`, `sortOrder`, and numeric `status`. Group names are resolved from the Business Group API.

### User

- [x] User List — get all records
- [x] User Create — create record
- [x] User Edit — get one and update record
- [x] User View — get one with related Group, Unit, Role, and User Type names
- [x] Delete User
- [x] Change User status
- [x] Load Business Unit, Role, and User Type dropdown options
- [x] Load active Business Groups and dependent Business Units from the API
- [x] Replace temporary Business Units in the Assign BU tab with API records
- [x] Load active Employee options from the Employee API
- [x] Save and load the single User-to-Employee assignment
- [x] Save and load multiple User-to-Business-Unit assignments

Changing Group Name clears the selected Business Unit and staged Business Unit assignments so units from a different group cannot be submitted. Email is optional, Mobile Number must be an 11-digit Bangladesh number beginning with `01`, and Edit omits Password when it is left blank.

Create saves the User first, then uses the returned User ID for the Employee and Business Unit assignment requests. Edit shows both tabs, loads both assignment DTOs with GET, and saves them after the User update. The backend contract supports one Employee and multiple Business Units per User. Employee PUT sends only `employeeId` (`null` removes it). Existing BU rows retain `id`, new rows send `id: null`, and omitted saved rows are soft-removed by the backend.

### User Create Self Service

- [ ] No API integration
  - Employee rows, Role options, and User Type options are temporary fixtures.
  - Create, Edit, Delete, and Status actions only update in-memory UI state and reset after a refresh.
  - Do not connect this screen to generic User CRUD until its dedicated workflow and Employee source are confirmed.

### User Type Group

- [x] API integration
  - User Type, Business Group, and dependent Business Unit options are API-backed.
  - The list is an assignment dashboard backed by real User Types. **New** opens the form, but Save is intentionally blocked because Swagger has no POST operation. View uses GET, Manage uses GET/PUT, and there is no standalone Delete endpoint.
  - Assignment status changes use the same bulk PUT contract; there is no separate status endpoint.
  - `GET /user-types/{userTypeId}/business-units` prefills the complete assignment set.
  - `PUT /user-types/{userTypeId}/business-units` saves all displayed rows in one request. Existing rows retain their mapping `id`, new rows send `id: null`, and omitted saved rows are soft-removed by the backend.
  - Removing and re-adding a saved row before Save restores its original ID so reactivation follows the backend contract and does not create a duplicate mapping.
  - The list reads `bgId` from User Type records; it does not hardcode a group ID. An orphaned `bgId` can make `/business-units/group/{bgId}` return `404`, so backend data integrity and frontend error tolerance both matter.

## Accounts

### Chart of Accounts

- [x] Chart of Accounts List — get all records
- [x] Chart of Accounts Create — create record
- [x] Chart of Accounts Edit — get one and update record
- [x] Chart of Account View — get one read-only record
- [x] Delete Chart of Account
- [x] Change account status
- [x] Load Parent Account options

This complete frontend module was added because the `/coa` CRUD API existed but no matching frontend pages existed.

## HRIS - HR Lookup Settings

### HR Lookup Type

- [x] HR Lookup Type List - get all records
- [x] HR Lookup Type Create - create record
- [x] HR Lookup Type Edit - get one and update record
- [x] HR Lookup Type View - get one read-only record
- [x] Delete HR Lookup Type
- [x] Change HR Lookup Type status through the documented update operation

### HR Lookup Value

- [x] HR Lookup Value List - get all records
- [x] HR Lookup Value Create - create record
- [x] HR Lookup Value Edit - get one and update record
- [x] HR Lookup Value View - get one read-only record
- [x] Delete HR Lookup Value
- [x] Change HR Lookup Value status through the documented update operation
- [x] Load Business Group and HR Lookup Type names from their APIs

## HRIS - Employee Settings

### Level of Education

- [x] Level of Education List - get all records
- [x] Level of Education Create - create record
- [x] Level of Education Edit - get one and update record
- [x] Level of Education View - get one read-only record
- [x] Delete Level of Education
- [x] Change Level of Education status through the documented update operation

### Degree & Education Mapping

- [x] Degree list — get all records and resolve Level of Education names
- [x] Degree create — stage multiple rows and POST each Degree record sequentially
- [x] Degree edit — get one and update one record
- [x] Degree view — get one read-only record
- [x] Delete Degree
- [x] Change Degree status through the documented update operation
- [x] Load Level of Education dropdown options from the API

Swagger accepts one Degree object per POST; it does not expose a bulk-create request. `levelOfEduId` is the mapping between the Degree and its Level of Education.

### Department

- [x] Department List - get all records and resolve Business Group names
- [x] Department Create - create record
- [x] Department Edit - get one and update record
- [x] Department View - get one read-only record
- [x] Delete Department
- [x] Change Department status through the documented update operation
- [x] Load Business Group dropdown options from `/business-groups`

Department master uses `/departments`. Department Group is a separate Business Unit assignment resource and is not included in the Department create/update payload.

### Designation

- [x] Designation List - get all records and resolve Business Group names
- [x] Designation Create - create record
- [x] Designation Edit - get one and update record
- [x] Designation View - get one read-only record
- [x] Delete Designation
- [x] Change Designation status through the documented update operation
- [x] Load Business Group dropdown options from `/business-groups`

Designation master uses `/designations`. Designation Group and Designation Department Mapping are separate resources and are not included in the Designation create/update payload.

### Designation Department Mapping

- [x] Mapping List - get all records and resolve Group, Business Unit, Department, and Designation names
- [x] Mapping Create - create record
- [x] Mapping Edit - get one and update record
- [x] Mapping View - get one read-only record
- [x] Delete mapping
- [x] Change mapping status through the documented update operation
- [x] Restrict Department and Designation options to assignments eligible for the selected Business Unit

The mapping resource uses `/dept-desig-maps`. Eligible dropdown records come from `/department-groups` and `/designation-groups`; master labels come from their respective APIs.

### Employment Type

- [x] Employment Type List - get all records
- [x] Employment Type Create - create record
- [x] Employment Type Edit - get one and update record
- [x] Employment Type View - get one read-only record
- [x] Delete Employment Type
- [x] Change Employment Type status through the documented update operation

The `/employment-types` schema uses `typeName`, `shortName`, `sortOrder`, and numeric `status`. The frontend permits positive decimal Sort Order values per owner instruction even though the current Swagger schema describes `sortOrder` as an integer.

## HRIS - Leave Settings

### Leave Type

- [x] Leave Type List - get all records and resolve Business Group names
- [x] Leave Type Create - create record
- [x] Leave Type Edit - get one and update record
- [x] Leave Type View - get one read-only record
- [x] Delete Leave Type
- [x] Change Leave Type status through the documented update operation
- [x] Load Business Group dropdown options from `/business-groups`

Leave Type uses `/leave-types` with optional `bgId` filtering. The frontend permits positive decimal Sort Order values per owner instruction even though Swagger currently describes `sortOrder` as an integer. Leave Type Group/Assign remains a separate resource.

### Leave Type Assign

- [x] Assignment List - get all Leave Type Group records and resolve related names
- [x] Assignment Create - create a Leave Type-to-Business-Unit assignment
- [x] Assignment Edit - get one and update record
- [x] Assignment View - get one read-only record
- [x] Delete assignment
- [x] Change assignment status through the documented update operation
- [x] Load real Business Group, dependent Business Unit, and group-scoped Leave Type options

The frontend name is Leave Type Assign; its backend resource is `/leave-type-groups`. The optional `leaveTypeId` query filters assignments by Leave Type.

### Leave Allocation

- [x] List, create, edit, view, delete, and status change
- [x] Load Business Unit, Employment Type, and Leave Type options from APIs
- [x] Support the optional `buId` and `leaveYear` list filters in the API wrapper

Leave Allocation uses `/leave-allocations`. The frontend sends the numeric IDs and numeric `status` expected by Swagger.

## HRIS - Attendance Settings

### WiFi Information

- [x] List, create, edit, view, delete, and status change
- [x] Load Business Unit options from `/business-units`

WiFi Information uses `/wifi-informations`.

### GPS Information

- [x] List, create, edit, view, delete, and status change
- [x] Load Business Unit options from `/business-units`

GPS Information uses `/gps-informations`.

### Shift

- [x] List, create, edit, view, delete, and status change
- [x] Load Business Unit options from `/business-units`
- [x] Send the complete Shift object required by `/shifts`

The form keeps `Allow Late In Message?` and `Allow Early Out Message?`, but the admin does not write those messages. `lateInMessage` and `earlyOutMessage` are sent as `null`.

### Office Calendar

- [x] List, create, edit, view, delete, and status change
- [x] Create calendars for multiple Business Units in one POST using `buIds`
- [x] Load Business Units from `/business-units`
- [x] Load Calendar Event Type options from HR Lookup Type/Value APIs
- [x] Filter Calendar Event Type values by the Business Group of the selected Business Unit
- [x] Save generated day rows through the `days` DTO array

Office Calendar uses `/office-calendars`. Create supports multiple Business Units; Edit manages one returned calendar record.

## HRIS - HRIS Forms

### Leave Application

- [x] List, create, edit, view, and delete
- [x] Save as Draft or submit immediately
- [x] Submit an existing draft through `PATCH /employee-leaves/{id}/submit`
- [x] Load real Employee options and display their related organization fields
- [x] Load employee-specific Leave Categories and balances
- [x] Calculate Total Leave Days through the backend calculation endpoint
- [x] View page shows available Created By, Created At, Updated By, and Updated At fields

Leave Application uses `/employee-leaves`. Only drafts expose Edit, Delete, and Submit actions in the list. The backend remains responsible for authorization and final workflow enforcement.
The live backend returns `400` for the default `my` list when the logged-in User has no Employee assignment. Assign an Employee to that User before testing the employee self-service flow.

### Mobile Notification

- [x] List, bulk create, edit, view, delete, and status update
- [x] Load real Business Units, Departments, and recipient Employees
- [x] Load group-scoped Notification Type values from HR Lookup Type/Value APIs
- [x] Use multi-select targets for bulk Create and single targets for Edit
- [x] View page shows available Created By, Created At, Updated By, and Updated At fields

Mobile Notification uses `/mobile-notifications`. The logged-in sender does not need an Employee assignment, but recipient Employee records and an active `Notification Type` HR lookup value must exist before Create can be tested.

### Office Notice

- [x] List, create, edit, view, delete, and status update
- [x] Load real Business Unit options from `/business-units`
- [x] Send and read the Business Unit as `buId`
- [x] View page shows available Created By, Created At, Updated By, and Updated At fields

Office Notice uses `/office-notices`. The frontend intentionally uses `buId`; the backend Swagger still shows `bgId` and must be corrected before runtime testing.

## Not Yet API-Integrated

These existing frontend areas are not yet API-integrated. Some now have Swagger resources but still require feature mapping and implementation:

- Department Group assignments (Department master CRUD and Business Group options are integrated)
- Designation Group management UI (Designation master and Designation Department Mapping CRUD are integrated)
- Employment Status (Employment Type CRUD is integrated; Swagger does not currently document Employment Status APIs)
- Employee Attendance Config
- Employee Information/Employee Details
- Manual Attendance Update
- Sales Agreement
- Sales Payment Process
- Bill Collection
- Asset Lookup Type and Asset Lookup Value
- Asset Group and Depreciation Category
- Asset Item Information and Asset Specification Mapping
- Custodian and Location Master
- Supplier Information (P2P → Procurement Settings)
- Unit of Measure (UOM) (P2P → Procurement Settings)
- Asset Receive Register
- Bulk Asset Receive for Split
- Asset Assign to Employee
- Asset Return from Employee
- Asset Transfer
- Maintenance / AMC
- Asset Disposal / Retirement
- Asset Audit
- Asset Repair
- Gate Pass

For areas without documented endpoints, do not invent API URLs; connect them only after Swagger adds their contracts.

Exception: Swagger now documents generic `/lookup-types` and `/lookup-values` CRUD. Do not assume those resources belong exclusively to HR or Asset until their intended module mapping is confirmed.

All currently implemented Asset screens use feature-scoped in-memory repositories. Their CRUD behavior supports frontend design and testing but is not persisted after a reload and is not an API integration.

## Related Files

- Full technical details and backend gaps: `API_INTEGRATION_REPORT.md`
- Feature API wrappers: each API-backed feature's `api/<feature>Api.js`
- Shared CRUD wrapper factory: `src/api/createCrudApi.js`
- Shared Axios client: `src/api/client.js`
- Authentication wrappers: `src/api/authApi.js`
