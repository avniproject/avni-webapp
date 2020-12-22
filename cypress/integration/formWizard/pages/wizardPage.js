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
  }
};
