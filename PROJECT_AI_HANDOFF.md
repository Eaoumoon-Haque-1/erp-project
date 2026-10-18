# Cloud ERP Project — AI Context and Implementation Guide

Last updated: 17 October 2026

This document is a durable handoff for another AI or developer continuing this project. Read it before changing forms, menus, routes, validation, layout, or database-facing field names.

## 1. Product owner’s core instructions

### Visual consistency

- The visual reference is the existing Health Expert application.
- Navbar and sidebar font sizes, colors, spacing, gaps, heights, and alignment should match the Health Expert styling as closely as possible.
- The navbar was considered correct after it was aligned with Health Expert. The sidebar was subsequently aligned in the same way.
- All ordinary form controls in the same grid must have consistent width and height.
- Labels, fields, placeholders, and gaps must be consistent across forms.
- Do not create random one-off spacing or font sizes when an existing `erp-*` class already provides the project’s visual language.
- Avoid horizontal page scrolling for ordinary forms.
- The standard reusable form grid is five columns on wide screens, but special dense forms may override it.
- Employee Information is intentionally four columns on wide screens because five columns looked overcrowded.
- Repeatable sections such as Education, Training, Professional Certification, and Job Experience use table-style entry sections based on the supplied legacy image.
- Employee Information sections use card/tab organization rather than one enormous uninterrupted form.
- Section titles such as Employee Information, Office Time, and Reporting Officer use the project’s green, underlined treatment.

### Form behavior

- New/Create pages normally have a List button in the header.
- A successful Save normally redirects back to the corresponding list page.
- Reset restores initial values and clears validation errors.
- Required fields show a red `*`. Optional fields must not show a star.
- `Is Active` uses the project switch design, not radio buttons.
- When an active status field exists, it normally defaults to active (`"1"`).
- Do not display an active switch if the current specification does not show one. Sales Agreement currently has no visible Is Active switch.
- Read-only API-derived fields use normal control dimensions plus `erp-readonly`.
- Dependent fields must be disabled/read-only and cleared when their controlling switch or selection makes them irrelevant.
- Text areas should start at one normal field row, grow up to about three lines, and then show their own vertical scrollbar. Use `AutoGrowTextarea`.
- Text-area growth must move the entire following grid row together; do not overlap adjacent fields.
- Placeholder text should remain smaller/subtle and consistent.
- A 500-character text area can receive HTML-looking text, but it remains plain text unless a future explicit requirement safely sanitizes it. Do not use `dangerouslySetInnerHTML` for user input.

### Data and backend boundaries

- API-connected screens must use the shared Axios client and the configured real backend. There is no mock-auth or mock-API adapter.
- Screens whose backend resources do not exist may use clearly named, feature-scoped temporary arrays or repositories. Replace those boundaries with API data later without changing component contracts unnecessarily.
- True database-wide uniqueness belongs to the backend. Frontend validation may only detect duplicates among records already loaded into the browser.
- Backend uniqueness errors must eventually be displayed as field-level errors.
- Keep database table names and column-style field keys exactly as supplied by the spreadsheet when they are unambiguous.
- Audit fields do not belong in Create/Edit controls, but every new View page must show an **Audit Information** section. Include only Created By, Created At, Updated By, and Updated At when the GET API returns them. Omit unavailable fields and never invent missing names or timestamps. Do not include Submitted At or Status in this audit section.
- Status values normally use string flags: `"1"` for active/yes and `"0"` for inactive/no.

### Dates, years, numbers, and uploads

- All dates shown to users must be `DD/MM/YYYY`.
- Internal form values remain ISO `YYYY-MM-DD` for reliable state, comparison, and API payloads.
- Use `DateInput`; do not add raw browser date inputs that display a different locale format.
- Use `formatDateForDisplay` in list tables.
- All standalone year fields accept no more than four digits.
- Validate a year as a real four-digit year according to the module’s allowed range; current modules generally use a `19xx` or `20xx` rule.
- The User form’s Validate From Date defaults to today.
- The User form’s Validate To Date defaults to six calendar months after From Date and remains editable.
- Where the owner explicitly changed sort-order behavior, sort order must be greater than `0` and may accept fractions.
- Do not globally change all numeric fields: years, employee counts, days, and attendance minutes may require whole numbers.
- Image/logo uploads support JPG, JPEG, PNG, and SVG where specified, with a 2 MB maximum unless a later specification overrides it.
- Show an image preview and revoke object URLs when previews are replaced or components unmount.
- Business Unit’s logo preview/upload and Save/Reset actions occupy separate rows according to the finalized layout.

## 2. Technology and project entry points

- React 19
- React Router 7
- Vite 8
- Tailwind CSS 4 plus shared project classes in `src/index.css`
- `react-datepicker` through the shared `DateInput`
- Local component state is preferred; no global state library is currently needed.
- API coverage is mixed: many Super Admin and HRIS features are connected, while several Sales and Asset workflows still use temporary feature stores. Check the API checklist per feature.
- Asset screens currently use feature-scoped in-memory repositories because the inspected backend documentation has no Asset endpoints.

Important entry points:

- `src/main.jsx`: application bootstrap.
- `src/App.jsx`: renders `RouterProvider`.
- `src/app/router.jsx`: central route composition.
- `src/app/menu.js`: combines and role-filters menu definitions.
- `src/layouts/RootLayout.jsx`: navbar, drawer/sidebar, workspace outlet, and footer.
- `src/index.css`: shared visual system and responsive rules.

## 3. Directory and module convention

```text
src/modules/<area>/<feature>/
├── components/
│   └── <Feature>Form.jsx
├── api/
│   └── <feature>Api.js
├── pages/
│   ├── <Feature>List.jsx
│   ├── <Feature>Create.jsx
│   ├── <Feature>Edit.jsx       # only when supported
│   └── <Feature>View.jsx       # normal for API-backed CRUD
├── validation/
│   └── <feature>Validation.js
└── data/                       # API mappers, options, and pure helpers
```

- `components/`: presentational fields, tables, assignment blocks, and modals.
- `api/`: endpoint paths and HTTP calls through the shared client.
- `pages/`: state, loaders, submit/reset behavior, navigation, and API orchestration.
- `validation/`: table constant, initial values, normalization, and client validation.
- `data/`: API mappers, reusable options, and pure feature helpers.
- `<area>/menu.js`: sidebar hierarchy and visible labels.
- `<area>/routes.jsx`: route declarations imported by `src/app/router.jsx`.

New-module workflow:

1. Confirm spreadsheet form name, table name, column names, types, required flags, and validation notes.
2. Add the feature folders using the convention above.
3. Add the list page first unless the workflow is explicitly modal-only.
4. Register routes and then the menu item.
5. Check current Swagger before using temporary data. Add a feature API wrapper and mapper when endpoints exist.
6. Use temporary records only when no matching API exists, and clearly label that boundary.
7. Run targeted ESLint on changed files.
8. Run `npm run build`.

## 4. Shared UI contracts

### PageHeader

Use `src/components/shared/PageHeader.jsx`.

- Shows title and optional subtitle.
- Supports one standard link action plus optional extra actions.
- Create pages normally show List.
- List-only pages with no create workflow omit action props.

### FormPage

Use `src/components/shared/FormPage.jsx` for ordinary create forms.

