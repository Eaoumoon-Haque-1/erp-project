# Project API Status - Quick Start

Last updated: 17 October 2026

This is a short entry point for the next developer or coding agent. Read these files before changing an API-backed form:

1. `DEVELOPER_GUIDE.md` - folder structure, shared components, API pattern, and verification steps.
2. `API_INTEGRATED_FORMS.md` - simple checklist of API-backed and frontend-only screens.
3. `API_INTEGRATION_REPORT.md` - endpoint coverage, backend gaps, and known contract issues.
4. `PROJECT_AI_HANDOFF.md` - detailed product decisions and special form behavior.

## Recently completed API integrations

- Leave Allocation: `/leave-allocations`
- WiFi Information: `/wifi-informations`
- GPS Information: `/gps-informations`
- Shift: `/shifts`
- Office Calendar: `/office-calendars`
- Leave Application: `/employee-leaves`

Each API-backed feature normally contains:

```text
api/          Endpoint wrapper
components/   Form presentation
data/         API mapper and reference-data helpers
pages/        List/Create/Edit/View orchestration
validation/   Initial values and client validation
```

## Important current issue

The User Type Group list gets each `bgId` from `/user-types` and then requests `/business-units/group/{bgId}`. The ID is not hardcoded. If a User Type references a deleted Business Group, the backend returns `Business Group not found` and the current list load fails. Fix the orphaned backend record and make the frontend tolerate invalid group references.

## Required verification

After code changes, run:

```bash
npm run lint
npm run build
```

Do not invent endpoints. Recheck the live Swagger before starting a new integration.
