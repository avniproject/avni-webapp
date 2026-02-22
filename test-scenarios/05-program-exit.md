# Program Exit (Unenrollment) Test Scenarios

## Overview
Browser-based functional tests for exiting (unenrolling) a subject from a health program, including form wizard behaviour during the exit flow.

---

## TS-EXIT-001: Exit a Subject from a Program – Happy Path

**Preconditions:** User is logged in. A subject is actively enrolled in a program.

**Steps:**
1. Navigate to the subject's dashboard.
2. Locate the active program enrollment.
3. Click **Exit Program** (or the program exit/unenrollment button).
4. The exit form wizard opens, showing the **Exit Enrolment Date** field.
5. Verify or set the exit date.
6. Fill in any required form elements.
7. Click **Next** to progress through all form pages.
8. Review the **Summary & Recommendations** page.
9. Click **Save**.

**Expected Result:** The program enrollment is marked as exited/completed. The program appears in the subject's dashboard under completed or past enrollments. A success notification is shown.

---

## TS-EXIT-002: Exit Enrolment Date Cannot Be in the Future

**Preconditions:** User is logged in. The exit program form is open.

**Steps:**
1. Open the exit program form for a subject enrolled in a program.
2. Set the **Exit Enrolment Date** to a future date (e.g., 01/01/2050).

**Expected Result:** A validation error is displayed: "Exit date cannot be in future". The form does not advance past the first page until a valid date is entered.

---

## TS-EXIT-003: Exit Form – FEG Hidden by FEG-Level Rule

**Preconditions:** Registration modifier is set to "Hide first FEG".

**Steps:**
1. Set the subject's registration modifier to **"Hide first FEG"**.
2. Open the exit program form.

**Expected Result:** The first FEG page is absent from the exit form wizard. The form begins at the second FEG. The **Exit Enrolment Date** static element is visible on the first remaining page.

---

## TS-EXIT-004: Exit Form – FEG Hidden by All FE-Level Rules

**Preconditions:** All FEs in the first FEG are hidden via modifier rule.

**Steps:**
1. Set modifiers to hide all FEs in the first FEG.
2. Open the exit program form.

**Expected Result:** The first FEG page is skipped in the exit form. The form wizard navigates correctly from the Exit Enrolment Date page to the second FEG, then Last FEG, then Summary.

---

## TS-EXIT-005: Exit Form – Navigation Forward and Backward Without Hidden FEGs

**Preconditions:** Subject is enrolled in a program. The exit form has multiple FEG pages.

**Steps:**
1. Open the exit program form.
2. Click **Next** through all pages: Exit Enrolment Date → First FEG → Second FEG → Last FEG → Summary.
3. From the Summary page, click **Previous** repeatedly back to the Exit Enrolment Date page.

**Expected Result:** Navigation forward and backward works correctly. All pages appear in the expected order. No pages are skipped. Data entered is preserved.

---

## TS-EXIT-006: Exit Form – Skip Logic Within Current Form

**Preconditions:** The exit form contains a FE that triggers hiding of another FEG on the same form.

**Steps:**
1. Open the exit program form.
2. On the first page, select the option that hides the second FEG.
3. Navigate forward through the form.

**Expected Result:** The second FEG is skipped when navigating forward. The Summary page reflects the correct data. Navigating backward also skips the hidden FEG.

---

## TS-EXIT-007: Exit Form – All Form Elements Hidden

**Preconditions:** All FEGs are hidden via registration modifier rules.

**Steps:**
1. Set all FEG-hiding modifiers on the registration.
2. Open the exit program form.

**Expected Result:** Only the **Exit Enrolment Date** static field is visible. Clicking **Next** immediately shows the **Summary & Recommendations** page. Backward navigation returns to the Exit Enrolment Date page.

---

## TS-EXIT-008: Exit Form – Validation Error Blocks Navigation

**Preconditions:** The exit form contains a validated form element.

**Steps:**
1. Open the exit program form.
2. Enter an invalid value in a validated field.
3. Click **Next**.

**Expected Result:** The validation error is displayed. The form does not advance past the current page.

---

## TS-EXIT-009: Empty Exit Form (No Custom FEGs)

**Preconditions:** A program with no custom FEGs in the exit form exists.

**Steps:**
1. Open the exit program form for a program with no custom FEGs ("EmptyProgram").

**Expected Result:** Only the **Exit Enrolment Date** field is shown. Clicking **Next** goes directly to the **Summary & Recommendations** page.

---

## TS-EXIT-010: Exited Program Shown in Completed Enrollments

**Preconditions:** A subject has successfully exited a program.

**Steps:**
1. Navigate to the subject's dashboard.
2. Observe the program enrollment section.

**Expected Result:** The exited program is listed under "Completed" or past enrollments (not under active). The exit date is displayed. The program can still be viewed but not exited again.