- Supplies the page header, white form card, List, Reset, and Save/Submit controls.
- Sets `<form data-table={tableName}>`.
- Accepts `onSubmit`, `onReset`, `message`, `submitting`, `submitLabel`, and the optional `onDraft`/`draftLabel` workflow.
- Do not duplicate this frame unless the page has a special multi-card/tab layout.
- Create/update/draft confirmation and success/error results are supplied centrally; feature pages must not add their own confirmation dialog.

### Central action feedback

- `src/components/shared/actionAlerts.js` is the single source for SweetAlert2 wording, appearance, confirmation, success, duplicate, and general operation errors.
- Standard `FormPage` submissions and `ListRowActions` delete/status actions already use it.
- Custom-layout forms use `src/components/shared/ActionForm.jsx`; isolated operations use `runConfirmedAction`.
- Never import SweetAlert2 directly in a module and never introduce `window.confirm`.
- Client validation remains in each feature validator and renders below the exact field through its existing `errors` object.
- API-backed forms use `applyApiFormErrors` from `src/api/errors.js`. It understands common Spring `errors`/`fieldErrors` shapes and accepts a backend-to-form `fieldMap`.
- General backend/transport failures use the centered error alert. Field-specific backend failures stay attached to their controls. `getApiErrorMessage` opens the alert automatically for list/load failures when no confirmed action is active.
- Do not restore top-right/in-card success or general-error messages through `erp-form-message`. Successful operations and general failures are centralized; only validation belonging to a particular field remains inline.
- Global alert styling lives in the `erp-action-alert*` rules in `src/index.css`; change that shared implementation rather than editing every screen.

### ListPage

Use `src/components/shared/ListPage.jsx`.

- Provides optional New action, specific filters, global Search, reset, serial number, table, empty state, and pagination.
- Pagination currently uses 50 rows per page.
- Columns are `{ key, label, render? }`.
- Filters can be text matchers or option dropdowns.
- `renderActions(row)` adds the Action column.
- Serial columns must remain narrow.
- A list-only workflow omits `createLabel` and `createTo`.

### ListRowActions

Use `src/components/shared/ListRowActions.jsx` for normal View/Edit/Delete/Status actions.

- Preserve standard action colors and icons.
- Buttons are disabled when their handler is absent.
- If active actions are expected, pass real handlers.
- Do not make serial or action columns unnecessarily wide.

### Modal

Use `src/components/shared/Modal.jsx`.

- Provides centered backdrop, header, close button, Escape close, and backdrop close.
- `panelClassName` supports feature-specific width.
- Modal forms use `data-table`, field validation, field errors, and Cancel/Save or Submit actions.
- Conditional rendering with a `key` is useful when a modal must reset for a newly selected row.

### DateInput and date utilities

Use `src/components/shared/DateInput.jsx` and `src/utils/dateFormat.js`.

- `DateInput` displays `dd/MM/yyyy` while emitting ISO values.
- `parseIsoDate` rejects impossible ISO dates.
- `formatIsoDate` converts Date to ISO.
- `formatDateForDisplay` converts stored ISO to `DD/MM/YYYY`.
- `DateInput` caps dates at year 9999.

### AutoGrowTextarea

Use `src/components/shared/AutoGrowTextarea.jsx`.

- Starts at 45 px and grows to 93 px.
- Shows its own scrollbar above that height.
- Pass normal value, onChange, maxLength, placeholder, accessibility, and `erp-textarea` props.

### MultiSelectField

Use `src/components/shared/MultiSelectField.jsx`.

- Receives `options`, an array `value`, and `onChange(name, nextArray)`.
- Generates hidden inputs named `<name>[]`.
- Supports required, disabled, errors, placeholder, and trigger ref.
- Parent pages implement a separate multi-select change handler.

### UserAssignmentTabs

Use `src/components/shared/UserAssignmentTabs.jsx`.

- Contains Assign Employee and Assign BU tabs.
- Each tab includes selection, Is Active, local duplicate prevention, narrow serial, status, remove action, and Add More.
- Both assignments participate in the single User Save workflow.

## 5. CSS and design-system rules

Shared classes are defined in `src/index.css`.

- `erp-list-page`: page spacing and overall layout.
- `erp-form-header`: white header strip used by PageHeader.
- `erp-form-card`: white floating form/list card.
- `erp-form-grid`: standard five-column wide-screen grid with equal tracks.
- `erp-form-control`: standard control dimensions, font, padding, border, and focus behavior.
- `erp-form-control-invalid`: field-level error state.
- `erp-readonly`: read-only/disabled appearance.
- `erp-field-label`, `erp-required`, and `erp-field-error`: labels and validation.
- `erp-form-actions`: right-aligned Reset/Save row.
- `primary-button` and `secondary-button`: standard actions.
- `erp-switch-field` and `erp-switch-control`: toggle treatment.
- `erp-table-wrap`, `erp-table`, and `erp-number-column`: table shell and narrow serial.
- `erp-modal-*`: modal backdrop, panel, header, close, body, form, and actions.
- `erp-employee-*`: Employee Information cards, tabs, and repeatable tables.

Avoid inline widths unless a special table column needs a deliberate size. Prefer a named feature class when several elements share a special layout.

## 6. Standard form-state and validation pattern

```js
export const initialFeatureValues = {
  FIELD_NAME: '',
  STATUS: '1',
}

export const createInitialFeatureValues = () => ({
  ...initialFeatureValues,
})
```

Use a factory when values contain arrays, objects, generated dates, or row factories.

```js
const handleChange = (event) => {
  const { name, type, value, checked } = event.target
  const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
  setValues((current) => ({ ...current, [name]: nextValue }))
  setErrors((current) => ({ ...current, [name]: undefined }))
}
```

Validators return:

```js
return {
  values: normalizedValues,
  errors,
  isValid: Object.keys(errors).length === 0,
}
```

Validation rules:

- Trim ordinary text before saving.
- Preserve passwords exactly.
- Normalize switches to `"1"`/`"0"`.
- Validate required, length, numeric domain, date relationships, dependencies, and local duplicates.
- Put errors against exact field keys.
- Set `aria-invalid` and `aria-describedby`.
- Focus the first `[aria-invalid="true"]` after failed submit.
- Never rely only on HTML `required`, `min`, `max`, or `step`.
- Save only when all mandatory validation passes.

## 7. Current menu hierarchy

### Super Admin

Top-level label: `SUPER ADMIN`, restricted to `SUPER_ADMIN`.

- Business Group
- Business Unit
- Menu Creation
  - Module
  - Menu Permission
  - Create Menu
- Role Creation
  - Create Role
  - Assign Role to Business Unit
  - Menu Assign to Role
- User Creation
  - User Type
  - User Type Group
  - Create User
  - User Create Self Service

### HRIS

- Employee Settings
  - Department
  - Designation
  - Designation Department Mapping
  - Employment Type
  - Employment Status
  - Degree & Education Mapping
  - Level of Education
- HR Lookup Settings
  - HR Lookup Type
  - HR Lookup Value
- Leave Settings
  - Leave Type
  - Leave Type Assign
  - Leave Allocation
- Attendance Settings
  - WiFi Information
  - GPS Information
  - Shift
  - Office Calendar
