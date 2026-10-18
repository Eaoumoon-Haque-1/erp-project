# API Integration Report

Backend last verified: 17 October 2026  
Documentation refreshed: 17 October 2026  
Backend specification: OpenAPI/Swagger document supplied for the project.

This file records what was connected, what frontend UI had to be created, and which existing screens still cannot be persisted because the backend specification does not expose a matching endpoint.

## Shared API and authentication foundation

- Axios is the single HTTP client (`src/api/client.js`).
- The API base URL must come from `VITE_API_BASE_URL`; no backend address is hardcoded in the client.
- Development and production both call the real backend configured by `VITE_API_BASE_URL`. The former in-browser mock adapter and authentication bypass have been removed.
- Bearer tokens are attached by the request interceptor.
- HTTP 401 attempts one shared token refresh, retries the original request with the new access token, and clears the session only when refresh is unavailable or fails.
- Login and logout are connected to `/auth/login` and `/auth/logout`.
- Automatic refresh is implemented for `/auth/refresh`, including concurrent-request deduplication and rotated-token persistence. Live Swagger's `TokenResponse` omits a separate `refreshToken`, so the current backend-compatibility path submits the returned access token as `{ refreshToken }`. If the backend later returns a distinct refresh token, it automatically takes priority.
- The live Swagger has expanded beyond the earlier 77-operation snapshot. Existing resource wrappers are colocated in each API-backed feature's `api` folder and reuse `src/api/createCrudApi.js`.
- Every environment calls the configured backend directly through
  `VITE_API_BASE_URL`; no frontend-host proxy configuration is included.

## Connected frontend resources

| Backend resource | Frontend location | Connected behavior |
|---|---|---|
| Business Groups | Super Admin → Business Group | List, get one, create, update, delete, status update |
| Business Units | Super Admin → Business Unit | List, get one, create, update, delete, status update, units by group |
| Modules | Super Admin → Menu Creation → Module | List, get one, create, update, delete, status update |
| Permissions | Super Admin → Menu Creation → Menu Permission | List, get one, create, update, delete, status update, permissions by module |
| Menus | Super Admin → Menu Creation → Create Menu | List, get one, create, update, delete, status update, menus by module |
| Roles | Super Admin → Role Creation → Create Role | List, get one, create, update, delete, status update |
| Role permissions/details | Role Edit and Menu Assign to Role | Details, available permissions, assign permission, remove permission |
| Business Unit role mapping | Assign Role to Business Unit | Assigned-role list, assign mapping, remove mapping |
| User Types | Super Admin → User Creation → User Type | List, get one, create, update, delete, status update |
| Users | Create User, User Edit | List, get one, create, update, delete, status update |
| User assignments | Create User, User Edit | Get/save one Employee and get/save multiple Business Units |
| Chart of Accounts | Accounts → Chart of Accounts | List, get one, create, update, delete, status update |
| HR Lookup Types | HRIS / HR Lookup Settings / HR Lookup Type | List, get one, create, update, delete, status update through PUT |
| HR Lookup Values | HRIS / HR Lookup Settings / HR Lookup Value | List, get one, create, update, delete, status update through PUT; resolves Business Group and Lookup Type names |
| Levels of Education | HRIS / Employee Settings / Level of Education | List, get one, create, update, delete, status update through PUT |
| Degrees | HRIS / Employee Settings / Degree & Education Mapping | List, optional list filter by Level of Education, get one, sequential create, update, delete, status update through PUT |
| Leave Allocations | HRIS / Leave Settings / Leave Allocation | List, get one, create, update, delete, status update; real Business Unit, Employment Type, and Leave Type options |
| WiFi Information | HRIS / Attendance Settings / WiFi Information | List, get one, create, update, delete, status update; real Business Unit options |
| GPS Information | HRIS / Attendance Settings / GPS Information | List, get one, create, update, delete, status update; real Business Unit options |
| Shifts | HRIS / Attendance Settings / Shift | List, get one, create, update, delete, status update; complete Shift DTO |
| Office Calendars | HRIS / Attendance Settings / Office Calendar | List, get one, multi-Business-Unit create, update, delete, status update; generated day rows |
| Employee Leaves | HRIS / HRIS Forms / Leave Application | List, get one, save draft, submit, update, delete, available categories, and server-side day calculation |
| Mobile Notifications | HRIS / HRIS Forms / Mobile Notification | List, bulk create, get one, update, delete, status update; real target and HR lookup options |

The duplicate Role Controller and Role Details Controller URLs are resolved through one frontend `rolePermissionsApi`. Role Controller is used only for Role master CRUD. Role Edit, Role View, and Menu Assign to Role all use Role Details Controller for details, available permissions, bulk assignment, and removal. Pages must not select a controller family directly. Role Edit and Menu Assign to Role both stage `+` additions locally and persist them only from the page-level Save/Update action.

The deployed Admin contracts use numeric `status` (`0`/`1`) rather than `isActive`. User Types persist `bgId`, `typeName`, `shortName`, and `sortOrder`; Users use the current `bgId`/`buId` and optional email/password-on-edit contract; Menu `permissionId` is serialized as a JSON-array string. Role-menu choices are limited to non-top, non-parent menus as required by the backend change notes.

## Frontend pages created because they were missing

The following UI did not exist or did not provide the documented backend operation and was added during integration:

