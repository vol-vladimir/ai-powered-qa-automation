describe("example", () => {
  it("loads Cypress docs", () => {
    cy.visit("https://docs.cypress.io");
    cy.contains("Cypress").should("be.visible");
  });
});
