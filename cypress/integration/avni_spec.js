/// <reference types="Cypress" />

describe("Data Entry App", () => {
  it("Can open new registration form", () => {
    cy.login({ username: "admin@hiren2", password: "password" });
    cy.contains("Data Entry").click();
    cy.get(":nth-child(2) > .MuiButtonBase-root > .MuiButton-label").click();
    cy.contains("Individual").click();
    cy.contains("Register Individual").should("be.visible");
  });
});
