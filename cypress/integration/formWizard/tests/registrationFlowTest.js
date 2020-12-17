/// <reference types="Cypress" />

import { wizardPage } from "../wizardPage";
import { dashboardPage } from "../dashboardPage";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";
import { setupTest } from "../setup";

describe("Registration Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
  });
  it("All four groups are visible in the Person registration form", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNextNTimes(5);
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
  //TODO: uncomment it after fixing the bug
  // it("First form element group should be hidden when first name is 'Hide first FEG'", () => {
  //     dashboardPage.editProfile('Test Person');
  //     wizardPage.typeInput('firstName', 'Hide first FEG');
  //     wizardPage.clickNext();
  //     wizardPage.assertIfPageContains("First FEG");
  //     wizardPage.clickNextNTimes(3);
  //     wizardPage.assertIfPageContains("Summary & Recommendations");
  //     wizardPage.clickPreviousNTimes(4);
  //     wizardPage.assertIfPageContains("Register Person");
  //     wizardPage.clickNextNTimes(4);
  //     wizardPage.assertIfPageContains("Summary & Recommendations");
  // });
  it("Second FEG should be hidden when option 'Hide first FEG' is selected", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of Second FEG", "Last FE of Second FG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FEG");
    wizardPage.clickPreviousNTimes(4);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(4);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FEG");
  });
  it("Second FEG should be hidden when all FE of the group are hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide all FEs in first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of Second FEG", "Last FE of Second FG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide all FEs in first FEG");
    wizardPage.clickPreviousNTimes(4);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(4);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide all FEs in first FEG");
  });
  it("First FE in second FEG should be hidden when option 'Hide first FE of first FEG' is selected", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of Second FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FE of first FEG");
    wizardPage.clickPreviousNTimes(5);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(5);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FE of first FEG");
  });
  it("Last FE in second FEG should be hidden when option 'Hide last FE of first FEG' is selected", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide last FE of first FEG");
    wizardPage.clickPreviousNTimes(5);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(5);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide last FE of first FEG");
  });
  it("Last FEG should be hidden when option 'Hide last FEG' is selected", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide last FEG");
    wizardPage.clickPreviousNTimes(4);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(4);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide last FEG");
  });
  it("should not move to next page if first name is empty", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clearInput("firstName");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("There is no value specified");
    wizardPage.assertIfPageContains("Register Person");
  });
});
