# Avni Web App – Functional Test Scenarios

This directory contains browser-based functional test scenarios for the Avni web application. These scenarios describe end-to-end tests intended to be run against a live server instance.

## Test Scenario Files

| File | Area | # Scenarios |
|------|------|-------------|
| [01-authentication.md](01-authentication.md) | Authentication & Login | 10 |
| [02-subject-registration.md](02-subject-registration.md) | Subject Registration (Individual & Group) | 12 |
| [03-subject-search-and-dashboard.md](03-subject-search-and-dashboard.md) | Subject Search & Dashboard | 10 |
| [04-program-enrollment.md](04-program-enrollment.md) | Program Enrollment | 12 |
| [05-program-exit.md](05-program-exit.md) | Program Exit (Unenrollment) | 10 |
| [06-program-encounters.md](06-program-encounters.md) | Program Encounters (Visits) | 14 |
| [07-encounter-cancellation.md](07-encounter-cancellation.md) | Encounter Cancellation | 13 |
| [08-general-encounters.md](08-general-encounters.md) | General Encounters | 14 |
| [09-form-wizard-rules.md](09-form-wizard-rules.md) | Form Wizard & Skip Rules | 20 |
| [10-relationships-and-groups.md](10-relationships-and-groups.md) | Relationships & Group Membership | 10 |
| [11-admin-user-management.md](11-admin-user-management.md) | Admin – User Management | 10 |
| [12-admin-organisation-and-locations.md](12-admin-organisation-and-locations.md) | Admin – Organisation & Locations | 10 |
| [13-admin-subject-program-config.md](13-admin-subject-program-config.md) | Admin – Subject Types, Programs, Encounter Types | 11 |
| [14-app-designer.md](14-app-designer.md) | App Designer (Form Designer) | 15 |
| [15-reporting-and-export.md](15-reporting-and-export.md) | Reporting & Data Export | 10 |
| [16-broadcast-and-news.md](16-broadcast-and-news.md) | Broadcast & News | 10 |
| [17-task-and-subject-assignment.md](17-task-and-subject-assignment.md) | Task & Subject Assignment | 10 |
| [18-translations.md](18-translations.md) | Translations Management | 10 |
| [19-media-and-attachments.md](19-media-and-attachments.md) | Media & Attachments | 9 |
| [20-home-navigation.md](20-home-navigation.md) | Home Page & Navigation | 12 |

**Total: ~237 scenarios across 20 functional areas**

---

## Scenario ID Convention

Each scenario follows the pattern `TS-<AREA>-<NNN>`:

| Prefix | Area |
|--------|------|
| `TS-AUTH-` | Authentication |
| `TS-REG-` | Subject Registration |
| `TS-SRCH-` | Subject Search |
| `TS-DASH-` | Subject Dashboard |
| `TS-ENROL-` | Program Enrollment |
| `TS-EXIT-` | Program Exit |
| `TS-PENC-` | Program Encounters |
| `TS-CNCL-` | Encounter Cancellation |
| `TS-GENC-` | General Encounters |
| `TS-WIZRD-` | Form Wizard & Rules |
| `TS-REL-` | Relationships |
| `TS-GRP-` | Group Membership |
| `TS-USRMGR-` | User Management |
| `TS-ORG-` | Organisation & Locations |
| `TS-STYPE-` | Subject Types |
| `TS-PROG-` | Programs |
| `TS-ENCTYPE-` | Encounter Types |
| `TS-WKFL-` | Workflow Configuration |
| `TS-APPD-` | App Designer |
| `TS-RPT-` | Reporting & Export |
| `TS-NEWS-` | Broadcast & News |
| `TS-ASGN-` | Assignment |
| `TS-TRANS-` | Translations |
| `TS-MEDIA-` | Media & Attachments |
| `TS-NAV-` | Home & Navigation |

---

## Scenario Structure

Each scenario follows this format:

```
## TS-<ID>: <Short Description>

**Preconditions:** What must be set up before the test starts.

**Steps:** Numbered steps to perform in the browser.

**Expected Result:** What should happen if the test passes.
```

---

## Existing Cypress Tests

The following functional areas already have Cypress automation coverage in `/cypress/integration/formWizard/`:

- `registrationFlowTest.js` – Individual registration form wizard rules
- `non-individualRegistrationFlowTest.js` – Group registration form wizard rules
- `programEnrolmentFlowTest.js` – Program enrolment form wizard rules
- `programEnrolmentExitFlowTest.js` – Program exit form wizard rules
- `programEncounterFlowTest.js` – Program encounter form wizard rules
- `ProgramEncounterCancelFlow.js` – Encounter cancellation form wizard rules
- `EncounterFlowTest.js` – General encounter form wizard rules
- `GeneralEncounterCancelFlowTest.js` – General encounter cancellation

The scenarios in `09-form-wizard-rules.md` consolidate and expand on these existing automated tests.
