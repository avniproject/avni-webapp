import { range, forEach } from "lodash";

Cypress.Commands.add("login", ({ username, password }) => {
  // cy.visit("https://staging.avniproject.org");
  cy.visit("http://localhost:6010/#/home");
  // cy.get("#username").type(username);
  // cy.get("#password").type(password);
  // cy.get(".MuiButtonBase-root").click();
});

Cypress.Commands.add("clickNext", () => {
  cy.get("#next").click();
});

Cypress.Commands.add("clickNextNTimes", n => {
  forEach(range(n), () => cy.clickNext());
});

Cypress.Commands.add("clickPrevious", () => {
  cy.get("#previous").click();
});

Cypress.Commands.add("clickPreviousNTimes", n => {
  forEach(range(n), () => cy.clickPrevious());
});

Cypress.Commands.add("typeInput", (formElementName, text) => {
  const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
  const fromElement = cy.get(formElementId);
  fromElement.clear();
  fromElement.type(text);
});

Cypress.Commands.add("selectOption", formElementName => {
  const formElementId = `#${formElementName.replaceAll(" ", "-")}`;
  const formElement = cy.get(formElementId);
  formElement.uncheck();
  formElement.click();
});

Cypress.Commands.add("selectHideLastFEG", () => {
  cy.clickNext();
  cy.selectOption("Hide last FEG");
});

Cypress.Commands.add("noSummaryPage", () => {
  cy.pageExcludes("Summary & Recommendations");
});

Cypress.Commands.add("pageContains", (...strings) => {
  forEach(strings, string => cy.contains(string).should("be.visible"));
});

Cypress.Commands.add("pageExcludes", (...strings) => {
  forEach(strings, string => cy.get(string).should("not.exist"));
});

Cypress.Commands.add("editProfile", subjectName => {
  cy.visit("http://localhost:6010/#/app");
  cy.get(`[value="${subjectName}"] > a`).click();
  cy.get("#profile-tab").click();
  cy.get("#profile-detail").click();
  cy.get("#edit-profile").click();
  cy.wait(1000);
});
