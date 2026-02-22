# Broadcast and News Test Scenarios

## Overview
Browser-based functional tests for the news/broadcast messaging feature in Avni, which allows administrators and privileged users to create, publish, and manage news/broadcast messages for app users.

---

## TS-NEWS-001: Create a New Broadcast/News Item

**Preconditions:** User is logged in with broadcast management privileges. The broadcast module is accessible at `/broadcast/`.

**Steps:**
1. Navigate to **Broadcast** or **News** in the application.
2. Click **Create** or **+ New News Item**.
3. Enter the news title.
4. Enter the news content/body (rich text editor).
5. Set the publication date/time (optional).
6. Select the target audience (all users, specific user groups, or by location).
7. Click **Save** or **Publish**.

**Expected Result:** The news item is created or published. It appears in the news list with the correct title, date, and status (Draft/Published).

---

## TS-NEWS-002: View List of News/Broadcast Items

**Preconditions:** At least one news item exists.

**Steps:**
1. Navigate to the Broadcast/News management page.

**Expected Result:** A list of news items is displayed with titles, publication dates, and statuses (Draft/Published). Sorting and filtering options may be available.

---

## TS-NEWS-003: Edit an Existing News Item

**Preconditions:** A news item exists.

**Steps:**
1. Navigate to the News list.
2. Click **Edit** on a news item.
3. Modify the title, content, or target audience.
4. Save.

**Expected Result:** The news item is updated. The changes are reflected in the news list and when the item is viewed.

---

## TS-NEWS-004: Delete/Void a News Item

**Preconditions:** A news item exists (not yet published or is a draft).

**Steps:**
1. Navigate to the News list.
2. Click **Delete** on a news item.
3. Confirm the deletion.

**Expected Result:** The news item is removed from the list (or marked as deleted). It no longer appears to end users.

---

## TS-NEWS-005: Publish a Draft News Item

**Preconditions:** A news item exists in Draft status.

**Steps:**
1. Navigate to the News list.
2. Open the draft news item.
3. Click **Publish**.

**Expected Result:** The news item's status changes to "Published". It becomes visible to the target audience in the data entry app's news feed (`/app/news`).

---

## TS-NEWS-006: View News in Data Entry App

**Preconditions:** A published news item exists.

**Steps:**
1. Log in as a data entry user.
2. Navigate to the news/broadcast section within the data entry app (`/app/news`).

**Expected Result:** The published news items are displayed for the current user. Items are shown in reverse chronological order (newest first). Each item shows the title, content, and publication date.

---

## TS-NEWS-007: Broadcast Targeting – News Visible Only to Target Audience

**Preconditions:** A news item is published targeting a specific user group or location.

**Steps:**
1. Log in as a user who is in the targeted group.
2. Navigate to the news section.
3. Log out and log in as a user NOT in the targeted group.
4. Navigate to the news section.

**Expected Result:** Users in the target group see the news item. Users outside the target group do not see it (it is filtered out).

---

## TS-NEWS-008: News Content with Rich Text Formatting

**Preconditions:** A news item with rich text content (bold, italic, lists, links) has been created and published.

**Steps:**
1. Navigate to the news section.
2. Open the published news item.

**Expected Result:** Rich text formatting (bold, italic, bullet lists, hyperlinks) is rendered correctly in the news detail view.

---

## TS-NEWS-009: WhatsApp Integration – Send News via WhatsApp (if configured)

**Preconditions:** WhatsApp integration is configured for the organisation.

**Steps:**
1. Create or open a news item.
2. Use the WhatsApp send option.
3. Configure the target contacts.
4. Send.

**Expected Result:** The WhatsApp message is queued or sent. A confirmation is shown. No server errors are reported.

---

## TS-NEWS-010: News Pagination

**Preconditions:** More news items exist than a single page can display.

**Steps:**
1. Navigate to the news list (management or data entry view).
2. Observe pagination controls.
3. Navigate to subsequent pages.

**Expected Result:** News items are correctly paginated. Each page shows the expected items. Pagination controls work correctly.
