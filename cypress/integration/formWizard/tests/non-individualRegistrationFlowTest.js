/// <reference types="Cypress" />

import { wizardPage } from "../pages/wizardPage";
import { dashboardPage } from "../pages/dashboardPage";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";
import { setupTest } from "../setup";

describe("Registration Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromNonIndiRegistration("Test Group");
  });
  it("First FEG is hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide first FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideFirstFEG();
  });
  it("First FE in first FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide first FE of first FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideFirstFEofFirstFEG();
  });
  it("Last FE in first FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideLastFEofFirstFEG();
  });
  it("should not move to next page if first name is empty", () => {
    dashboardPage.editProfile("Test Group");
    wizardPage.clearInput("Name");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("There is no value specified");
    wizardPage.assertIfPageContains("Register Group");
  });
  it("Second FEG is hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide second FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideSecondFEG();
  });
  it("Second FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Group",
      "Hide first FE of second FEG",
      "Hide last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.checkScenarioHideSecondFEGbyAllFEG();
  });
  it("First FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide first FE of second FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideFirstFEofSecondFEG();
  });
  it("Last FE in second FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideLastFEofSecondFEG();
  });
  it("Last FEG is hidden using FEG rule", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide last FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideLastFEG();
  });
  it("Last FEG is hidden using all FE rule", () => {
    wizardPage.modifyIndividualRegistration(
      "Test Group",
      "Hide first FE of last FEG",
      "Hide last FE of last FEG"
    );
    wizardPage.clickNext();
    wizardPage.checkScenarioHideLastFEGbyAllFEG();
  });
  it("First FE in last FEG is hidden", () => {
    wizardPage.modifyIndividualRegistration("Test Group", "Hide first FE of last FEG");
    wizardPage.clickNext();
    wizardPage.checkScenarioHideLastFEGbyAllFEG();
  });
  // it("Last FE in last FEG is hidden", () => {
  //   wizardPage.modifyIndividualRegistration("Test Group","Hide last FE of last FEG");
  //   wizardPage.clickNext();

  // });
  // it("All the FE in the form are hidden", () => {
  //   dashboardPage.modifyIndividualRegistration("Test Group","Hide first FE of first FEG","Hide last FE of first FEG","Hide first FE of second FEG","Hide last FE of second FEG","Hide first FE of last FEG", "Hide last FE of last FEG");
  //   wizardPage.clickNext();

  // });
  // it("Validation error in last FE of first FEG", () => {
  //   dashboardPage.editProfile("Test Person");
  //   wizardPage.clickNext();
  //   wizardPage.clickNext();
  //   wizardPage.typeInput("Last FE of first FEG", 123);
  //   wizardPage.assertIfPageContains("123 is invalid");
  //   wizardPage.clickNext(); //it should not go to next page because of the error.
  //   wizardPage.assertIfPageContains("First FEG");
  // });
  // it("An Empty registration without any FEG created", () => {
  //   dashboardPage.editProfile("empty Test");
  //   wizardPage.clickNext();
  //   wizardPage.assertIfPageContains("Summary & Recommendations");
  //   wizardPage.clickPrevious();
  //   wizardPage.assertIfPageContains("Registration date");
  //   wizardPage.clickNext();
  //   wizardPage.assertIfPageContains("Summary & Recommendations");
  // });
});