- Business Group Edit page and route.
- Module Edit page and route.
- Menu Permission Edit page and route.
- Create Menu Edit page and route.
- User Type Edit page and route.
- User Edit page and route.
- Chart of Accounts module:
  - Accounts sidebar parent.
  - Chart of Accounts list page.
  - Chart of Accounts create page.
  - Chart of Accounts edit page.
  - Validation and API mapper.
- HR Lookup Type, HR Lookup Value, and Level of Education Edit and View pages and routes.
- Business Unit Edit was replaced with a real Business Unit editor; role assignment remains in its dedicated workflow.
- Menu Assign to Role mock pages were converted to an API-backed role list and permission-assignment form.
- User Create Self Service is intentionally static. It performs no User, Role, User Type, Business Unit, or Employee API requests until its contract is confirmed.
- Business Unit Create/Edit and User Create/Edit load active Business Groups from `/business-groups`; dependent Business Units load from `/business-units/group/{bgId}`. These screens no longer assume Business Group ID `1`.
- `src/hooks/useBusinessOptions.js` is the shared source for API-backed Business Group and dependent Business Unit options. Reuse it instead of adding feature-level fixtures.

## Backend gaps and contract mismatches

These integrations are intentionally deferred or still require a confirmed frontend mapping:

- **Employees/pending employee users:** Swagger now documents Employee list/create/get/update and Employee Profile section APIs, but those resources are not connected yet. Pending Employee rows therefore remain fixtures until that integration is completed.
- **User Type Group:** integrated through `GET/PUT /user-types/{userTypeId}/business-units`. The GET prefills saved rows and the PUT sends the complete Business Unit array in one request, preserving existing row IDs and using `id: null` for new rows. The list reads `bgId` from each User Type and then calls `/business-units/group/{bgId}`. An orphaned User Type that references a deleted Business Group can therefore cause a `404`; correct the backend data and make the list tolerate invalid references.
- **User assignment tabs:** integrated through `GET/PUT /users/{userId}/employee` and `GET/PUT /users/{userId}/business-units`. Create persists the User first because both assignment contracts require its generated ID.
- **Business Unit logo:** Swagger describes the logo as a string, not multipart upload. The frontend converts the selected image to a data URL string.
- **Generic Lookup Type/Value:** the live Swagger now documents full CRUD at `/lookup-types` and `/lookup-values`. These 10 operations are new and are not yet wrapped or connected. Their schemas use `bgId`, `buId`, `typeName`/`typeCode`, and `typeId`/`value`/`sortOrder`; confirm whether they serve HR, Asset, or both lookup screens before mapping them.
- **HRIS resources:** Leave Allocation, WiFi Information, GPS Information, Shift, Office Calendar, Leave Application, Mobile Notification, and Office Notice are connected. Employee Attendance Config and Manual Attendance Update still need frontend integration. Department Group and Designation Group remain separate management workflows.
- **Office Notice contract correction:** the frontend uses the standard Business Unit field `buId` and loads options from `/business-units`. Live Swagger still exposes `bgId` for Office Notice, so the backend must rename that property and the list query parameter to `buId` before runtime testing.
- **Mobile Notification runtime requirement:** the sender does not need an Employee assignment. Bulk Create still requires real recipient Employees and an active HR Lookup Value under a lookup type named/code `Notification Type` or `Mobile Notification Type`.
- **Leave Application runtime requirement:** the backend accepts `view=my` or `view=approval`. The default employee-facing list behaves as `my` and returns `400` when the logged-in User has no Employee assignment. This is an account/data prerequisite, not a missing frontend endpoint.
- **Sales screens:** the inspected Swagger has no Sales Agreement, Sales Payment Process, or Bill Collection APIs.
- **Asset screens:** apart from the unconfirmed generic Lookup mapping noted above, the inspected Swagger has no endpoints for Asset Group, Depreciation Category, Asset Item Information, Asset Specification Mapping, Custodian, Location Master, Asset Receive Register, Bulk Asset Receive for Split, Asset Assign to Employee, Asset Return from Employee, Asset Transfer, Maintenance / AMC, Asset Disposal / Retirement, Asset Audit, Asset Repair, or Gate Pass. These screens currently use isolated in-memory repositories.
- **Procure to Pay settings:** Swagger now documents Supplier CRUD, but it is not connected yet. Unit of Measure remains frontend-only until its backend ownership and screen mapping are handled with the Asset contracts.
- **Automatic token renewal:** the frontend renewal/retry flow is complete. Because live Swagger's login `TokenResponse` has no distinct refresh token, the access token is currently reused in the refresh request body pending backend confirmation.
- **Authorization role:** the latest tested login response reports `Super Admin`. Authentication uses the real session, but sidebar filtering still reads the temporary `src/app/currentUser.js` fixture; dynamic menu RBAC remains unfinished.

Do not invent endpoint names or infer screen ownership. Implement deferred APIs only when the project owner schedules them and the Swagger contract is confirmed.

## Verification

- Full ESLint: passed.
- Production Vite build: passed.
- Build warning: the main JavaScript bundle is larger than 500 kB. This is a performance/code-splitting opportunity, not a build failure.
- Verification avoided POST/PUT/DELETE smoke tests against live data; no test records were created or removed merely to validate the wiring.
