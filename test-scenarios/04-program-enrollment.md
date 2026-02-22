# Program Enrollment Test Scenarios

## Overview
Browser-based functional tests for enrolling subjects into health programs, editing enrollment details, exiting programs, and verifying form wizard behaviour during enrollment flows.

---

## TS-ENROL-001: Enrol a Subject in a Program – Happy Path

**Preconditions:** User is logged in. A subject exists. A program is configured and available for enrollment.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click **Enrol in Program** (or the program enrollment button).
3. Select the program from the list.
4. The enrollment form wizard opens on the first page showing the **Enrolment Date**.
5. Verify or set the enrolment date (today's date by default).
6. Fill in any required form elements on subsequent pages.
7. Click **Next** to progress through all form pages.
8. Review the **Summary & Recommendations** page.
9. Click **Save**.

**Expected Result:** The subject is enrolled in the program. The program appears in the subject's dashboard under active enrollments. A success notification is shown.

---

## TS-ENROL-002: Enrolment Date Cannot Be in the Future

**Preconditions:** User is logged in. An enrollment form is open.

**Steps:**
1. Open the program enrollment form for a subject.
2. Set the **Enrolment Date** to a future date (e.g., 01/01/2050).

**Expected Result:** A validation error is displayed: "Enrolment date cannot be in future". The form does not advance past the first page until a valid date is entered.

---

## TS-ENROL-003: Edit Existing Program Enrolment

**Preconditions:** User is logged in. A subject is already enrolled in a program.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the program enrollment and click **Edit Enrolment**.
3. Modify one or more fields on the enrollment form.
4. Navigate through all pages to the Summary page.
5. Click **Save**.

**Expected Result:** The enrollment record is updated with the new values. The subject dashboard reflects the changes. A success notification is shown.

---

## TS-ENROL-004: Enrolment Form – FEG Hidden by FEG-Level Rule (Cross-Form)

**Preconditions:** The registration form has a modifier field whose selection triggers a rule hiding the first FEG in the enrollment form.

**Steps:**
1. Edit the subject's registration to set the modifier to **"Hide first FEG"**.
2. Open the program enrollment form.

**Expected Result:** The first FEG page is absent from the enrollment wizard. The form starts on the Second FEG page (with Enrolment Date still visible). Navigating forward skips the first FEG.

---

## TS-ENROL-005: Enrolment Form – FEG Hidden by All FE-Level Rules

**Preconditions:** Registration modifier is set to hide all FEs in the first FEG.

**Steps:**
1. Set the subject's registration modifier to hide all FEs in the first FEG ("Hide first FE of first FEG" and "Hide last FE of first FEG").
2. Open the program enrollment form.

**Expected Result:** The first FEG page does not appear. The enrolment form starts on the Second FEG page. Navigation reflects the absence of the first FEG page.

---

## TS-ENROL-006: Enrolment Form – Hidden FEG Navigation (Forward and Backward)

**Preconditions:** A FEG is hidden via rule in the enrollment form.

**Steps:**
1. Set up conditions to hide the second FEG.
2. Open the enrollment form.
3. Navigate forward through all visible pages.
4. Navigate backward from the Summary page through all pages.

**Expected Result:** The hidden FEG page never appears during forward or backward navigation. Navigation correctly skips over the hidden page in both directions.

---

## TS-ENROL-007: Enrolment Form – Skip Logic Within Current Form

**Preconditions:** The enrollment form itself contains a skip-logic field that hides another FEG on the same form.

**Steps:**
1. Open the program enrollment form.
2. On the first FEG page, select an option that triggers hiding of the second FEG (e.g., select "Hide second FEG").
3. Click **Next**.

**Expected Result:** The second FEG page is skipped. The form advances to the last FEG or Summary page, bypassing the hidden FEG. Navigating backward from Summary also skips the hidden FEG.

---

## TS-ENROL-008: Enrolment Form – FE Hidden by Skip Logic in Same Group

**Preconditions:** An enrollment form FEG contains a FE whose selection hides another FE in the same group.

**Steps:**
1. Open the enrollment form.
2. On the first FEG page, select an option that hides "Last FE of first FEG" (e.g., "Hide last FE of first FEG").

**Expected Result:** The "Last FE of first FEG" field disappears from the current page immediately. The Enrolment Date field remains visible. The hidden FE does not reappear on subsequent navigation.

---

## TS-ENROL-009: Enrolment Form – All Form Elements Hidden

**Preconditions:** All FEGs can be hidden via registration modifier rules.

**Steps:**
1. Set all FEG-hiding modifiers on the subject's registration form.
2. Open the program enrollment form.

**Expected Result:** Only the static **Enrolment Date** field is shown. Clicking **Next** immediately brings the user to the **Summary & Recommendations** page. Navigating backward from Summary returns to the Enrolment Date page.

---

## TS-ENROL-010: Empty Enrolment Form (No Custom FEGs)

**Preconditions:** A program exists with an enrolment form that has no custom FEGs configured.

**Steps:**
1. Open the enrollment form for the "EmptyProgram".

**Expected Result:** Only the **Enrolment Date** static field is shown. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-ENROL-011: Enrolment Form – Validation Error Blocks Navigation

**Preconditions:** A form element with a validation rule exists in the enrollment form.

**Steps:**
1. Open the enrollment form.
2. Enter an invalid value (e.g., 123) in the validated field ("Last FE of first FEG").
3. Observe the validation error message.
4. Click **Next**.

**Expected Result:** The validation error message is displayed (e.g., "123 is invalid"). The form does not advance to the next page. The user remains on the current FEG page.

---

## TS-ENROL-012: View Program Enrolment Details

**Preconditions:** A subject is enrolled in a program.

**Steps:**
1. Navigate to the subject's dashboard.
2. Click on the active program enrollment.

**Expected Result:** The program enrolment details view is displayed, showing all recorded data from the enrollment form. Options to edit the enrolment or start a new visit are available.
