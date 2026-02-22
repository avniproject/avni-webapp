# Encounter Cancellation Test Scenarios

## Overview
Browser-based functional tests for cancelling program encounters and general encounters in the Avni data entry application, including form wizard behaviour during cancellation flows.

---

## TS-CNCL-001: Cancel a Program Encounter – Happy Path

**Preconditions:** User is logged in. A scheduled or in-progress program encounter exists for a subject.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the program encounter in the program section.
3. Click **Cancel Visit** (or the encounter cancellation button).
4. The cancellation form opens, showing the **Cancel Date** field.
5. Verify or set the cancel date.
6. Fill in any required cancellation reason fields.
7. Click **Next** to progress through all pages.
8. Review the **Summary & Recommendations** page.
9. Click **Save**.

**Expected Result:** The encounter is cancelled. The cancelled encounter is marked with an appropriate status in the program history. A success notification is shown.

---

## TS-CNCL-002: Cancel General Encounter – Happy Path

**Preconditions:** User is logged in. A scheduled or pending general encounter exists for a subject.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the general encounter in the encounters section.
3. Click **Cancel Encounter**.
4. Fill in the cancellation form.
5. Navigate through all pages and save.

**Expected Result:** The general encounter is cancelled and marked accordingly in the encounter history. A success notification is shown.

---

## TS-CNCL-003: Cancel Program Encounter – Validation Error Blocks Navigation

**Preconditions:** The cancellation form contains a form element with a validation rule.

**Steps:**
1. Open the program encounter cancellation form.
2. Enter an invalid value (e.g., 123) in the validated field.
3. Observe the validation error message.
4. Click **Next**.

**Expected Result:** The validation error is shown (e.g., "123 is invalid"). The form does not advance past the current page.

---

## TS-CNCL-004: Cancellation Form – FEG Hidden by FEG-Level Rule

**Preconditions:** Registration modifier is set to "Hide first FEG".

**Steps:**
1. Set subject registration modifier to **"Hide first FEG"**.
2. Open the program encounter cancellation form.

**Expected Result:** The first FEG page is absent from the cancellation form. The form starts at the Cancel Date page and proceeds to the second FEG. Navigation correctly skips the first FEG in both forward and backward navigation.

---

## TS-CNCL-005: Cancellation Form – FEG Hidden by All FE-Level Rules

**Preconditions:** All FEs in the first FEG are hidden via modifier rule.

**Steps:**
1. Set modifiers to hide all FEs in the first FEG.
2. Open the program encounter cancellation form.

**Expected Result:** The first FEG page is not shown. Navigation proceeds from Cancel Date to the second FEG.

---

## TS-CNCL-006: Cancellation Form – Single FE Hidden in a FEG

**Preconditions:** A modifier hides one FE within a FEG.

**Steps:**
1. Set the modifier to hide "First FE of first FEG" (or "Last FE of first FEG").
2. Open the cancellation form and navigate to the first FEG page.

**Expected Result:** The FEG page is still shown. Only the hidden FE is absent. All other FEs in the FEG remain visible.

---

## TS-CNCL-007: Cancellation Form – Skip Logic Within Current Form (FEG Hidden)

**Preconditions:** The cancellation form contains a field that triggers hiding of another FEG.

**Steps:**
1. Open the cancellation form.
2. On the first page, select the option that hides the second FEG.
3. Navigate forward.

**Expected Result:** The second FEG is skipped. Navigation jumps from the first FEG to the last FEG. Backward navigation also skips the second FEG.

---

## TS-CNCL-008: Cancellation Form – Skip Logic Hides FE in Same Group

**Preconditions:** A cancellation form FE hides another FE in the same group when selected.

**Steps:**
1. Open the cancellation form.
2. Select an option that hides "Last FE of first FEG".
3. Observe the current page.

**Expected Result:** The "Last FE of first FEG" field is no longer visible on the page. Other fields in the group remain.

---

## TS-CNCL-009: Cancellation Form – Skip Logic Hides FE in Another Group

**Preconditions:** The cancellation form has a FE that hides a FE in a different FEG.

**Steps:**
1. Open the cancellation form.
2. Select an option that hides "First FE of second FEG".
3. Navigate to the second FEG page.

**Expected Result:** "First FE of second FEG" is not shown on the second FEG page. Other FEs in the second FEG are visible.

---

## TS-CNCL-010: Cancellation Form – All Form Elements Hidden

**Preconditions:** All FEG-hiding modifiers are set on the registration.

**Steps:**
1. Set all FEG-hiding modifiers.
2. Open the program encounter cancellation form.

**Expected Result:** Only the **Cancel Date** static field is visible. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-CNCL-011: Empty Cancellation Form (No Custom FEGs)

**Preconditions:** An encounter type with no custom cancellation FEGs exists.

**Steps:**
1. Cancel an encounter using the type with no custom FEGs ("Empty Program Encounter").

**Expected Result:** Only the **Cancel Date** field is shown. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-CNCL-012: Navigate Forward and Backward Through Cancellation Form

**Preconditions:** The cancellation form has multiple pages.

**Steps:**
1. Open the cancellation form.
2. Click **Next** through all pages: Cancel Date → First FEG → Second FEG → Last FEG → Summary.
3. Click **Previous** from Summary back to the first page.

**Expected Result:** Navigation works correctly in both directions. Data entered on each page is preserved when navigating backward. All pages appear in the expected order.

---

## TS-CNCL-013: Cancelled Encounter Shown with Appropriate Status

**Preconditions:** An encounter has been cancelled.

**Steps:**
1. Navigate to the subject's dashboard.
2. Observe the program or encounter history.

**Expected Result:** The cancelled encounter is listed with a "Cancelled" status indicator. It is visually distinct from completed or scheduled encounters.
