import { forEach, range } from "lodash";

export const wizardPage = {
  clickNext() {
    cy.get("#next").click();
  },

  clickSave() {
    cy.get("#next").click();
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
    const formElement = cy.get(formElementId);
    formElement.uncheck();
    formElement.click();
  },

  selectOptions(...formElementNames) {
    forEach(formElementNames, wizardPage.selectOption);
  },

  typeInput(formElementName, text) {
    const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
    const fromElement = cy.get(formElementId);
    fromElement.clear();
    fromElement.type(text);
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
  }
};
