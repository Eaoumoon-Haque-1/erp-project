# Developer Guide

This guide explains how to extend and maintain this frontend without depending on an AI assistant.

## 1. How the application is organized

The important folders are:

```text
src/
  api/
    client.js          Shared Axios instance and Bearer/401 interceptors
    createCrudApi.js   Shared CRUD wrapper factory used by feature APIs
    authApi.js         Login, logout, and future refresh calls
    authStorage.js     Expiring sessionStorage token persistence
  app/
    router.jsx          Combines route arrays from every business module
    menu.js             Combines and role-filters sidebar menu arrays
    currentUser.js      Temporary role/business-group authorization fixture
  auth/
    AuthProvider.jsx    React authentication state and actions
    useAuth.js          Auth context consumer hook
  components/
    shared/             Reusable page, list, modal, date, and form helpers
    shared_layout/      Navbar, sidebar, menu groups, and footer
    ui/                 Small generic UI components
  layouts/
    RootLayout.jsx      Application shell and Outlet for child routes
  modules/
    accounts/
    asset/
    hris/
    procure-to-pay/
    sales/
    super-admin/
  utils/
    dateFormat.js       ISO storage and day/month/year display conversion
  index.css             Shared ERP design classes and feature-specific styles
```

Each normal feature should use this structure:

```text
feature-name/
  api/
    featureNameApi.js
  components/
    FeatureNameForm.jsx
  pages/
    FeatureNameList.jsx
    FeatureNameCreate.jsx
    FeatureNameEdit.jsx       Only when an edit workflow exists
    FeatureNameView.jsx       Normal for API-backed CRUD
  validation/
    featureNameValidation.js
  data/
    featureNameApiMapper.js   Request/response conversion
    featureNameOptions.js     Optional reference-data helpers
```

Responsibilities:

- `api/` owns endpoint paths and HTTP calls. Use the shared Axios client or `createCrudApi`.
- `pages/` owns state, navigation, loaders, submit/reset behavior, and API orchestration.
- `components/` renders fields and receives values/errors/callbacks through props.
- `validation/` owns the table constant, initial values, normalization, and client validation. Do not keep API-backed options here.
- `data/` owns API mappers, option derivation, and other pure feature helpers.
- `menu.js` owns sidebar labels and links.
- `routes.jsx` maps URL paths to page components.

## 2. Adding a new feature

Use this order so links are never left half-configured:

1. Choose the final visible feature name and kebab-case URL/folder name.
2. Create the feature folders and files.
3. Add the table constant and initial values in validation.
4. Build the form component.
5. If Swagger provides an API, add the feature API wrapper and mapper before wiring pages.
6. Build list, create, edit, and view pages for the operations the API actually supports.
7. Add the route entries to the module's `routes.jsx`.
8. Add the sidebar item to the module's `menu.js`.
9. Check that every List/New/Edit/View link uses the same canonical path.
10. Run focused ESLint and `npm run build`.

### View-page audit section

Every new API-backed View page must end with a section titled **Audit Information**.
Show only these audit fields when they are returned by the GET API:

- Created By
- Created At
- Updated By
- Updated At

Use a returned display name when the API provides one. If the API only returns a user or employee ID,
show the ID with a clear label; do not invent a name. Format returned dates consistently with the rest
of the project. Omit fields that are not present in the response. Do not add Submitted At, Status, or
other lifecycle fields to this audit section unless the product owner changes this requirement.

Naming example:

```text
Visible name:  Leave Application
Folder:        leave-application
Components:    LeaveApplicationForm, LeaveApplicationCreate, LeaveApplicationList
Route:         /hris/hris-forms/leave-application
```

Do not rename database table or column identifiers merely because a visible label changes.

## 3. Adding a sidebar item

Edit the correct module menu:

- `src/modules/super-admin/menu.js`
- `src/modules/hris/menu.js`
- `src/modules/sales/menu.js`
- `src/modules/accounts/menu.js`
- `src/modules/asset/menu.js`
- `src/modules/procure-to-pay/menu.js`

Leaf item shape:

```js
{
  label: "Office Calendar",
  key: "office-calendar",
  path: "/hris/attendance-settings/office-calendar",
}
```

Rules:

- `label` is the visible sidebar name.
- `key` must be unique among its siblings and should match the feature slug.
- `path` is absolute and therefore starts with `/`.
- A group uses `children` and normally has no `path`.
- Use `allowedRoles` when the entire branch is restricted.
- Adding a menu item does not create a route; both menu and route must be updated.

