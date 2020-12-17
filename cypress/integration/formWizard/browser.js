export const browser = {
  pressBack() {
    cy.go("back");
  },
  pressForward() {
    cy.go("forward");
  },
  reloadPage() {
    cy.reload();
  }
};
