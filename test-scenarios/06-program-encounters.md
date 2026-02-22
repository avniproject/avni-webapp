# Program Encounter (Visit) Test Scenarios

## Overview
Browser-based functional tests for recording program encounters (visits) for enrolled subjects, including new visits, editing existing visits, and form wizard behaviour during program encounter flows.

---

## TS-PENC-001: Record a New Program Encounter – Happy Path

**Preconditions:** User is logged in. A subject is enrolled in a program with encounter types configured.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the active program enrollment.
3. Click **New Visit** or the new program encounter button.
4. Select the encounter type (e.g., "ProgramEncounter1").
5. The encounter form opens on the first page with **Visit Date**.
6. Verify or set the visit date.
7. Fill in form elements on all pages.
8. Click **Next** to progress through all pages.
9. Review the **Summary & Recommendations** page.
10. Click **Save**.

**Expected Result:** The program encounter is recorded. The visit appears in the subject's program history. A success notification is shown.

---

## TS-PENC-002: Visit Date Cannot Be in the Future

**Preconditions:** User is logged in. A program encounter form is open.

**Steps:**
1. Open the program encounter form.
2. Set the **Visit Date** to a future date (e.g., 11/01/2050).

**Expected Result:** A validation error is displayed: "Encounter date cannot be in future". The form does not advance past the first page until a valid date is entered.

---

## TS-PENC-003: Edit Existing Program Encounter

**Preconditions:** A program encounter has already been recorded.

**Steps:**
1. Navigate to the subject's dashboard.
2. Open the program's visit history.
3. Click **Edit** on an existing visit.
4. Modify one or more fields.
5. Progress through all pages to the Summary page.
6. Click **Save**.

**Expected Result:** The encounter record is updated. The program history reflects the updated data. A success notification is shown.

---

## TS-PENC-004: Program Encounter – Validation Error Blocks Navigation

**Preconditions:** A form element with a validation rule is configured in the encounter form.

**Steps:**
1. Open the program encounter form.
2. Enter an invalid value (e.g., 123) in a validated field.
3. Observe the validation error.
4. Click **Next**.

**Expected Result:** The validation error message is shown (e.g., "123 is invalid"). The form does not advance to the next page. The user remains on the current page.

---

## TS-PENC-005: Program Encounter – FEG Hidden by FEG-Level Rule (Cross-Form)

**Preconditions:** Registration modifier is set to "Hide first FEG".

**Steps:**
1. Set subject registration modifier to **"Hide first FEG"**.
2. Open or create a program encounter.

**Expected Result:** The first FEG page is absent from the program encounter wizard. The form starts at the Visit Date page and then proceeds to the second FEG. Navigation correctly skips the first FEG.

---

## TS-PENC-006: Program Encounter – FEG Hidden by All FE-Level Rules

**Preconditions:** All FEs in a FEG are hidden via modifier.

**Steps:**
1. Set the modifier to hide all FEs in the first FEG ("Hide first FE of first FEG" and "Hide last FE of first FEG").
2. Open the program encounter form.

**Expected Result:** The first FEG page is not shown in the encounter wizard. Navigation proceeds from Visit Date to the second FEG.

---

## TS-PENC-007: Program Encounter – Single FE Hidden in a FEG

**Preconditions:** Registration modifier causes only one FE in a FEG to be hidden.

**Steps:**
1. Set modifier to "Hide first FE of first FEG" (or "Hide last FE of first FEG").
2. Open the program encounter form.
3. Navigate to the first FEG page.

**Expected Result:** The FEG page is still shown (because at least one FE is visible). Only the specified FE is absent. All other FEs are present.

---

## TS-PENC-008: Program Encounter – Skip Logic Within Current Form (FEG Hidden)

**Preconditions:** The program encounter form contains a FE that, when selected, hides another FEG in the same form.

**Steps:**
1. Open the program encounter form.
2. On the first FEG page, select the option that hides the second FEG.
3. Navigate forward.

**Expected Result:** The second FEG is skipped. The form jumps to the last FEG or Summary. Navigating backward also skips the second FEG.

---

## TS-PENC-009: Program Encounter – Skip Logic Within Current Form (FE Hidden in Same Group)

**Preconditions:** The program encounter form has a FE that hides another FE in the same FEG.

**Steps:**
1. Open the program encounter form.
2. On the first FEG page, select an option that hides "Last FE of first FEG".
3. Observe the current page.

**Expected Result:** The "Last FE of first FEG" field disappears from the current page. Other fields remain visible. The hidden field does not reappear on forward/backward navigation.

---

## TS-PENC-010: Program Encounter – Skip Logic Hides FE in Another Group

**Preconditions:** The program encounter form has a FE that hides a FE in a different FEG on the same form.

**Steps:**
1. Open the program encounter form.
2. Select an option that hides "First FE of second FEG".
3. Navigate forward to the second FEG page.

**Expected Result:** "First FE of second FEG" is hidden on the second FEG page. "Last FE of second FEG" and other fields in that group are still visible.

---

## TS-PENC-011: Program Encounter – All Form Elements Hidden

**Preconditions:** All FEG-hiding modifiers are set via registration.

**Steps:**
1. Set all FEG-hiding modifiers on the registration.
2. Open the program encounter form.

**Expected Result:** Only the **Visit Date** static field is visible. Clicking **Next** goes directly to **Summary & Recommendations**. Backward navigation returns to the Visit Date page.

---

## TS-PENC-012: Empty Program Encounter Form (No Custom FEGs)

**Preconditions:** An encounter type with no custom FEGs is configured.

**Steps:**
1. Create a new encounter using the "Empty Program Encounter" type.

**Expected Result:** Only the **Visit Date** field is shown. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-PENC-013: Complete a Scheduled Visit

**Preconditions:** A scheduled (planned) program visit exists for the subject.

**Steps:**
1. Navigate to the subject's dashboard.
2. Find the scheduled visit in the program section.
3. Click to complete the scheduled visit.
4. Fill in the required fields.
5. Save the encounter.

**Expected Result:** The scheduled visit is completed and marked as done. It no longer appears in the upcoming/scheduled visits list. The completed visit appears in the program history.

---

## TS-PENC-014: View Completed Program Encounter

**Preconditions:** A program encounter has been recorded.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click on the completed program visit in the program history.

**Expected Result:** The read-only view of the program encounter is displayed, showing all recorded data and the visit date. Options to edit the encounter are available if the user has edit privileges.
