# Reporting and Export Test Scenarios

## Overview
Browser-based functional tests for data export, report generation, and self-service reports in the Avni web application.

---

## TS-RPT-001: Export Data – Select a Subject Type and Download

**Preconditions:** User is logged in with export privileges. Data exists for at least one subject type.

**Steps:**
1. Navigate to the **Export** page (via `/export` or `/newExport`).
2. Select a subject type from the dropdown or list.
3. Configure the date range or other export parameters.
4. Click **Export** or **Download**.

**Expected Result:** The data export is initiated. A file (CSV or ZIP) is generated and downloaded to the user's machine. The exported file contains the expected data for the selected subject type and date range.

---

## TS-RPT-002: Export Data – Select a Program and Download

**Preconditions:** User has export access. Program data exists.

**Steps:**
1. Navigate to the Export page.
2. Select a program and optionally a program encounter type.
3. Set the date range.
4. Click **Export**.

**Expected Result:** A file is downloaded containing the program enrolment and encounter data for the selected program within the date range.

---

## TS-RPT-003: Export Data – Programme Encounter Export with Date Range

**Preconditions:** Program encounters have been recorded.

**Steps:**
1. Navigate to the Export page.
2. Select a program and an encounter type.
3. Set a specific date range (start date and end date).
4. Click **Export**.

**Expected Result:** Only encounters within the specified date range are included in the export. Records outside the range are excluded.

---

## TS-RPT-004: New Export Page – Generate a Longitudinal Report

**Preconditions:** User has access to `/newExport`. Longitudinal data exists.

**Steps:**
1. Navigate to the new export page.
2. Select the report type (longitudinal/cross-sectional).
3. Configure the parameters.
4. Click **Generate** or **Download**.

**Expected Result:** The report is generated successfully. The file is downloaded. The data is formatted correctly for longitudinal analysis.

---

## TS-RPT-005: Self-Service Reports – Browse Available Reports

**Preconditions:** User is logged in with access to self-service reports at `/selfservicereports`.

**Steps:**
1. Navigate to the Self-Service Reports page.
2. Browse the list of available reports.

**Expected Result:** A list of pre-configured self-service reports is displayed. Each report shows its name and a description or category.

---

## TS-RPT-006: Self-Service Reports – Run a Report

**Preconditions:** At least one self-service report is configured.

**Steps:**
1. Navigate to Self-Service Reports.
2. Click on a report to open it.
3. Configure any required parameters (date range, location filter, etc.).
4. Click **Run** or **Generate**.

**Expected Result:** The report is executed and results are displayed in the browser or a file is downloaded. The data in the report matches the expected output.

---

## TS-RPT-007: Self-Service Reports – Visualisation/Chart Display

**Preconditions:** A self-service report with chart/visualisation output is configured.

**Steps:**
1. Navigate to Self-Service Reports.
2. Open a report configured to show charts.
3. Run the report.

**Expected Result:** Charts or visualisations are rendered correctly in the browser. Data labels and axes are accurate.

---

## TS-RPT-008: Export – Empty Result Handling

**Preconditions:** Export is configured for a date range with no data.

**Steps:**
1. Navigate to the Export page.
2. Set a date range for a period with no recorded encounters or registrations.
3. Click **Export**.

**Expected Result:** Either an empty file is downloaded, or an informative message is displayed indicating no data is available for the selected criteria. No server error occurs.

---

## TS-RPT-009: Reports Page – Error When Server Is Unreachable

**Preconditions:** The reporting API is temporarily unavailable (or network is disconnected).

**Steps:**
1. Navigate to the Export or Self-Service Reports page.
2. Attempt to generate a report.

**Expected Result:** A clear error message is displayed to the user (e.g., "Unable to generate report at this time"). The application does not crash or show a blank page.

---

## TS-RPT-010: Export – Download Multiple Formats (if supported)

**Preconditions:** Multiple export formats are configured.

**Steps:**
1. Navigate to the Export page.
2. Select a subject type.
3. Choose a different file format (if option is available, e.g., CSV vs. XLSX).
4. Click **Export**.

**Expected Result:** The file is downloaded in the selected format. The data is correctly formatted for the chosen format.