- HRIS Forms
  - Employee Information
  - Leave Application
  - Employee Attendance Config
  - Mobile Notification
  - Office Notice
  - Manual Attendance Update

Pay Scale and Assign Empl and BU to User have code, but their HRIS menu/routes are commented out. Do not re-enable them without instruction.

### Admin (sales-area source folder)

The owner explicitly removed the SALES wrapper and kept `Admin` as the top-level menu.

- Sales Agreement
- Sales Payment Process

Code remains under `src/modules/sales`, while the Admin menu uses canonical `/admin/...` routes without the obsolete `/sales` prefix.

### Asset

- Asset Settings
  - Asset Lookup Type
  - Asset Lookup Value
  - Asset Group
  - Depreciation Category
  - Asset Item Information
  - Asset Specification Mapping
  - Custodian
  - Location Master
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

All current Asset entries use canonical `/asset/...` routes. The workbook calls Asset Group “Asset Item Group,” but the current sidebar and feature folder still use Asset Group; do not rename them without a direct owner instruction.

### Procure to Pay (P2P)

- Procurement Settings
  - Supplier Information
  - Unit of Measure (UOM)

Supplier Information currently reuses the existing `src/modules/asset/vendor-supplier-master` feature implementation, while its canonical menu/routes live under `/procure-to-pay/procurement-settings/...`. UOM lives under `src/modules/procure-to-pay/asset-unit-of-measure`.

### Canonical route groups

- Employee Settings: `/hris/employee-settings/...`
- HR Lookup Settings: `/hris/hr-lookup-settings/...`
- Leave Settings: `/hris/leave-settings/...`
- Attendance Settings: `/hris/attendance-settings/...`
- HRIS Forms: `/hris/hris-forms/...`
- Admin sales features: `/admin/...`
- Super Admin features: `/super-admin/...`
- Accounts features: `/accounts/...`
- Asset features: `/asset/...`
- Procure to Pay features: `/procure-to-pay/...`

Module route declarations are relative and omit the leading slash. Sidebar paths and page navigation links are absolute and include it. A route rename is incomplete until the module route, menu path, List/New/Edit links, page navigation, folder/file names, component names, titles, CSS feature names, and documentation agree.

## 8. Database table-name map

### Super Admin

- Module: `MODULES`
- Menu Permission: `PERMISSIONS`
- Menu: `MENUES` (keep existing spelling)
- Role: `ROLES`
- Assign Role to Business Unit: `BU_ROLE_MAP`
- User Type: `HR_USER_TYPE`
- User Type Group: `HR_USER_TYPE_GROUP`
- User: `USERS`
- Leave Allocation: `HR_LEAVE_ALLOCATION`

### HRIS

- Business Group: `HR_BG`
- Business Unit: `HR_BU`
- Department: `HR_DEPT`
- Department Group: `HR_DEPT_GROUP`
- Designation: `HR_DESIG`
- Designation Group: `HR_DESIG_GROUP`
- Designation Department Mapping: `HR_DEPT_DESIG_MAP`
- Employment Type: `HR_EMPLOYMENT_TYPE`
- Employment Status: `HR_EMPLOYMENT_STATUS`
- Level of Education: `HR_LEVEL_OF_EDU`
- Degree: `HR_DEGREE`
- Leave Type: `HR_LEAVE_TYPE`
- Leave Type Assign/Group: `HR_LEAVE_TYPE_GROUP`
- Leave Application: `HR_EMP_LEAVE`
- Employee: `HR_EMPLOYEE`
- Employee Education: `HR_EMPLOYEE_EDUCATION`
- Employee Training: `HR_EMPLOYEE_TRAINING`
- Employee Certification: `HR_EMPLOYEE_CERTIFICATION`
- Employee Job Experience: `HR_EMPLOYEE_JOB_EXPERIENCE`
- User Creation From Employee: `SEC_USERS`
- Pay Scale: `HR_PAY_SCALE`
- Pay Scale Details: `HR_PAY_SCALE_DTLS`
- HR Lookup Type: `HR_LOOKUP_TYPE`
- HR Lookup Value: `HR_LOOKUP_VALUE`
- WiFi Information: `WIFI_INFORMATION`
- GPS Information: `GPS_INFO`
- Shift: `HR_SHIFT`
- Employee Attendance Config: `HR_EMP_ATT_CONFIG`
- Employee Attendance WiFi: `HR_EMP_ATT_WIFI`
- Employee Attendance GPS: `HR_EMP_ATT_GPS`
- Employee Attendance Machine: `HR_EMP_ATT_MACHINE`
- Mobile Notification: `HR_MOBILE_NOTIFICATION`
- Office Notice: `HR_OFFICE_NOTICE`
- Manual Attendance Update: `HR_MANUAL_ATTN_UPDATE`
- Office Calendar: `HR_OFFICE_CALENDER`
- Office Calendar Details: `HR_OFFICE_CALENDER_DTLS`
- Assign Employee/BU to User: `USERS_EMPL_MAP`

Keep the spreadsheet’s `CALENDER` spelling in database identifiers.

### Admin/Sales

- Sales Agreement: `HR_SALES_AGREEMENT`
- Sales Payment Process: `HR_SALES_PAYMENT_PROCESS`
- Bill Collection Information: `HR_BILL_COLLECTION_INFO`

### Asset

- Asset Lookup Type: `ASSET_LOOKUP_TYPE`
- Asset Lookup Value: `ASSET_LOOKUP_VALUE`
- Asset Group: `ASSET_GROUP`
- Depreciation Category: `ASSET_DEPRI_CATEGORY`
- Asset Item Information: `ASSET_ITEM`
- Asset Specification Mapping: `ASSET_ITEM_SPEC`
- Custodian: `ASSET_CUSTODIAN`
- Sub Custodian: `ASSET_CUSTODIAN_DTL`
- Location Master: `ASSET_LOCATION`
- Asset Receive Register: `ASSET_RECEIVE_REGISTER`
- Bulk Asset Receive for Split: `ASSET_RECEIVE_REGISTER`
- Asset Assign to Employee: `ASSET_ASSIGN_TO_EMPL`
- Asset Return from Employee: `ASSET_ITEM_RETURN`
- Asset Transfer: `ASSET_TRANSFER`
- Maintenance / AMC: `ASSET_MAINTENANCE`
- Asset Disposal / Retirement: `ASSET_DISPOSAL`
- Asset Audit: `ASSET_AUDIT`
- Asset Repair: `ASSET_REPAIR`
- Gate Pass: `ASSET_GATE_PASS`
- Gate Pass Details: `ASSET_GATE_PASS_DTLS`

### Procure to Pay

- Supplier Information: `ASSET_VENDOR` (current workbook/feature contract)
- Unit of Measure (UOM): `INV_UOM`

The Asset workbook also labels received specification details as `ASSET_ITEM_SPEC`, which conflicts with the mapping table name. Keep received specifications nested behind the Asset Receive repository until the backend provides an unambiguous contract.

## 9. Module-specific behavior

### Business Group

- Basic create/list pattern.
- Group Name is required, trimmed, and length-validated.
- Active defaults on and is not presented as a required-star field.
- Save returns to the list.

### Business Unit

