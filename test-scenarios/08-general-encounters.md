# General Encounter Test Scenarios

## Overview
Browser-based functional tests for recording, editing, and cancelling general (non-program) encounters for subjects in the Avni data entry application.

---

## TS-GENC-001: Record a New General Encounter – Happy Path

**Preconditions:** User is logged in. A subject exists. A general encounter type is configured.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click **New General Visit** (or the general encounter button).
3. Select the encounter type (e.g., "Encounter1").
4. The encounter form opens showing the **Visit Date** field.
5. Verify or set the visit date.
6. Fill in required form elements on all pages.
7. Click **Next** to progress through all pages.
8. Review the **Summary & Recommendations** page.
9. Click **Save**.

**Expected Result:** The general encounter is recorded. The encounter appears in the subject's encounter history. A success notification is shown.

---

## TS-GENC-002: Visit Date Cannot Be in the Future

**Preconditions:** A general encounter form is open.

**Steps:**
1. Open the general encounter form.
2. Set the **Visit Date** to a future date (e.g., 11/01/2050).

**Expected Result:** A validation error is displayed: "Encounter date cannot be in future". The form does not advance past the first page until a valid date is entered.

---

## TS-GENC-003: Edit Existing General Encounter

**Preconditions:** A general encounter has been recorded for a subject.

**Steps:**
1. Navigate to the subject's dashboard.
2. Open the encounter history.
3. Click **Edit** on an existing general encounter.
4. Modify one or more fields.
5. Navigate to the Summary page and save.

**Expected Result:** The encounter is updated. The encounter history reflects the changes. A success notification is shown.

---

## TS-GENC-004: General Encounter – Validation Error Blocks Navigation

**Preconditions:** The general encounter form contains a validated form element.

**Steps:**
1. Open the general encounter form.
2. Enter an invalid value (e.g., 123) in the validated field.
3. Observe the validation error.
4. Click **Next**.

**Expected Result:** The validation error is shown (e.g., "123 is invalid"). The form does not advance to the next page.

---

## TS-GENC-005: General Encounter – FEG Hidden by FEG-Level Rule

**Preconditions:** Registration modifier is set to "Hide first FEG".

**Steps:**
1. Set the registration modifier to **"Hide first FEG"**.
2. Open or edit the general encounter form.

**Expected Result:** The first FEG page is absent. The form starts at the Visit Date then the second FEG. Navigation forward and backward correctly skips the first FEG.

---

## TS-GENC-006: General Encounter – FEG Hidden by All FE-Level Rules

**Preconditions:** All FEs in the first FEG are hidden via modifier.

**Steps:**
1. Set modifiers to hide all FEs in the first FEG.
2. Open the general encounter form.

**Expected Result:** The first FEG page is not shown. Navigation proceeds from Visit Date to the second FEG. Navigating backward from the second FEG returns to the Visit Date page.

---

## TS-GENC-007: General Encounter – Single FE Hidden in a FEG

**Preconditions:** A modifier hides one specific FE within the first FEG.

**Steps:**
1. Set the modifier to hide "First FE of first FEG".
2. Open the general encounter and navigate to the first FEG page.

**Expected Result:** The first FEG page is shown with the hidden FE absent. "Last FE of first FEG" and other FEs are still visible.

---

## TS-GENC-008: General Encounter – Skip Logic in Same Form (FEG Hidden)

**Preconditions:** The general encounter form itself contains a field that triggers hiding of another FEG.

**Steps:**
1. Open the general encounter form.
2. Select the option that hides the second FEG in the current form.
3. Navigate forward through the form.

**Expected Result:** The second FEG page is skipped entirely. Navigation goes from the first FEG to the last FEG. Backward navigation also skips the hidden second FEG.

---

## TS-GENC-009: General Encounter – Skip Logic Hides FE in Same FEG

**Preconditions:** A FE in the encounter form hides another FE in the same group when selected.

**Steps:**
1. Open the general encounter form.
2. Select an option that hides "Last FE of first FEG".
3. Observe the first FEG page.

**Expected Result:** "Last FE of first FEG" disappears from the current page immediately. The FEG is still shown with the remaining visible FEs.

---

## TS-GENC-010: General Encounter – Skip Logic Hides FE in Another Group

**Preconditions:** A FE hides a FE in a different FEG when selected.

**Steps:**
1. Open the general encounter form.
2. Select an option that hides "First FE of second FEG".
3. Navigate to the second FEG page.

**Expected Result:** "First FE of second FEG" is absent. "Last FE of second FEG" and other fields in that group remain visible.

---

## TS-GENC-011: General Encounter – All Form Elements Hidden

**Preconditions:** All FEG-hiding modifiers are active on the registration.

**Steps:**
1. Set all FEG-hiding modifiers on the registration.
2. Open the general encounter form.

**Expected Result:** Only the **Visit Date** static field is visible. Clicking **Next** goes directly to **Summary & Recommendations**. Backward navigation returns to the Visit Date page.

---

## TS-GENC-012: Empty General Encounter Form (No Custom FEGs)

**Preconditions:** A general encounter type with no custom FEGs is configured ("Empty Encounter").

**Steps:**
1. Start a new general encounter using the empty encounter type.

**Expected Result:** Only the **Visit Date** field is shown. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-GENC-013: Navigate Forward and Backward Through General Encounter Form

**Preconditions:** The general encounter form has multiple pages.

**Steps:**
1. Open the general encounter form.
2. Navigate forward through all pages (Visit Date → First FEG → Second FEG → Last FEG → Summary).
3. Navigate backward from Summary to the first page.

**Expected Result:** Navigation in both directions works correctly. Data entered on each page is preserved. No pages are skipped inadvertently.

---

## TS-GENC-014: View Recorded General Encounter (Read-Only)

**Preconditions:** A general encounter has been recorded.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click on a completed general encounter in the history.

**Expected Result:** The encounter details are displayed in a read-only view with all recorded field values and the visit date. An edit option is available if the user has edit privileges.