The sidebar is a controlled accordion. Only one branch at each level remains open, and the active route opens its ancestor branch automatically.

## 4. Adding routes

Module route entries are relative to the root layout, so they do not begin with `/`:

```jsx
import OfficeCalendarList from "./office-calendar/pages/OfficeCalendarList";
import OfficeCalendarCreate from "./office-calendar/pages/OfficeCalendarCreate";

export const hrisRoutes = [
  {
    path: "hris/attendance-settings/office-calendar",
    element: <OfficeCalendarList />,
  },
  {
    path: "hris/attendance-settings/office-calendar/create",
    element: <OfficeCalendarCreate />,
  },
];
```

Link/navigation props use the absolute version:

```jsx
createTo="/hris/attendance-settings/office-calendar/create"
listTo="/hris/attendance-settings/office-calendar"
navigate("/hris/attendance-settings/office-calendar")
```

Current canonical HRIS route groups are:

- `/hris/employee-settings/...`
- `/hris/hr-lookup-settings/...`
- `/hris/leave-settings/...`
- `/hris/attendance-settings/...`
- `/hris/hris-forms/...`

Admin sales features use `/admin/...`. Super Admin features use `/super-admin/...`.
Accounts features use `/accounts/...`. Asset features use `/asset/...`.
Procure to Pay features use `/procure-to-pay/...`.

## 5. Building a list page

Use `ListPage` for the standard heading, New button, filters, search, table, serial number, and pagination.

```jsx
const filters = [
  {
    key: "STATUS",
    label: "Search by Status",
    placeholder: "--Search by Status--",
    options: [
      { label: "Active", value: "1" },
      { label: "Inactive", value: "0" },
    ],
  },
];

const columns = [
  { key: "NAME", label: "Name" },
  {
    key: "STATUS",
    label: "Status",
    render: (value) => (String(value) === "1" ? "Active" : "Inactive"),
  },
];

<ListPage
  title="Feature List"
  createLabel="New"
  createTo="/module/group/feature/create"
  filters={filters}
  columns={columns}
  rows={rows}
  renderActions={(row) => (
    <ListRowActions row={row} onEdit={handleEdit} />
  )}
/>
```

`ListRowActions` disables an action when its handler is missing. Pass a real handler only when that action actually works.

## 6. Building a create form

Use `FormPage` as the create/edit shell and keep field rendering in a separate form component.

The page owns:

- `values` and `errors` state;
- `handleChange`, `handleSubmit`, and `handleReset`;
- validation calls;
- focus after an error/reset;
- navigation after a successful save;
- future API requests.

Standard change handler:

```js
const handleChange = (event) => {
  const { name, type, value, checked } = event.target;
  const nextValue = type === "checkbox" ? (checked ? "1" : "0") : value;

  setValues((current) => ({ ...current, [name]: nextValue }));
  setErrors((current) => ({ ...current, [name]: undefined }));
};
```

Standard submit flow:

```js
const result = validateFeature(values);
setValues(result.values);
setErrors(result.errors);

if (!result.isValid) {
  requestAnimationFrame(() =>
    document.querySelector('[aria-invalid="true"]')?.focus(),
  );
  return;
}

// Replace this navigation-only demonstration with an awaited API request later.
navigate(listPath);
```

`FormPage` supports optional `onDraft`, `draftLabel`, and `submitLabel` props for workflows such as Leave Application.

### Confirmations, results, and field errors

Operation alerts are centralized in `src/components/shared/actionAlerts.js`. Do not import SweetAlert2 in feature files.

- `FormPage` automatically confirms create, update, and draft submissions and shows the success result.
- `ListRowActions` automatically confirms delete/status operations and shows the result.
- A custom form must use `ActionForm` from `src/components/shared/ActionForm.jsx` instead of a raw `<form>`.
- A special button-driven operation must use `runConfirmedAction`; do not add `window.confirm` or feature-specific alert text.
- Client validation remains field-keyed. Required and other field errors render below the exact control in red before an operation is sent.
- For API forms, call `applyApiFormErrors(error, setErrors, fallback, fieldMap)` when the backend may return field errors. Use `fieldMap` when backend property names differ from form keys.
- `getApiErrorMessage` remains appropriate for list/load failures and operations without editable fields. When no confirmed operation is active, it opens the centralized error alert automatically.
- Do not render general success/error text inside `FormPage`, `ListPage`, or a custom card. The old top-right `erp-form-message` notification pattern is intentionally not used. Only field-specific validation stays inline.

