# App Designer (Form Designer) Test Scenarios

## Overview
Browser-based functional tests for the App Designer module in Avni, which allows configuration of forms, dashboards, rules, relationships, and other application behaviour through a visual interface at `/appdesigner/`.

---

## TS-APPD-001: Create a New Form

**Preconditions:** Admin/App Designer user is logged in. Access to `/appdesigner/` is granted.

**Steps:**
1. Navigate to the App Designer.
2. Click on **Forms** in the navigation.
3. Click **Create** or **+ New Form**.
4. Enter a form name.
5. Select the form type (Registration, Enrolment, Encounter, Exit, etc.).
6. Select the applicable subject type or program.
7. Click **Save**.

**Expected Result:** A new blank form is created. The form appears in the forms list. The form is ready to have form element groups and form elements added to it.

---

## TS-APPD-002: Add a Form Element Group (FEG) to a Form

**Preconditions:** A form exists without any FEGs.

**Steps:**
1. Open the form in the App Designer.
2. Click **Add Form Element Group** (or the "+ FEG" button).
3. Enter a name for the FEG (e.g., "Personal Details").
4. Save.

**Expected Result:** The FEG appears as a section within the form. The FEG is assigned a display order number.

---

## TS-APPD-003: Add a Form Element (FE) to a Form Element Group

**Preconditions:** A form with at least one FEG exists.

**Steps:**
1. Open a form's FEG in the App Designer.
2. Click **Add Form Element** (or the "+ FE" button) within the FEG.
3. Enter the form element name.
4. Select the concept/data type (text, numeric, coded, date, etc.).
5. Set the element as mandatory or optional.
6. Save.

**Expected Result:** The form element is added to the FEG. It appears in the form element list within the FEG with the correct data type and mandatory setting.

---

## TS-APPD-004: Edit an Existing Form Element

**Preconditions:** A form element exists on a form.

**Steps:**
1. Open the form in the App Designer.
2. Click **Edit** on an existing form element.
3. Change the label, data type, or mandatory status.
4. Save.

**Expected Result:** The form element is updated. The changes are reflected when the form is used in data entry.

---

## TS-APPD-005: Reorder Form Element Groups (Drag and Drop or Order Input)

**Preconditions:** A form with multiple FEGs exists.

**Steps:**
1. Open the form in the App Designer.
2. Change the display order of two or more FEGs.
3. Save.

**Expected Result:** The FEGs appear in the new order in the App Designer. When the form is used in data entry, pages appear in the updated order.

---

## TS-APPD-006: Configure Coded Concept Options for a Form Element

**Preconditions:** A coded (single or multi-select) form element exists.

**Steps:**
1. Open the form element in the App Designer.
2. Navigate to the options/concepts section.
3. Add, remove, or reorder the coded answer options.
4. Save.

**Expected Result:** The answer options are updated. When a data entry user opens the form, the coded question shows the configured options.

---

## TS-APPD-007: Create a Skip Logic Rule (FE-Level Rule)

**Preconditions:** A form with multiple FEs exists.

**Steps:**
1. Open a form element in the App Designer.
2. Navigate to the **Rule** or **Skip Logic** section.
3. Define a rule: e.g., "Hide this element if [another field] equals [value]".
4. Save the rule.

**Expected Result:** The rule is saved and associated with the form element. When the triggering condition is met in data entry, the form element is hidden automatically.

---

## TS-APPD-008: Create a Skip Logic Rule (FEG-Level Rule)

**Preconditions:** A form with multiple FEGs exists.

**Steps:**
1. Open a FEG in the App Designer.
2. Navigate to the **Rule** or **Visibility Rule** section.
3. Define a rule that hides the entire FEG based on a condition.
4. Save.

**Expected Result:** The FEG-level rule is saved. When the condition is met in data entry, the entire FEG page is hidden in the form wizard.

---

## TS-APPD-009: Create a Validation Rule for a Form Element

**Preconditions:** A form element of type numeric or text exists.

**Steps:**
1. Open the form element in the App Designer.
2. Navigate to the **Validation Rules** section.
3. Add a validation rule (e.g., "Value must not equal 123").
4. Save.

**Expected Result:** The validation rule is saved. In data entry, entering the invalid value triggers the validation error message. The form wizard does not advance while the error is present.

---

## TS-APPD-010: Configure a Decision/Recommendation Rule

**Preconditions:** A form with form elements exists.

**Steps:**
1. Navigate to the **Rules** section in the App Designer.
2. Create a decision rule that displays a recommendation based on form element values.
3. Save.

**Expected Result:** The decision rule is active. In data entry, the **Summary & Recommendations** page displays the recommendation when the configured conditions are met.

---

## TS-APPD-011: Dashboard Configuration – Create a Report Card

**Preconditions:** Admin/App Designer user is logged in.

**Steps:**
1. Navigate to **Dashboards** in the App Designer.
2. Create a new dashboard or edit an existing one.
3. Add a **Report Card** to the dashboard.
4. Configure the report card query/filter and display settings.
5. Save.

**Expected Result:** The report card is created and associated with the dashboard. The card appears on the configured dashboard with the correct data.

---

## TS-APPD-012: Configure Relationship Types

**Preconditions:** App Designer is accessible.

**Steps:**
1. Navigate to **Relationships** or **Relationship Types** in the App Designer.
2. Create a new relationship type (e.g., "Mother", "Father", "Child").
3. Define the subject type(s) involved.
4. Save.

**Expected Result:** The relationship type is created. It is available when adding relatives to a subject in data entry.

---

## TS-APPD-013: Extensions Management

**Preconditions:** App Designer is accessible.

**Steps:**
1. Navigate to **Extensions** in the App Designer.
2. View the list of available or installed extensions.
3. Enable or configure an extension if applicable.

**Expected Result:** Extensions are listed. Configuration changes are saved. Any extension-driven UI elements appear in the application after enabling.

---

## TS-APPD-014: Message Rules Configuration

**Preconditions:** App Designer is accessible.

**Steps:**
1. Navigate to **Message Rules** in the App Designer.
2. Create a new message rule defining when a message should be sent.
3. Configure the recipient, trigger conditions, and message template.
4. Save.

**Expected Result:** The message rule is created. When triggered by the configured condition in data entry, the message is queued for delivery.

---

## TS-APPD-015: Export App Configuration

**Preconditions:** App Designer is accessible.

**Steps:**
1. Navigate to the configuration export option.
2. Export the full app configuration (forms, rules, dashboards, etc.).

**Expected Result:** A configuration export file (JSON/ZIP) is downloaded. The export contains all the configured elements of the application.
