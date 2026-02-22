# Form Wizard & Skip Rules Test Scenarios

## Overview
Browser-based functional tests for the form wizard (multi-page form) system, including skip logic rules (FEG-level and FE-level rules), validation, and backward/forward navigation across all form types (registration, program enrolment, encounters, cancellation, and program exit).

**Definitions:**
- **FEG (Form Element Group):** A page/section in the form wizard.
- **FE (Form Element):** A single field within a FEG.
- **FEG Rule:** A skip rule that hides an entire FEG (all fields in a section).
- **FE Rule:** A skip rule that hides individual form elements.

---

## TS-WIZRD-001: First FEG Hidden by FEG-Level Rule

**Applicable to:** Registration, General Encounter, Program Encounter, Cancellation, Program Exit forms.

**Steps:**
1. Set the skip-logic trigger (modifier) to **"Hide first FEG"**.
2. Open the relevant form.
3. Click **Next** from the first page.

**Expected Result:** The first FEG page is not shown. The form advances to the second FEG. Navigating backward from the second FEG returns to the previous static page (e.g., registration date, visit date), not the hidden FEG.

---

## TS-WIZRD-002: First FEG Hidden by All FE-Level Rules

**Applicable to:** Registration, General Encounter, Program Encounter, Cancellation, Program Exit forms.

**Steps:**
1. Set modifiers to **"Hide first FE of first FEG"** AND **"Hide last FE of first FEG"** simultaneously.
2. Open the relevant form.

**Expected Result:** The first FEG page is not shown (all its FEs are hidden). The form behaves identically to TS-WIZRD-001.

---

## TS-WIZRD-003: First FE in First FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide first FE of first FEG"**.
2. Open the form.
3. Navigate to the first FEG page.

**Expected Result:** The first FEG page is still displayed (it has at least one visible FE). The **"First FE of first FEG"** field is absent. **"Last FE of first FEG"** and other fields are visible.

---

## TS-WIZRD-004: Last FE in First FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide last FE of first FEG"**.
2. Open the form and navigate to the first FEG page.

**Expected Result:** The first FEG page is shown. The **"Last FE of first FEG"** field is absent. **"First FE of first FEG"** and other fields are visible.

---

## TS-WIZRD-005: Second FEG Hidden by FEG-Level Rule

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide second FEG"**.
2. Open the form and navigate forward.

**Expected Result:** After the first FEG page, the second FEG is skipped entirely. The form advances directly to the last FEG. Backward navigation from the last FEG goes to the first FEG, not the hidden second FEG.

---

## TS-WIZRD-006: Second FEG Hidden by All FE-Level Rules

**Applicable to:** All form types.

**Steps:**
1. Set modifiers to hide all FEs in the second FEG ("Hide first FE of second FEG" AND "Hide last FE of second FEG").
2. Open the form and navigate.

**Expected Result:** The second FEG page is skipped. Navigation is identical to TS-WIZRD-005.

---

## TS-WIZRD-007: First FE in Second FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide first FE of second FEG"**.
2. Open the form and navigate to the second FEG page.

**Expected Result:** The second FEG page is shown. **"First FE of second FEG"** is absent. **"Last FE of second FEG"** is visible.

---

## TS-WIZRD-008: Last FE in Second FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide last FE of second FEG"**.
2. Navigate to the second FEG page.

**Expected Result:** The second FEG page is shown. **"Last FE of second FEG"** is absent. **"First FE of second FEG"** is visible.

---

## TS-WIZRD-009: Last FEG Hidden by FEG-Level Rule

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide last FEG"**.
2. Open the form and navigate forward through all pages.

**Expected Result:** After the second FEG, the last FEG is skipped entirely. The form goes directly to **Summary & Recommendations**. Backward navigation from Summary goes to the second FEG (the last visible FEG).

---

## TS-WIZRD-010: Last FEG Hidden by All FE-Level Rules

**Applicable to:** All form types.

**Steps:**
1. Set modifiers to hide all FEs in the last FEG ("Hide first FE of last FEG" AND "Hide last FE of last FEG").
2. Navigate through the form.