Change shared wording, colors, or alert behavior only in `actionAlerts.js` and the related `erp-action-alert*` rules in `src/index.css`.

## 7. Validation and backend payloads

Use database column names as form keys when the spreadsheet provides them:

```js
export const FEATURE_TABLE = "EXACT_TABLE_NAME";

export const initialFeatureValues = {
  BU_ID: "",
  FEATURE_NAME: "",
  STATUS: "1",
};
```

Every validation function should:

1. normalize strings/numbers first;
2. build a field-keyed `errors` object;
3. return normalized values even when invalid;
4. return `isValid`.

```js
return {
  values: normalizedValues,
  errors,
  isValid: Object.keys(errors).length === 0,
};
```

Use string flags: `"1"` for active/yes and `"0"` for inactive/no. Database-wide uniqueness must be checked by the backend; the frontend can only compare records already loaded into the browser.

When a backend resource is unavailable, isolate temporary records behind a feature store such as `data/featureStore.js`. Export list/get/create/update/remove functions and return cloned records so pages do not mutate repository state accidentally. Add a file comment stating that this boundary must be replaced when endpoints are documented.

For dependent dropdowns, keep filtering and derived-field logic in `data/` helpers. When a parent value changes, clear child selections and fields derived from them.

Some workflows update the availability of a record owned by another feature. Keep that synchronization inside the repository boundary, not in form components. Current examples are:

- Asset Return updates `ACTUAL_RETURN_DATE` on the linked Asset Assignment.
- Approved/Completed Asset Disposal deactivates the linked Asset Receive record.
- Deleting, deactivating, rejecting, or reverting those workflow records restores the linked temporary state when appropriate.

When replacing these stores with APIs, move the same rules to documented backend transactions; do not leave cross-resource consistency dependent on page navigation.

## 8. Dates, years, and numbers

- Store/send dates as ISO `YYYY-MM-DD` unless the API contract says otherwise.
- Display dates as `DD/MM/YYYY` with `formatDateForDisplay` from `src/utils/dateFormat.js`.
- Use the shared `DateInput` instead of implementing date parsing repeatedly. It supports ISO `min`/`max`, `readOnly`, and `disabled` constraints while displaying `DD/MM/YYYY`.
- Year inputs use `maxLength={4}` and validation such as `/^\d{4}$/`.
- Do not apply one numeric rule globally. Sort order may accept positive fractions, while years, counts, days, and attendance minutes often require whole numbers.

## 9. Design and shared components

Reuse these before adding new CSS/components:

- `PageHeader`: page title and List/New actions.
- `FormPage`: standard form card, action row, confirmation, and result workflow.
- `ActionForm`: confirmation/result wrapper for special form layouts.
- `ListPage`: standard filtering/search/table/pagination.
- `ListRowActions`: standard View/Edit/Delete/Status buttons.
- `Modal`: centered modal behavior.
- `DateInput`: date entry/display behavior.
- `MultiSelectField`: multi-value dropdowns.
- `AutoGrowTextarea`: text area that grows to the configured limit.

Complex forms may use titled sections while retaining `erp-form-grid` inside every section. Asset Receive Register is the reference for calculated/dependent fields; Asset Transfer and Asset Disposal / Retirement are references for clear before/after or information/workflow sections.

When a long form should keep its first section visible and organize later sections as tabs, follow Employee Information and Asset Receive Register. Reuse `erp-employee-tabs`, `erp-employee-tab-list`, `erp-employee-tab`, `erp-employee-tab-active`, and `erp-employee-tab-panel`; tab buttons must use `type="button"` inside a form.

For Asset workflow forms from Asset Receive Register onward, wrap Remarks controls with `erp-asset-remarks-field` and add `erp-asset-remarks-textarea` to the textarea. This places Remarks on a new full-width row with the established larger height.

Common CSS classes live in `src/index.css`:

- `erp-form-grid`
- `erp-form-control`
- `erp-form-control-invalid`
- `erp-readonly`
- `erp-field-label`, `erp-required`, `erp-field-error`
- `erp-form-actions`
- `primary-button`, `secondary-button`
- `erp-table`, `erp-table-wrap`, `erp-number-column`

Add a named feature class for special layout rules instead of placing many inline widths in JSX.

