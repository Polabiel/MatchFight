describe("Sign In Page", () => {
  it("exibe formulário de login com Discord", () => {
    cy.visit("/sign-in");

    cy.contains("MatchFight").should("be.visible");
    cy.contains("Entrar com Discord").should("be.visible");
  });
});