- Richer form with report header/footer text areas and logo upload/preview.
- Image validation follows the agreed formats and 2 MB limit.
- Preserve auto-growing report text areas and equal field sizing.
- Logo preview, logo upload, and Save/Reset occupy the finalized separate rows.

### Department and Department Group

- Department master has API-backed list, create, edit, and view pages using `/departments`.
- Department create/edit/list resolve Group Name through `/business-groups`; no fixed Business Group fixture is used.
- Department delete and status changes use the documented Department CRUD operations.
- A record must exist before Department Group assignments are managed.
- Department Edit contains the assignment list.
- Assign Department Group opens `DepartmentGroupModal` in the center.
- Assignment headings describe actual content, not blindly copied reference-image headings.
- Department Group assignment records and Business Unit options remain temporary API-like data. Keep them separate from the Department master payload until the Department Group API is implemented.

### Designation, Designation Group, and Mapping

- Designation master has API-backed list, create, edit, and view pages using `/designations`.
- Designation create/edit/list resolve Group Name through `/business-groups`; no fixed Business Group fixture is used.
- Designation delete and status changes use the documented Designation CRUD operations.
- Designation follows the same create-record → edit-record → assignment-modal pattern as Department.
- Designation Group is managed from Designation edit.
- Designation Group assignment records and Business Unit options remain temporary API-like data. Keep them separate from the Designation master payload until the Designation Group API is implemented.
- Designation Department Mapping is an API-backed separate module using `/dept-desig-maps`, with list/create/edit/view/delete/status operations.
- Mapping form options use Business Group and Business Unit APIs plus `/department-groups` and `/designation-groups` to show only Departments and Designations eligible for the selected Business Unit.

### Employment Type and Employment Status

- Employment Type has API-backed list, create, edit, and view pages using `/employment-types`, including delete and status operations.
- Employment Type permits positive decimal Sort Order values in the frontend per owner instruction, although Swagger currently describes `sortOrder` as an integer. Type Name uniqueness is checked client-side and backend errors map to fields.
- Employment Status remains frontend-only because Swagger does not currently document an Employment Status resource.
- Active defaults on.

### Leave Type

- Leave Type has API-backed list, create, edit, and view pages using `/leave-types`, including delete and status operations.
- Group Name options and displays come from `/business-groups`; Type Name uniqueness is scoped to the selected Business Group.
- Positive decimal Sort Order values are permitted in the frontend per owner instruction even though Swagger currently describes `sortOrder` as an integer.
- Leave Type Group/Assign is a separate API-backed assignment workflow rather than part of the Leave Type master payload.
- Leave Type Assign is now fully API-backed through `/leave-type-groups`, including list/create/edit/view/delete/status operations.
- Its Group, dependent Business Unit, and Leave Type controls use real API options; Leave Types are restricted to the selected Business Group.
- Duplicate Leave Type and Business Unit assignments are blocked client-side and remain subject to backend validation.

### Degree & Education Mapping

- Visible menu name is `Degree & Education Mapping`.
- Level of Education remains a dropdown.
- Degree entries follow an add/list pattern.
- Both the Degree & Education Mapping Create table and the main Degree & Education Mapping List show Education Level as the first data column after the serial number; every added row stores the selected `LEVEL_OF_EDU_ID`.
- Keep one usable row; Add/Remove controls use compact standard styling.
- The feature is API-backed by `/degrees`. `levelOfEduId` links each Degree to `/level-of-educations`; Level options must not be fixtures.
- Swagger accepts one Degree object per POST, so Create stages multiple rows locally and posts them sequentially on Save. Edit/View/Delete/status use the standard single-record GET/PUT/DELETE operations.
- `sortOrder` is an optional positive integer because the live Degree schema declares `int32`.

### Leave modules

- `Leave Type Group` was visibly renamed to `Leave Type Assign`.
- Leave Type, Leave Type Assign, and Leave Allocation live under Leave Settings.
- `Leave Information` was visibly renamed to `Leave Application`.
- Leave Application contains a read-only/API-derived Leave Balance in row 2, column 5.
- In Leave Application, Reason is required, starts on its own row, and spans the full form width as a large textarea.
- Leave Application does not show an Is Active switch. Save as Draft writes `STATUS: "0"`; Submit writes `STATUS: "1"`.
- Leave Application is API-backed by `/employee-leaves`. Draft and Submit use the documented `submit` query flag; existing drafts can also be submitted with `PATCH /employee-leaves/{id}/submit`.
- Available categories and balances come from `/employee-leaves/available-categories`. Total days come from `/employee-leaves/calculate`; do not restore client-only day calculations or fixed balances.
- Draft applications expose Edit, Delete, and Submit actions. Submitted applications are read-only in the frontend. The backend remains authoritative for visibility and locking.
- The default Leave Application list is employee-facing (`view=my`). The backend returns `400` when the authenticated User has no Employee assignment, so assign the User to an Employee before runtime testing. Swagger also accepts `view=approval` for an approval workflow.

### Mobile Notification

- Mobile Notification is API-backed by `/mobile-notifications` with list, bulk create, get, update, and delete operations.
- Create sends `buIds`, `deptIds`, and `employeeIds` arrays and may generate multiple individual notification rows. Edit updates one generated row using `buId`, `deptId`, and `emplId`.
- Business Units, Departments, and recipient Employees come from real APIs. Departments are filtered by the selected Business Unit's `bgId`; they must not depend on whether Employee records already exist. Recipient Employees are filtered by both selected Business Unit and Department. Notification Type is a numeric HR Lookup Value filtered by the selected Business Unit's Business Group.
- The lookup type must be named or coded `Notification Type` or `Mobile Notification Type`. Do not restore string constants such as `GENERAL` or `URGENT` because the backend expects `notificationTypeId`.
- The logged-in sender does not need an Employee assignment. However, recipient Employee records and Notification Type lookup values must exist to use Create.
- View shows only the four required audit fields when available: Created By, Created At, Updated By, and Updated At.

### Office Notice

- Office Notice is API-backed by `/office-notices` with list, create, get, update, and delete operations.
- Its organization field is Business Unit. Load options from `/business-units` and send/read the exact backend property `buId`.
- Live Swagger still documents `bgId` for this resource. This is a known backend contract issue scheduled for correction; do not change the frontend back to Business Group.
- View shows only the four required audit fields when available: Created By, Created At, Updated By, and Updated At.

### Shift

- The form is section-based and preserves readable grouping.
- Late In Message and Early Out Message were removed.
- Apply Early Out Policy starts on the row directly below Apply Late In Policy, with its dependent fields aligned beside it.
- Weekend and Grace Time belong to Shift Information, not Late In/Early Out policies.
- `Allow Late In Message?` and `Allow Early Out Message?` remain admin settings, but admins do not enter message text. The two message strings are sent as `null`.
- Not Allow Attendance belongs to the Attendance In/Out Policy section and is disabled when that policy is off.
- The old `Not Allow Attn After (Minutes)` field is not in the current Swagger Shift schema and must not be restored without a backend contract change.
- Overtime-dependent fields validate only when overtime is enabled.
- Overnight shift validation depends on Allow Next Day Attendance.

### Employee Attendance Config

