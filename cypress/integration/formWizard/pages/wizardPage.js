import { forEach, range } from "lodash";
import { dashboardPage } from "./dashboardPage";

export const wizardPage = {
  clickNext() {
    cy.get("#next").click();
  },

  clickSave() {
    cy.get("#save").click();
  },

  clickNextNTimes(n) {
    forEach(range(n), () => wizardPage.clickNext());
  },

  clickPrevious() {
    cy.get("#previous").click();
  },

  clickPreviousNTimes(n) {
    forEach(range(n), () => wizardPage.clickPrevious());
  },

  selectOption(formElementName) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    cy.get(formElementId).check();
  },

  selectOptions(...formElementNames) {
    forEach(formElementNames, wizardPage.selectOption);
  },

  typeInput(formElementName, text) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    cy.get(formElementId)
      .clear()
      .type(text);
  },

  assertIfPageContains(...strings) {
    forEach(strings, string => cy.contains(string).should("be.visible"));
  },

  assertIfPageDoesNotContains(...strings) {
    forEach(strings, string => cy.contains(string).should("not.exist"));
  },

  clearInput(formElementName) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    const fromElement = cy.get(formElementId);
    fromElement.clear();
  },

  unCheckOption(formElementName) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    const formElement = cy.get(formElementId);
    formElement.uncheck();
  },

  unCheckOptions(...formElementNames) {
    forEach(formElementNames, wizardPage.unCheckOption);
  },

  enterDate(formElementName, dateString) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    cy.get(formElementId)
      .clear()
      .type(dateString);
  },
  modifyRegistration(subjectName, ...formElementNames) {
    dashboardPage.editProfile(subjectName);
    wizardPage.clickNext();
    wizardPage.selectOptions(...formElementNames);
    wizardPage.clickNext();
    wizardPage.clickSave();
  },
  checkScenarioHideFirstFEG() {
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of Last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of Last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideFirstFEGbyAllFEG() {
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideFirstFEofFirstFEG() {
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideLastFEofFirstFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideSecondFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideSecondFEGbyAllFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.assertIfPageDoesNotContains("Second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideFirstFEofSecondFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideLastFEofSecondFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "First FE of second FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideLastFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideLastFEGbyAllFEG() {
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("Last FEG");
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideFirstFEofLastFEG() {
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
  },
  checkScenarioHideLastFEofLastFEG() {
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
  },
  checkScenarioHideAllFEG() {
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains(
      "Last FEG",
      "First FE of last FEG",
      "Last FE of last FEG"
    );
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of last FEG"
    );
    wizardPage.assertIfPageDoesNotContains(
      "First FEG",
      "First FE of first FEG",
      "Last FE of first FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioFEGhiddeninSameForm() {
    wizardPage.selectOption("Hide second FEG");
    wizardPage.assertIfPageContains("First FEG", "Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.assertIfPageContains("First FEG");
  },
  checkScenarioFEhiddeninSameFEG() {
    wizardPage.assertIfPageContains("First FE of first FEG", "Last FE of first FEG");
    wizardPage.selectOption("Hide last FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains(
      "Second FEG",
      "First FE of second FEG",
      "Last FE of second FEG"
    );
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("Last FE of first FEG");
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  },
  checkScenarioHideFEinAnotherFEGInSameForm() {
    wizardPage.selectOption("Hide first FE of second FEG");
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickPrevious();
    wizardPage.assertIfPageContains("First FEG", "First FE of first FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageDoesNotContains("First FE of second FEG");
    wizardPage.assertIfPageContains("Second FEG", "Last FE of second FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Last FEG", "First FE of last FEG", "Last FE of last FEG");
    wizardPage.clickNext();
    wizardPage.assertIfPageContains("Summary & Recommendations");
  }
};
