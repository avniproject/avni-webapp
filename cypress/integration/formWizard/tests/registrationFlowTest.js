/// <reference types="Cypress" />

import { wizardPage } from "../pages/wizardPage";
import { dashboardPage } from "../pages/dashboardPage";
import { formWizardOrgPassword, formWizardOrgUsername } from "../../constants";
import { setupTest } from "../setup";

describe("Registration Flow tests for form wizard", () => {
  beforeEach(() => {
    setupTest.login(formWizardOrgUsername, formWizardOrgPassword);
    setupTest.cleanAllOptionsFromRegistration("Test Person");
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

  it("First FEG is hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FEG");
    wizardPage.clickPreviousNTimes(4);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(4);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FEG");
  });
  it("First FEG is hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of first FEG", "Hide last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNextNTimes(2);
    wizardPage.assertIfPageContains(
      "Summary & Recommendations",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
    wizardPage.clickPreviousNTimes(4);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(4);
    wizardPage.assertIfPageContains(
      "Summary & Recommendations",
      "Hide first FE of first FEG",
      "Hide last FE of first FEG"
    );
  });
  it("First FE in first FEG is hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOption("Hide first FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.clickNextNTimes(3);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FE of first FEG");
    wizardPage.clickPreviousNTimes(5);
    wizardPage.assertIfPageContains("Register Person");
    wizardPage.clickNextNTimes(5);
    wizardPage.assertIfPageContains("Summary & Recommendations", "Hide first FE of first FEG");
  });
  it("Last FE in first FEG is hidden", () => {
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
  it("should not move to next page if first name is empty", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clearInput("firstName");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("There is no value specified");
    wizardPage.assertIfPageContains("Register Person");
  });
  it("Second FEG is hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Modifier");
  });
  it("Second FEG is hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of second FEG", "Hide last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Modifier");
  });

  it("First FE in second FEG is hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of second FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
  });

  it("Last FE in second FEG is hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide last FE of second FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
  });

  it("Last FEG is hidden using FEG rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Modifier");
  });

  it("Last FEG is hidden using all FE rule", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of last FEG", "Hide last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Modifier");
  });

  it("First FE in last FEG is hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide first FE of last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of last FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
  });

  it("Last FE in last FEG is hidden", () => {
    dashboardPage.editProfile("Test Person");
    wizardPage.clickNext();
    wizardPage.selectOptions("Hide last FE of last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of last FEG");

    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of last FEG");

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );

    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
  });
});