- Uses the smoother reference layout with grouped permission controls and tabs.
- Attendance permissions: WiFi, GPS, and Machine.
- If WiFi Flexibility is Yes, both WiFi In Time Flexible and WiFi Out Time Flexible become Yes.
- If GPS Flexibility is Yes, both GPS In Time Flexible and GPS Out Time Flexible become Yes.
- Tabs: WiFi, GPS, Machine.
- Attendance Shift controls Shift Name: Single uses a normal one-value select; Multiple uses MultiSelectField and stores an array in `SHIFT_ID`.
- Switching shift mode preserves the existing selection where possible and validation requires one shift in Single mode or at least one shift in Multiple mode.
- Machine rows contain Machine ID and IP Address.
- Serial columns are intentionally narrow.
- Add buttons sit outside awkward table cells.
- Remove buttons use the compact danger action style.

### Office Calendar

- Lives under Attendance Settings.
- Selecting Year and Month generates every date in the month.
- Generated rows show Date, Day, Event Type, and Remarks.
- Business Unit, Year, and Month are required.
- Year is limited to four digits.
- Table identifiers intentionally keep `CALENDER`.
- Office Calendar is API-backed by `/office-calendars`. Create sends all selected Business Units in `buIds`; Edit works with one returned calendar record.
- Each generated day maps to `calendarDate`, `calendarDay`, `eventTypeId`, `remarks`, and `status` in the `days` array.
- Event Type options come from the HR Lookup Type/Value APIs and are filtered by the Business Group of the selected Business Unit. Do not restore the old fixed event-type list.
- The live backend currently names this lookup type `Calender event type`. The frontend intentionally accepts both `Calendar` and the backend's `Calender` spelling.

### Employee Information

- Special multi-card/multi-tab form; it does not use one plain FormPage card.
- One final Save button submits the entire employee record.
- Main Employee Information uses four columns to avoid overcrowding and horizontal scrolling.
- Photo upload has preview and validation.
- Office Time and Reporting Officer are grouped sections.
- From Personal Information downward, content uses tabs.
- District is a dropdown containing the 64 districts of Bangladesh. Do not invent a complete cascading address system without instruction.
- Disability Type is a dropdown, not a checkbox collection.
- The label is `National Disability ID No`.
- National Disability ID is enabled/required only when its Yes/No control is Yes.
- Education, Training, Certification, and Job Experience are repeatable tables.
- Each repeatable section starts with one row.
- Add More adds rows; remove never leaves zero usable rows.
- Repeatable tables currently support row reordering.
- Year of Passing and Training Year are capped at four digits.
- Currently Working clears/disables Job Experience End Date.
- Male Child + Female Child automatically updates No. of Child.
- Failed validation activates the tab containing the first invalid field.

### Pay Scale

- Code exists, but menu/routes are commented out.
- Shows one detail row initially; Add More adds rows.
- Keep Festival Bonus, Annual Bonus, Gratuity, Grand Total, and Action headers visually separate.
- Serial and action columns remain narrow.

### Super Admin menu, role, and assignment workflows

- Create Menu defaults `Is Top Menu?` to No. No shows Is Parent Menu, Parent Menu, Module, Permission, and Route Name; Module, at least one Permission, and Route Name are required, while Parent Menu remains optional.
- Selecting Yes hides those five fields, clears their stale values, removes their validation requirements, and submits Route Name as `#` behind the scenes. A top menu has no parent.
- The deployed Menu API expects `permissionId` as a JSON-array string such as `"[1,2]"`, not a JavaScript array or comma-separated string. Menu name uniqueness is scoped to Module, and Sort Order accepts positive fractions.
- Role has list, create, and edit pages.
- Role Create contains Role Name and default-active switch.
- Role Edit contains Module, Menu, and a growing Permission multi-select with a plus button, followed by Permission List. The plus button only stages one Module/Menu group locally. The main Update action saves Role master changes and then submits each staged group, sending all permissions in that group's `permissionIds` array. Successfully saved rows are removed from the pending set if a later group fails.
- Role master operations use `rolesApi` and Role Controller. Every permission-assignment screen uses the single `rolePermissionsApi` adapter and Role Details Controller for details, available permissions, bulk assignment, and removal. Do not expose or mix the duplicate Swagger controller families in pages again.
- Per the backend change notes, Role uses numeric `status`, Role Name uniqueness is validated against API records, and only active leaf menus (`isTopMenu = 0`, `isParent = 0`, `status = 1`) are assignable.
- Added permission rows have only a delete/remove action.
- Menu Assign to Role is a list → New workflow with staged persistence: the Permission selector is multi-select, `+` adds the complete selection as one temporary Module/Menu row, and Save performs the API operations. The page has one Permission List for existing and staged data; existing permissions are also grouped into one row per Module/Menu. Each staged row sends one `permissionIds` array.
- Permission tables include a narrow serial column.
- Assign Role to Business Unit is a list → New create workflow, not an edit-only page.
- Group Name and Business Unit are API-derived/read-only context.
- Role is selected and added to an assigned-role table with narrow serial and compact Remove action.

### User

- Create User uses a five-column grid.
- Correct labels are Full Name and User Type.
- The deployed User contract uses numeric `status`, numeric `bgId`/`buId`, optional Email, and an optional Android ID. Mobile Number is exactly 11 digits and begins with `01`.
- Password requires 8–64 characters with uppercase, lowercase, number, and special character.
- Confirm Password must match.
- Password is required on Create. On Edit, leaving it blank omits it from the request and preserves the current password.
- Password visibility uses independent accessible eye buttons where requested.
- Validate From defaults to today; Validate To defaults to six months later and remains editable.
- Create User and User Edit contain Assign Employee and Assign BU tabs in the same single-save form.
- The User assignment backend supports one Employee and multiple Business Units. Create saves the User first, then saves assignments using its returned ID; Edit displays both tabs and loads/replaces both assignment DTOs. Employee PUT sends only `employeeId`; `null` removes it. BU rows use an existing `id` or `id: null`, and omitting a saved row soft-removes it.
- Employee choices come from `GET /employees`. User assignment calls live in `src/modules/super-admin/user/api/userAssignmentApi.js`.

### User Create Self Service

- Visible under Super Admin → User Creation.
- List-only: no New button and no separate create page.
- Employees without accounts show a profile/create-user icon.
- Clicking opens a centered modal reusing User Creation From Employee fields and validation.
- After valid save, the row changes to normal View/Edit/Delete/Status actions.
- Reuse `UserCreationFromEmployeeForm`; do not create a divergent duplicate.
- Current behavior is fully static and uses temporary local Employee rows, Role options, and User Type options.
- Create, Edit, Delete, and Status actions are in-memory only and reset on refresh.
- Do not reuse generic `/users` CRUD here until the feature contract and Employee source are explicitly confirmed.

### Sales Agreement

- Visible under top-level Admin.
- Has list and create pages.
- Uses the normal five-column form and standard list.
- Table: `HR_SALES_AGREEMENT`.
- Fields include Business Unit, Agreement No., Agreement Date, Customer Contact Person, Sales Person, agreement dates, user count, trial days, billing cycle, bill dates, billing-after days, Product Title, billing letter head/body/footer, Billing Amount, Auto Mail Date, Service/Module Taken, Subscription Status, and Remarks.
- Service/Module Taken uses MultiSelectField.
- Billing letter and remarks use AutoGrowTextarea.
- Agreement End Date cannot precede Agreement Start Date.
- Bill Unsubscription Date cannot precede Bill Start Date.
- No. of Users and Trial Period are positive whole numbers.
- Billing Amount is positive and accepts fractions.
- The visible Is Active switch was explicitly removed. Internal status may remain default-active for list/backend compatibility.
- Save returns to the list.

