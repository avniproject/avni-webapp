/// <reference types="Cypress" />

import { wizardPage } from "../../pages/wizardPage";
import { dashboardPage } from "../../pages/dashboardPage";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";
import { setupTest } from "../../pages/setup";

describe("Registration Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromNonIndiRegistration("Test Group");
  });
  it("First FEG is hidden using FEG rule", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide first FEG");
    wizardPage.checkScenarioHideFirstFEG();
  });
  it("First FE in first FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide first FE of first FEG");
    wizardPage.checkScenarioHideFirstFEofFirstFEG();
  });
  it("Last FE in first FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide last FE of first FEG");
    wizardPage.checkScenarioHideLastFEofFirstFEG();
  });
  it("should not move to next page if first name is empty", () => {
    dashboardPage.editProfile("Test Group");
    wizardPage.clearInput("name");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("There is no value specified");
    wizardPage.assertIfPageContains("Register Group");
  });
  it("First FEG is hidden using all FE rule", () => {
    wizardPage.modifyGroupRegistration(
      "Test Group",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
    wizardPage.checkScenarioHideFirstFEGbyAllFEG();
  });
  it("Second FEG is hidden using FEG rule", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide second FEG");
    wizardPage.checkScenarioHideSecondFEG();
  });
  it("Second FEG is hidden using all FE rule", () => {
    wizardPage.modifyGroupRegistration(
      "Test Group",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG"
    );
    wizardPage.checkScenarioHideSecondFEGbyAllFEG();
  });
  it("First FE in second FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide first FE of second FEG");
    wizardPage.checkScenarioHideFirstFEofSecondFEG();
  });
  it("Last FE in second FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide last FE of second FEG");
    wizardPage.checkScenarioHideLastFEofSecondFEG();
  });
  it("Last FEG is hidden using FEG rule", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide last FEG");
    wizardPage.checkScenarioHideLastFEG();
  });
  it("Last FEG is hidden using all FE rule", () => {
    wizardPage.modifyGroupRegistration(
      "Test Group",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    wizardPage.checkScenarioHideLastFEGbyAllFEG();
  });
  it("First FE in last FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide first FE of last FEG");
    wizardPage.checkScenarioHideFirstFEofLastFEG();
  });
  it("Last FE in last FEG is hidden", () => {
    wizardPage.modifyGroupRegistration("Test Group", "Hide last FE of last FEG");
    wizardPage.checkScenarioHideLastFEofLastFEG();
  });
  it("All the FE in the form are hidden", () => {
    dashboardPage.editProfile("Test Group");
    wizardPage.selectOptions(
      "Hide first FE of first FEG",
      "Hide last FE of first FEG",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    wizardPage.checkScenarioHideAllFEG();
  });
  it("Validation error in last FE of first FEG", () => {
    dashboardPage.editProfile("Test Group");
    wizardPage.clickNext();
    wizardPage.typeInput("Last FE of first FEG", 123);
    wizardPage.assertIfPageContains("123 is invalid");
    wizardPage.clickNext(); //it should not go to next page because of the error.
    wizardPage.assertIfPageContains("First FEG");
  });
  it("An Empty registration without any FEG created", () => {
    dashboardPage.editProfile("Empty Group");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Registration date", "Register EmptyGroup");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  });
});