## 10. Adding or connecting an API

Use the existing API boundary instead of importing Axios inside a feature page.

1. Confirm the endpoint, HTTP method, path/query parameters, request body, response body, status values, and authentication requirements from the current Swagger/OpenAPI document. Never infer an endpoint from a table name.
2. Add or extend `api/<feature>Api.js` inside the owning feature. Ordinary CRUD resources import `createCrudApi` from `src/api/createCrudApi.js`; resource-specific operations are named methods beside the feature wrapper. Only transport, authentication, response unwrapping, and generic CRUD construction belong in `src/api`.
3. If API camelCase fields differ from form/database-style keys, add `data/<feature>ApiMapper.js` with `map<Feature>FromApi` and `map<Feature>ToApi`. Keep backend naming out of presentational form components.
4. In the page controller, load API data with `useEffect`, keep rows/options in state, and guard late promise completion with an `active` flag in the effect cleanup.
5. Keep validation before the request. Send the normalized validation result through the mapper, not raw uncontrolled values.
6. Track `loading`/`submitting` where appropriate so duplicate requests are prevented and shared pages can show the correct state.
7. In form submissions, catch failures with `applyApiFormErrors` from `src/api/errors.js`; it maps supported backend field errors to the existing red field messages and returns the general message. Use `getApiErrorMessage` for loaders, lists, and operations without fields.
8. After create/update, navigate to the canonical list path. After delete/status changes, reload or update the list state only after the request succeeds.
9. Update `API_INTEGRATED_FORMS.md`, `API_INTEGRATION_REPORT.md`, and `PROJECT_AI_HANDOFF.md` with the new coverage and any remaining backend limitation.
10. Run focused ESLint and `npm run build`. Do not perform destructive POST/PUT/DELETE smoke tests against shared live data unless explicitly authorized.

Example wrapper pattern:

```js
import { createCrudApi } from '../../../../api/createCrudApi'

export const featureApi = createCrudApi('/features')
```

Example page flow:

```js
setSubmitting(true)
setMessage('')
try {
  await featureApi.create(mapFeatureToApi(result.values))
  navigate(listPath)
} catch (error) {
  setMessage(getApiErrorMessage(error, 'Unable to create Feature.'))
} finally {
  setSubmitting(false)
}
```

Good reference implementations:

- Simple CRUD: Business Group and Module.
- DTO mapping: User, Menu, User Type, Business Unit, and Chart of Accounts.
- Dependent API options: Create Menu and Menu Permission.
- Assignment endpoints: Role Edit, Menu Assign to Role, and Assign Role to Business Unit.
- Modal API workflow: User Create Self Service.

Frontend-only `data/*Store.js` files are temporary repository boundaries, not API integrations. When a real endpoint arrives, replace calls at that boundary or page layer; do not leave a second hidden local source of truth.

## 11. Authentication and API configuration

- `.env` must provide `VITE_API_BASE_URL`; the current backend root is not hardcoded in source.
- `src/api/client.js` is the only shared Axios client and always targets the configured real backend.
- Do not reintroduce a mock login, Axios mock adapter, Netlify proxy, or fallback backend URL unless the owner explicitly requests a new temporary strategy.
- `src/api/authStorage.js` stores the access token in `sessionStorage`; `AuthProvider` owns login/logout state and `RequireAuth` protects application routes.
- The request interceptor attaches the Bearer token. A `401` clears the session and returns the user to login.
- Frontend-only feature repositories are not an authentication bypass. Keep them isolated until matching backend endpoints are documented.

## 12. Editing or renaming an existing feature

A feature rename is not complete until all of these agree:

- sidebar label, key, and path;
- feature folder;
- component/page/validation filenames;
- imports and exported component names;
- module route paths;
- List/New/Edit/navigation links;
- visible page titles;
- feature-specific CSS class names;
- developer documentation.

Do not change spreadsheet-defined table/column identifiers unless the backend contract itself changes.

Useful audit command:

```bash
rg -n "Old Name|old-route|OldComponentName" src
```

## 13. Before finishing a change

Run:

```bash
npx eslint path/to/changed/file.jsx
npm run build
```

Then manually verify:

- sidebar navigation;
- List and New buttons;
- validation errors and focus;
- Reset behavior;
- successful save navigation;
- related-record state changes and their delete/deactivate reversal behavior;
- responsive layout without horizontal page scrolling;
- table actions are enabled only when implemented.