### Sales Payment Process and Bill Collection

- Sales Payment Process is list-only: no New button and no create page.
- Table: `HR_SALES_PAYMENT_PROCESS`.
- List columns: Business Unit, Product Title, Billing Cycle, Billing Amount, VAT, TAX, Total Payable, Action.
- Action is Collect Bill.
- Clicking Collect Bill opens a centered Bill Collection Information modal without navigation.
- Bill Collection table: `HR_BILL_COLLECTION_INFO`.
- Modal fields: Business Unit, Agreement No., Billing Amount, Payment Method, Is Bill Collected?, Remarks.
- Business Unit, Agreement No., and Billing Amount are prefilled/read-only.
- Payment Method options: Bank, MFS, Online Payment, Other.
- Remarks is optional with maximum 500 characters.
- Save with Is Bill Collected = Yes changes the action to a green Collected label.
- Save with No keeps Collect Bill available.

### Asset master data

- Asset forms follow the normal list → New → edit workflow and reuse the responsive `erp-form-grid` design system.
- From Asset Receive Register onward, every Remarks field starts on its own full-width row and uses the taller shared Asset remarks textarea style. Transfer's read-only From Remarks follows the same layout.
- Current Asset resources are frontend-only and persist only for the lifetime of the loaded JavaScript application.
- Asset Item Information includes Asset Type and derives category type, depreciation method/life/percentage, and asset owner from its selected group/category. Depreciation Method, Asset Type, Depreciation Life, Depreciation Percentage, and Asset Owner are read-only derived fields.
- Asset Specification Mapping prevents duplicate Asset Item + Specification pairs and permits only positive whole-number sort order.
- Custodian saves one parent record with repeatable Sub Custodian detail rows. Parent and child names are unique in their documented scopes, and a child cannot equal its parent.
- Location Master uses dependent Custodian → Sub Custodian selections. Department was explicitly removed by the owner even though one workbook validation row still mentions it.
- Location Name and Location Code appear before the other Location Master fields.
- Supplier Information lives under P2P → Procurement Settings, includes optional Company Type, and validates unique Vendor Name, Vendor Code, and Tax ID/BIN plus phone and email formats.
- Unit of Measure (UOM) is a P2P Procurement Settings master backed by the frontend-only `INV_UOM` repository.

### Asset Receive Register

- Keeps Asset Primary / Basic Information visible and places every section from Asset Item Specification onward in Employee Information-style tabs: Specification, Price Details, Warranty / Guaranty, Location, and Depreciation.
- Receive No (GRN) and Asset Number are generated, required, unique, and read-only.
- Purchase Date is required, cannot be in the future, and cannot be later than Receive Date.
- Fields present only in the workbook validation table but absent from its visual design were intentionally omitted.
- Selecting an Asset Item dynamically loads active specifications configured in Asset Specification Mapping.
- Item Group, UOM, depreciation method/life/percentage, and depreciation end date are derived where possible.
- Gross Amount is Qty × Unit Price. Capitalized Cost is Gross Amount − Discount + VAT/Tax + Other Charges.
- Warranty/Guaranty Type was explicitly omitted. Period and dates are enabled and required only when Warranty or Guaranty is selected.
- The final warranty text-area label is dynamic: Warranty Info for Warranty, Guaranty Info for Guaranty, and Warranty / Guaranty Info for N/A.
- Custodian → Sub Custodian → Location is dependent. Building, Floor, and Room are populated from Location; Rack and Bin remain optional inputs.
- The current implementation treats one receive record as one selected Asset Item plus quantity. A future Bulk Asset Receive workflow may split quantity into individual assets.

### Bulk Asset Receive for Split

- This is a separate list → New → edit workflow under Asset.
- The owner explicitly requested the same form and behavior as Asset Receive Register; no automatic quantity-to-individual-row split is currently performed.
- It reuses `AssetReceiveRegisterForm`, the same reference helpers, calculations, dependencies, and validation contract.
- It has a separate temporary repository and uses generated `GRN-BULK-*` and `AST-BULK-*` numbers so its frontend demonstration records do not collide with the normal receive workflow.
- The workbook maps it to `ASSET_RECEIVE_REGISTER`; a backend record discriminator remains undefined.

### Asset Assign to Employee

- Uses the normal list → New → edit workflow and the shared responsive form/table design.
- Assign Date defaults to today and cannot be earlier than the selected asset's availability/receive date.
- Expected Return Date was explicitly removed from this workflow.
- The asset dropdown combines available records from normal and bulk Asset Receive repositories and displays each option as `Asset Number - Item Name`.
- Assets with an active assignment and no Actual Return Date are excluded, preventing duplicate current assignments.
- Employee options currently come from the temporary active Employee dataset because the inspected backend has no Employee endpoint.
- Condition on Issue is required and currently supports New, Good, Fair, and Damaged. Remarks are optional except when Damaged is selected, and are limited to 500 characters.
- `ACTUAL_RETURN_DATE` remains hidden on the assignment form and is maintained by Asset Return from Employee. An active return sets it; deleting or deactivating that return clears it.
- Records use the frontend-only `ASSET_ASSIGN_TO_EMPL` repository and are not persisted after a reload.

### Asset Return from Employee

- Uses the standard list → New → edit workflow and stores frontend records under `ASSET_ITEM_RETURN`.
- Only active, currently unreturned employee assignments are selectable. Selecting an asset populates its Asset ID/name, current Employee, and Assign Date.
- Expected Return Date was explicitly removed from this workflow.
- Actual Return Date defaults to today, cannot precede Assign Date, and cannot be a future date.
- Condition on Return supports Good, Fair, Damaged, Lost, and Beyond Repair. Remarks are required for Damaged, Lost, and Beyond Repair and otherwise optional with a 500-character maximum.
- Saving an active return writes Actual Return Date back to the linked temporary assignment, making the asset available for assignment again. Deleting or deactivating the return reverses that temporary state.
- The repository is frontend-only and is not persisted after a reload.

### Asset Transfer

- Uses the standard list → New → edit workflow and the workbook's Before Asset Transfer / After Asset Transfer sections.
- Only active, unreturned employee assignments are selectable. Selecting an asset populates the read-only source custodian, sub-custodian, department, location, building, floor, room, assignment date, condition, and remarks.
- Initial source location data comes from Asset Receive Register; source department comes from the current assigned employee. After a transfer is saved, its destination becomes the source of the next transfer for that assignment.
- Destination Custodian → Sub Custodian → Location selections are dependent. Building, Floor, and Room are derived from the selected destination Location.
- Transfer Date (`TO_ASSIGN_DATE`) defaults to today, is displayed in Asset Information, and cannot precede From Assign Date.
- Optional Expected Return Date is also displayed in Asset Information and, when entered, must be strictly later than Transfer Date.
- At least one destination or condition value must change.
- To Remarks are required for Damaged, Lost, and Beyond Repair conditions and otherwise optional with a 500-character maximum.
- Records use the frontend-only `ASSET_TRANSFER` repository and are not persisted after a reload.

