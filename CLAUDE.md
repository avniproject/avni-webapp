# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

avni-webapp is the React (Vite) front-end for the Avni platform — Data Entry App, Admin App, and bulk Upload dashboard. It talks to `avni-server` over HTTP.

## Development Conventions

### Code Style

- Match the existing style of the file you're editing (Prettier-formatted, MUI components, redux + RTK or legacy reducers depending on the area).
- **Comments**: Only add when explicitly requested.

### Naming

- Prefer full domain words over abbreviations. Match identifiers used on the server: `Encounter`, `ProgramEncounter`, `ProgramEnrolment`, `ProgramExit`, `IndividualEncounterCancellation`, `ProgramEncounterCancellation`. Do not introduce shortened forms like `enc`, `enr`, `obs`.
- Constants for upload/mode values use SCREAMING_SNAKE keys and snake_case string values that match the server enum: e.g. `ENCOUNTER_MODES.CANCEL = "upload_cancelled_visits"`.
- Boolean accessors: `isX` / `hasX` / `shouldX`. Never `flag`, `status` for booleans.
- Component props that mirror server enums should keep the server's wording (`encounterUploadMode`, `programEnrolmentUploadMode`) rather than translating it (`mode`, `type`).

### Domain name clashes — surface, don't decide silently

When introducing a fixed identifier that could overlap with something the user configures — e.g. a CSV column label vs. a concept name, a mode value vs. an existing constant, a UI label vs. an existing screen — surface the clash to the user before writing code. Don't assume the org won't have a configured value that collides.

## Repository Layout (relevant for upload/import work)

- `src/upload/` — bulk Upload dashboard, mode selectors, sample download / file upload wiring.
  - `UploadDashboard.jsx` — top-level screen, owns mode state and threads it through download + upload.
  - `EncounterModes.jsx` — radio group for encounter upload modes (schedule / upload / cancel).
  - `api.js` — multipart upload + sample download HTTP calls.
  - `Types.js` — static upload type definitions (Locations, Metadata, etc.).
- `src/dataEntryApp/` — operational data entry screens.
- `src/adminApp/` — App Designer / admin screens.

## Bulk-Upload Mode Conventions

The server has two independent mode parameters on the upload pipeline:

- `encounterUploadMode` — applies when `uploadType` starts with `Encounter---` or `ProgramEncounter---`. Values: `schedule_a_visit`, `upload_visit_details`, `upload_cancelled_visits`.
- `programEnrolmentUploadMode` — applies when `uploadType` starts with `ProgramEnrolment---`. Values: `upload_enrolments`, `upload_exited_enrolments`.

Keep the two modes orthogonal — don't reuse `encounterUploadMode` for enrolment uploads. State for one must not leak into the other when the user switches upload type.

## Testing

- Unit/component tests: `npm test` (Jest).
- For UI changes to the Upload dashboard, smoke-test end-to-end against a local `avni-server`:
  download sample → fill → upload → confirm row in DB.
