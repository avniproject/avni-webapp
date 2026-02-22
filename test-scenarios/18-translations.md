# Translations Management Test Scenarios

## Overview
Browser-based functional tests for the translation management module in Avni, which allows administrators to configure multi-language support and manage translations for form elements, concepts, and application labels.

---

## TS-TRANS-001: Navigate to Translations Page

**Preconditions:** User is logged in with translation management privileges.

**Steps:**
1. Navigate to `/translations` or the Translations section from the home page.

**Expected Result:** The Translations management page is displayed with options to manage languages and upload/download translation files.

---

## TS-TRANS-002: Download Existing Translation File

**Preconditions:** A language and translations have been configured.

**Steps:**
1. Navigate to the Translations page.
2. Select a language from the list.
3. Click **Download** or **Export**.

**Expected Result:** A translation file (JSON or CSV) is downloaded. The file contains all translatable strings (form element labels, concept names, coded option names) with their current translations.

---

## TS-TRANS-003: Upload a Translation File

**Preconditions:** A valid translation file for a specific language is prepared.

**Steps:**
1. Navigate to the Translations page.
2. Select the target language.
3. Click **Upload** and select the translation file.
4. Confirm the upload.

**Expected Result:** The translation file is uploaded successfully. A success notification is shown. The translations are updated with the values from the file. New translations from the file override any existing values.

---

## TS-TRANS-004: Upload Invalid Translation File – Error Handling

**Preconditions:** An incorrectly formatted file is prepared.

**Steps:**
1. Navigate to the Translations page.
2. Select a language.
3. Attempt to upload an invalid file (wrong format, missing required fields).

**Expected Result:** An error message is displayed describing the issue. The translations are not updated. The user can correct the file and try again.

---

## TS-TRANS-005: Add a New Language

**Preconditions:** Admin/translator is logged in.

**Steps:**
1. Navigate to the Translations page.
2. Click **Add Language** or the "+" option.
3. Select or enter the new language (e.g., "Hindi", "Marathi", "Tamil").
4. Save.

**Expected Result:** The new language is added to the language list. It can now be selected for translation file management. Users can be configured to use this language.

---

## TS-TRANS-006: Apply Language – Verify UI Labels in Selected Language

**Preconditions:** A non-English language with translations uploaded exists. A user is configured to use that language.

**Steps:**
1. Log in as a user configured with the non-English language.
2. Navigate to the data entry home.
3. Navigate through registration, encounter forms, etc.

**Expected Result:** Form element labels, concept names, and coded option names are displayed in the configured language. Static UI labels (buttons, headers) that have translations available are also in the configured language.

---

## TS-TRANS-007: Missing Translation Falls Back to Default Language

**Preconditions:** A language is configured but not all strings have translations.

**Steps:**
1. Log in as a user with a non-English language configured.
2. Navigate to a form where some elements have translations and some do not.

**Expected Result:** Translated strings appear in the user's language. For strings without translations, the default language (English) label is used as a fallback. No empty or broken labels are shown.

---

## TS-TRANS-008: Translation for Concepts (Coded Answer Options)

**Preconditions:** A language with translations for coded concept options is configured.

**Steps:**
1. Log in as a user with the translated language.
2. Navigate to a form with a coded (dropdown/radio) question.
3. Open the dropdown or view the options.

**Expected Result:** The coded options are displayed in the user's language (e.g., "Male"/"Female" appears as the translated equivalents).

---

## TS-TRANS-009: Translations Visible in Summary Page

**Preconditions:** A language with translations is configured. A user is using that language.

**Steps:**
1. Complete a form and navigate to the **Summary & Recommendations** page.

**Expected Result:** The summary page shows form element labels and coded answers in the user's configured language.

---

## TS-TRANS-010: Translations Module Accessible Only to Authorized Users

**Preconditions:** A data-entry-only user account exists (no translation privileges).

**Steps:**
1. Log in as a data-entry-only user.
2. Attempt to navigate to `/translations`.

**Expected Result:** Access is denied or the navigation link is not visible. The user is redirected or shown an "Unauthorized" message. The translations management page is not accessible to unauthorised users.
