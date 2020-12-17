import { CI_BASE_URL, DEV_BASE_URL, isDevEnv } from "../integration/constants";

Cypress.Commands.add("login", ({ username, password }) => {
  const url = isDevEnv ? `${DEV_BASE_URL}#/home` : CI_BASE_URL;
  cy.visit(url);
  if (!isDevEnv) {
    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get(".MuiButtonBase-root").click();
  }
});
