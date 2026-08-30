describe("Fights Page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("exibe lista de lutas com detalhes", () => {
    cy.visit("/fights");

    // Título
    cy.contains("Lutas").should("be.visible");
    cy.contains("Suas lutas").should("be.visible");

    // Card da luta — nomes
    cy.contains("Thiago Silva").should("be.visible");
    cy.contains("Anderson K.").should("be.visible");
    cy.contains("vs").should("be.visible");

    // Local e status
    cy.contains("Chute Boxe, PR").should("be.visible");
    cy.contains("CONFIRMADA").should("be.visible");
  });
});