**Expected Result:** The last FEG page is skipped. Navigation is identical to TS-WIZRD-009.

---

## TS-WIZRD-011: First FE in Last FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide first FE of last FEG"**.
2. Navigate to the last FEG page.

**Expected Result:** The last FEG page is shown. **"First FE of last FEG"** is absent. **"Last FE of last FEG"** is visible.

---

## TS-WIZRD-012: Last FE in Last FEG Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifier to **"Hide last FE of last FEG"**.
2. Navigate to the last FEG page.

**Expected Result:** The last FEG page is shown. **"Last FE of last FEG"** is absent. **"First FE of last FEG"** is visible.

---

## TS-WIZRD-013: All FEs in the Entire Form Hidden

**Applicable to:** All form types.

**Steps:**
1. Set modifiers to hide all FEs across all three FEGs simultaneously.
2. Open the form and click **Next** from the static field page.

**Expected Result:** The form jumps directly to **Summary & Recommendations**, skipping all FEG pages. Navigating **Previous** from Summary returns to the static page (e.g., registration date / visit date / enrolment date).

---

## TS-WIZRD-014: In-Form Skip Logic Hides Another FEG

**Applicable to:** Program Enrolment, General Encounter, Program Encounter, and Cancel forms.

**Steps:**
1. Open the form (no cross-form modifier set).
2. On the first FEG page, select the option that triggers hiding of the second FEG in the current form.
3. Click **Next**.

**Expected Result:** The second FEG is skipped on the current form. The form goes from first FEG to last FEG. Summary is reached without going through the hidden second FEG.

---

## TS-WIZRD-015: In-Form Skip Logic Hides a FE in the Same Group

**Applicable to:** Program Enrolment, General Encounter, Program Encounter forms.

**Steps:**
1. Open the form.
2. On the first FEG page, select an option that hides "Last FE of first FEG" within the same form.
3. Observe the current page without navigating.

**Expected Result:** "Last FE of first FEG" is immediately hidden on the current page. The FEG remains visible with other FEs. The field does not reappear when navigating forward and backward.

---

## TS-WIZRD-016: In-Form Skip Logic Hides a FE in a Different Group

**Applicable to:** Program Enrolment, General Encounter, Program Encounter forms.

**Steps:**
1. Open the form.
2. Select an option that hides "First FE of second FEG".
3. Navigate to the second FEG page.

**Expected Result:** "First FE of second FEG" is absent on the second FEG page. "Last FE of second FEG" and all other fields in that FEG are visible.

---

## TS-WIZRD-017: Validation Error – User Cannot Advance Past Invalid Page

**Applicable to:** All form types.

**Steps:**
1. Open any form.
2. Navigate to a page with a validated numeric/text field.
3. Enter an invalid value (e.g., 123 in a field that rejects it).
4. Observe the error message appearing inline.
5. Click **Next**.

**Expected Result:** The error message is displayed (e.g., "123 is invalid"). The form does not advance to the next page. The user remains on the current FEG page.

---

## TS-WIZRD-018: Validation Error Persists on Return Navigation

**Applicable to:** All form types.

**Steps:**
1. Enter an invalid value on a FEG page.
2. Click **Previous** to go back one page.
3. Click **Next** to return to the error page.

**Expected Result:** The previously entered invalid value and error message are still present when returning to the page. The form still does not advance past the invalid page.

---

## TS-WIZRD-019: Summary Page Reflects All Entered Data

**Applicable to:** All form types.

**Steps:**
1. Open a form and fill in data on all pages.
2. Navigate to the **Summary & Recommendations** page.

**Expected Result:** The summary page shows all data entered across all visible form pages. Data from hidden pages/FEGs is not shown. Recommendations (if any) are displayed.

---

## TS-WIZRD-020: Empty Form (No Custom FEGs) – Immediate Summary

**Applicable to:** All form types configured without custom FEGs.

**Steps:**
1. Open a form for a subject type or encounter type with no custom FEGs.
2. Click **Next** from the first static field page.

**Expected Result:** The **Summary & Recommendations** page is shown immediately. Navigating **Previous** from Summary returns to the static field page (e.g., registration date, visit date).
