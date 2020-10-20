/// <reference types="Cypress" />

describe("My First Test", () => {
  it("Can create new Subject Type", () => {
    cy.visit("https://staging.avniproject.org");
    cy.get("#username").type("admin@hiren2");
    cy.get("#password").type("password");
    cy.get(".MuiButtonBase-root").click();
    cy.contains("Data Entry").click();
    cy.get(":nth-child(2) > .MuiButtonBase-root > .MuiButton-label").click();
    cy.contains("Individual").click();
    cy.contains("Register Individual").should("be.visible");
  });
});
