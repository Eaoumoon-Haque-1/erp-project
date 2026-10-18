# Cloud ERP Frontend

React/Vite frontend for the Cloud ERP project. The application is organized by business module (`super-admin`, `hris`, `asset`, `procure-to-pay`, `accounts`, and `sales`) and uses shared page, form, table, date, modal, and navigation components.

## Start the project

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

The API root is configured through `VITE_API_BASE_URL` in `.env`. The shared Axios client always calls that real backend; the temporary authentication/API bypass and in-browser mock adapter have been removed. A missing API root stops the application with an explicit configuration error.

## Verify changes

```bash
npm run lint
npm run build
```

## Before adding or changing a feature

Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md). It explains:

- where pages, forms, validation, menus, and routes belong;
- how frontend-only repositories are isolated while an API is unavailable;
- how to add list/create/edit workflows;
- how menu links and route paths stay synchronized;
- how table/column names, dates, years, uploads, and temporary API data are handled;
- how to add an API wrapper, DTO mapper, async page state, and backend error handling;
- which shared components and CSS classes should be reused;
- the checklist for safely renaming or moving a feature.

## Project documentation

- `DEVELOPER_GUIDE.md`: day-to-day feature structure, routes, forms, validation, shared components, and verification.
- `PROJECT_AI_HANDOFF.md`: product history, current module behavior, workbook decisions, table-name map, and finalized design rules.
- `API_INTEGRATED_FORMS.md`: concise checklist of API-backed and frontend-only screens.
- `API_INTEGRATION_REPORT.md`: detailed API coverage, backend gaps, and integration constraints.

API coverage is mixed across the project. Always check `API_INTEGRATED_FORMS.md` before assuming a screen is API-backed or frontend-only. Frontend-only repositories reset when the application reloads and must not be treated as persisted backend data.
