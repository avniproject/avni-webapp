# Media and Attachment Test Scenarios

## Overview
Browser-based functional tests for media uploads (images, audio files, documents) and attachments within form elements in the Avni data entry application.

---

## TS-MEDIA-001: Upload an Image in a Form Element

**Preconditions:** User is logged in. A form with an image/photo upload form element is configured.

**Steps:**
1. Open any data entry form (registration, encounter, etc.) containing an image upload element.
2. Click the image upload button/area.
3. Select a valid image file (JPG or PNG, within the size limit).
4. The image is previewed within the form.
5. Complete and save the form.

**Expected Result:** The image is uploaded successfully. The form is saved with the image attached. The uploaded image is visible in the subject's data view and summary.

---

## TS-MEDIA-002: Upload an Audio Recording in a Form Element

**Preconditions:** A form with an audio capture/upload form element is configured.

**Steps:**
1. Open a form with an audio form element.
2. Record audio using the browser's microphone (if supported) or upload an audio file.
3. Confirm the audio is captured.
4. Complete and save the form.

**Expected Result:** The audio is saved with the form data. An audio player is shown when viewing the recorded data, and the audio can be played back.

---

## TS-MEDIA-003: Upload a Document/File Attachment

**Preconditions:** A form with a file upload element is configured.

**Steps:**
1. Open a form with a file attachment element.
2. Click **Upload** and select a valid file (PDF, DOC, etc.).
3. Wait for the file to upload.
4. Complete and save the form.

**Expected Result:** The file is attached to the form record. When viewing the recorded data, the file appears as a downloadable link or preview.

---

## TS-MEDIA-004: File Size Limit – Reject Oversized File

**Preconditions:** A file size limit is configured on the server/form.

**Steps:**
1. Open a form with a file upload element.
2. Select a file that exceeds the size limit.

**Expected Result:** An error message is displayed indicating the file is too large. The file is not uploaded. The user can select a smaller file and try again.

---

## TS-MEDIA-005: File Type Validation – Reject Invalid File Type

**Preconditions:** The form element is configured to accept only specific file types (e.g., images only).

**Steps:**
1. Open a form with an image-only upload element.
2. Attempt to upload a file of a disallowed type (e.g., a PDF when only images are allowed).

**Expected Result:** An error message is displayed indicating the file type is not accepted. The upload is rejected.

---

## TS-MEDIA-006: Remove/Replace an Uploaded File

**Preconditions:** A file has already been uploaded to a form element.

**Steps:**
1. Open the edit view of a form that has an uploaded file.
2. Remove the existing file or replace it with a new one.
3. Save the form.

**Expected Result:** If removed: the file is no longer attached to the record. If replaced: the old file is removed and the new file is associated with the record.

---

## TS-MEDIA-007: Profile Picture Upload for Subject

**Preconditions:** Subject profile picture upload is supported.

**Steps:**
1. Open the subject registration or edit profile form.
2. Upload a profile picture.
3. Save the form.

**Expected Result:** The profile picture is displayed on the subject dashboard and in search result cards. The image is stored correctly.

---

## TS-MEDIA-008: View Media Attachments on Subject Dashboard

**Preconditions:** A subject has forms with media attachments (images, audio, files).

**Steps:**
1. Navigate to the subject's dashboard.
2. Open a recorded encounter or registration that has media attached.
3. View the media section.

**Expected Result:** All attached media (images, audio, documents) are visible and accessible. Images are displayed as thumbnails. Audio has a playback control. Documents have a download link.

---

## TS-MEDIA-009: Media Upload Requires Network Connectivity

**Preconditions:** The application is running but network connectivity is interrupted during upload.

**Steps:**
1. Open a form with a file upload element.
2. Disconnect from the network.
3. Attempt to upload a file.

**Expected Result:** An appropriate error message is displayed (e.g., "Upload failed. Please check your connection."). The upload does not silently fail. The form can still be saved (without the attachment) or the user can retry after reconnecting.