### Maintenance / AMC

- Uses the standard list → New → edit workflow and the `ASSET_MAINTENANCE` workbook contract.
- Asset Item and Vendor dropdowns use active master records. Maintenance Type first uses active Asset Lookup Values whose type is `Maintenance Type`; when none exist, it falls back to Preventive Maintenance, Corrective Maintenance, AMC, and Warranty Service.
- AMC requires End Date and Next Due Date. Preventive Maintenance requires Next Due Date. These dates remain optional for other maintenance types.
- End Date and Next Due Date cannot precede Start Date. Cost is required, non-negative, and accepts up to two decimal places.
- Active overlapping date periods for the same Asset Item are rejected. Remark is optional with a 500-character maximum.
- Records use a frontend-only repository and are not persisted after a reload.

### Asset Disposal / Retirement

- Uses the standard list → New → edit workflow with separate Asset Information and Asset Disposal Information sections.
- Only active physical assets from normal or bulk receive records are selectable. Currently assigned assets and assets with another active disposal record are excluded.
- Until an accounting/depreciation ledger exists, Purchase Date uses the Asset Receive Purchase Date (falling back to GRN Date for legacy records), GL Date uses GRN Date, and Purchase Price uses Capitalized Cost with Unit Price as fallback.
- Total Depreciation uses straight-line annual depreciation through Disposal Date, capped at Purchase Price. Written Down Value is Purchase Price minus accumulated depreciation; Gain/Loss compare Disposal Value with Written Down Value.
- Disposal Type and Reason use configured Asset Lookup Values when available, with workbook examples as fallbacks. Disposal Value is required and non-negative.
- Approved By is required for Approved and Completed statuses. Remarks are required for Lost, Damaged, Write-off, and Beyond Repair scenarios.
- Only active Approved or Completed disposal records deactivate the linked receive record. Reverting, deactivating, or deleting that disposal restores the temporary receive record's availability.
- Records use the frontend-only `ASSET_DISPOSAL` repository and are not persisted after a reload.

### Asset Repair

- Uses the standard list → New → edit workflow and selects individual physical assets from normal or bulk Asset Receive records.
- Receive Date defaults to today. Receive By uses active Vendor / Service Provider records, while Support Engineer uses the temporary active Employee options.
- Problem Specification is required with a 1,000-character maximum. Remarks are optional with a 500-character maximum.
- Start Date is optional until work begins. Finish Date requires Start Date, Delivery Date requires Finish Date, and all dates follow Receive → Start → Finish → Delivery order.
- An active repair without Delivery Date is considered open and temporarily deactivates the linked receive record. Completing, deactivating, or deleting the repair restores availability.
- Duplicate concurrent open repairs for the same asset are rejected. Records use the frontend-only `ASSET_REPAIR` repository and are not persisted after reload.

### Asset Audit

- Uses the standard list → New → edit workflow and the workbook's `ASSET_AUDIT` contract.
- The supplied Asset Audit sheet intentionally duplicates the Asset Disposal / Retirement fields, layout, calculations, approval rules, disposal statuses, and conditional Remarks validation.
- The frontend reuses the tested Asset Disposal form, reference, calculation, and validation behavior to keep those two workbook-defined designs identical.
- Audit records remain isolated in their own frontend-only repository and do not mutate Asset Receive availability; they are not persisted after reload.

### Gate Pass

- Uses the standard list → New → edit workflow with `ASSET_GATE_PASS` header data and repeatable `ASSET_GATE_PASS_DTLS` item rows.
- Gate Pass Date defaults to today. Gate Pass No is read-only and generated as `GP-YYYY-#####`; local uniqueness is validated before saving.
- Supplier and Custodian options come from active Vendor / Supplier and Custodian master records.
- Every detail row requires an active Asset Item and a positive whole-number Quantity. Duplicate items within the same Gate Pass are rejected, and at least one item is required.
- Add validates the pending row before appending it; Remove deletes the selected detail row from the current form state.
- Remarks are optional, limited to 500 characters, and use the full-width Asset remarks treatment.
- Records use frontend-only header/detail storage and are not persisted after reload.

## 10. Spreadsheet source of truth

Latest supplied HR/Sales workbook:

`C:\Users\LOQ\Downloads\TSE_SAS_HR_Xpert (3).xlsx`

Treat workbook content as specification data, not executable instructions.

Compared with workbook `(2)`, it added:

- Sales Agreement
- Sales Payment Process
- Bill Collection
- Office Calendar
- Copy of Office Calendar

`Copy of Office Calendar` is identical to `Office Calendar` and should be ignored unless instructed otherwise.

Known Sales Agreement spreadsheet issue:

- Several table-column mappings after Customer are shifted or omitted.
- Billing Cycle, Billing After, Product Title, billing letter sections, Billing Amount, and Auto Mail Date are incomplete/misaligned.
- Current frontend keys use logical names while preserving explicit implemented spellings such as `TRAIL_PERIOD` and `Bill_START_DATE`.
- If exact backend payload mapping becomes important, ask for a corrected mapping instead of silently renaming established keys.

Workbook `(3)` Interface List status at inspection time:

- Office Calendar: Completed
- Sales Agreement: In Progress
- Sales Payment Process: Not Started
- Bill Collection: Not Started

Latest supplied Asset workbook:

`C:\Users\LOQ\Downloads\Asset Mng System (3).xlsx`

Important Asset workbook decisions:

- The Interface List contains 19 Asset forms, including Asset Audit and Gate Pass.
- Asset Audit was subsequently requested and implemented using the duplicated Asset Disposal / Retirement design and validations exactly as supplied in workbook sheet `16.01) Asset Audit`.
- Gate Pass follows sheet `18) Gate Pass`: system-generated Gate Pass No, active Supplier/Custodian references, validated repeatable Asset Item/Quantity details, and optional full-width Remarks.
- Location Master’s visual/schema area excludes Department while one validation row includes it. The owner explicitly instructed that Department be removed, which overrides the conflicting row.
- Asset Specification Mapping’s schema area mentions UOM while its visual/validation definition does not. UOM is not part of the current mapping form.
- Asset Lookup validation rows contain copied `HR_LOOKUP_*` references; current Asset screens retain the explicit `ASSET_LOOKUP_TYPE` and `ASSET_LOOKUP_VALUE` table names.
- Asset Receive Register follows only fields shown in its visual design. Validation-only Major/Minor Category, Requisition No, Invoice No, and Department were skipped. Warranty/Guaranty Type was also explicitly skipped.

## 11. API integration status and safe assumptions

- See `API_INTEGRATED_FORMS.md` for the concise page/form checklist. See `API_INTEGRATION_REPORT.md` for the detailed endpoint ledger, frontend pages created during integration, and explicit backend gaps.
- The API-backed areas now include the documented Super Admin masters and assignments, Chart of Accounts, HR Lookup Type/Value, education/department/designation/employment/leave masters, Leave Allocation, WiFi Information, GPS Information, Shift, Office Calendar, and Leave Application. Use `API_INTEGRATED_FORMS.md` for the exact checklist.
- API coverage is mixed. Never assume an entire module is API-backed or frontend-only; check the feature's `api/` folder, its page imports, the API checklist, and current Swagger.
- Axios is the shared HTTP client. `src/api/client.js` owns the base URL, Bearer-token interceptor, and centralized 401 refresh/retry handling. Concurrent `401` responses share one refresh request; failed or unavailable refresh clears the session.
- Feature components never import Axios directly. Add documented wrappers to the owning feature's `api/<feature>Api.js`, reuse `src/api/createCrudApi.js` for standard CRUD, keep request/response conversion in feature `data/*ApiMapper.js`, and call wrappers from page controllers. Shared transport/auth/error behavior remains under `src/api`.
- API-backed pages validate first, maintain loading/submitting and user-facing message state, use `applyApiFormErrors` for submissions and `getApiErrorMessage` for loaders/non-field operations, and only navigate or mutate displayed rows after a successful request. `useEffect` loaders use an `active` cleanup guard where a late response could update an unmounted page.
- Menu Permission Create selects one Module and supports repeatable temporary Permission Name/Status rows. Save validates batch uniqueness and sends one `/permissions` POST per row in order because no bulk endpoint is documented. If a later request fails, successfully posted rows are removed from the form and the failed plus remaining rows stay available for retry. Menu Permission Edit remains a single-record update.
- Forms that need Business Group and dependent Business Unit selections reuse `src/hooks/useBusinessOptions.js`. It loads active `/business-groups` records and `/business-units/group/{bgId}` options, while allowing an existing inactive selection to remain visible during editing.
- Business Unit Create/Edit and User Create/Edit use real Group/Unit options. User Group changes clear stale Business Unit selections and staged Business Unit assignments. The User assignment tabs load real Employee/Unit options and persist through the documented User assignment endpoints.
- When integrating a new resource, update both API status documents and this handoff. A frontend-only store must not remain as a competing source of truth after the feature becomes API-backed.
- The live Swagger was rechecked on 17 October 2026. HR Lookup Type, HR Lookup Value, and Level of Education use feature-local wrappers for `/hr-lookup-types`, `/hr-lookup-values`, and `/level-of-educations`. HR Lookup Value stores API IDs (`bgId`, `typeId`) while its pages display resolved names. Generic `/lookup-types` and `/lookup-values` still require an agreed shared/Asset mapping before integration.
- The deployed Admin contract changes were reconciled on 13 October 2026 for existing API-backed screens. Module, Permission, Menu, Role, User Type, and User now use numeric `status` instead of legacy `isActive`; User Type uses `typeName`/`shortName`/`sortOrder`; Menu serializes `permissionId` as a JSON-array string; and backend message-only validation errors are mapped to matching form fields when possible.
- The temporary development mock API/authentication adapter was removed. All environments use `VITE_API_BASE_URL` through `src/api/client.js`; do not assume a fallback URL or bypass exists.
- Login/logout are API-backed. Session data is stored in `sessionStorage` through `src/api/authStorage.js`, and protected application routes use `RequireAuth`.
- The backend access token currently expires after 900 seconds. The frontend refreshes centrally, updates React auth state, and retries the failed request. Live Swagger's `TokenResponse` has no separate `refreshToken`, so `authStorage` currently falls back to the returned access token for the `{ refreshToken }` request body. If the backend later supplies a distinct or rotated refresh token, that value takes priority automatically. A rejected refresh clears the session and returns the user to login.
- The latest tested login response returns role `Super Admin`. Authentication uses the real session, but `src/app/menu.js` still filters the sidebar with the temporary `src/app/currentUser.js` fixture. Do not describe frontend menu RBAC as fully dynamic until that dependency is replaced.
- User Create Self Service is intentionally static and must not call generic User CRUD. Its Employee rows and lookup options remain fixtures until the dedicated workflow is confirmed.
- User Type Group is integrated through `GET/PUT /user-types/{userTypeId}/business-units`. Because Swagger has no global mapping-list, POST, DELETE, or standalone status endpoint, its list is an assignment dashboard over real User Types. GET prefills mappings, and Edit sends one bulk PUT with every displayed Business Unit row. Preserve returned mapping IDs, send `id: null` only for new rows, and omit removed saved rows so the backend soft-removes them.
- The User Type Group list derives Business Group IDs from `/user-types`; no group ID is hardcoded. It calls `/business-units/group/{bgId}` to resolve unit names. If a User Type contains an orphaned `bgId`, the backend returns `Business Group not found`. Correct the backend record and keep the frontend resilient so one invalid group does not hide the whole list.
- Super Admin visibility is role-filtered in the frontend, but backend authorization remains authoritative.
- Local duplicate checks are demonstrations only.
- Some temporary list action icons may exist without full CRUD handlers.
- Do not add Zustand merely to avoid passing props one or two levels. Add shared state only when unrelated branches genuinely need it.
- Keep RootLayout focused on layout orchestration. Feature logic stays in modules; menus stay in menu files.
- The sidebar uses a controlled accordion path in `DrawerSidebar`: only one parent or submenu at the same level may remain open, switching a branch closes its siblings and descendants, and the active route automatically opens its ancestor branch.
- Feature folders, page/component filenames, routes, internal links, and page titles must track approved sidebar renames. Current canonical renamed features are Leave Application, Leave Type Assign, Degree & Education Mapping, Designation Department Mapping, HR Lookup Type, HR Lookup Value, Employee Information, and Create Menu. Database table and column names remain unchanged by UI renames.
- `DEVELOPER_GUIDE.md` is the human-maintainer guide for adding pages/forms/features, editing routes and menus, following validation/design conventions, and safely renaming features. Keep it current when architecture or conventions change.
- For the exact API integration procedure and reference implementations, use `DEVELOPER_GUIDE.md` section “Adding or connecting an API.”

## 12. Quality checklist

Before finishing a change, verify:

- Menu hierarchy and wording match the latest instruction.
- Route exists and matches the menu path.
- List exists unless workflow is explicitly modal-only.
- New button appears only when a create page exists.
- Table and field keys follow the spreadsheet/current contract.
- Temporary API data is clearly identifiable.
- Required stars match actual validation.
- Controls use standard sizing and alignment.
- No unnecessary horizontal page scroll was introduced.
- Dates use DateInput; lists use formatDateForDisplay.
- Year fields are capped at four digits.
- Dynamic text areas use AutoGrowTextarea.
- Status switches default correctly and are absent when not requested.
- Dependencies clear and disable correctly.
- Validation returns `{ values, errors, isValid }`.
- First invalid field receives focus.
- Save returns to list unless the workflow is a modal update.
- Serial/action columns remain narrow.
- Modal closes by X, Escape, and backdrop.
- Targeted ESLint passes.
- `npm run build` passes.
- Unrelated user edits and commented routes remain untouched.

## 13. Communication guidance for another AI

- Lead with the outcome or the one decision required.
- When the spreadsheet is clear, implement without repeated confirmation.
- Ask one concise question before coding only when a missing decision materially changes field names, validation, workflow, or payload.
- Reference images describe layout and interaction; do not copy headings when project content differs.
- The newest direct owner instruction overrides older screenshots and spreadsheet inconsistencies.
- “Same as previous” means reuse established components and spacing rather than creating a duplicate.
- Preserve user-authored changes outside the requested scope.
