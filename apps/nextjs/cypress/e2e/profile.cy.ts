describe("Profile Page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("exibe perfil do lutador com cartel e detalhes", () => {
    cy.visit("/profile");

    // Nome e nickname
    cy.contains("Thiago Silva").should("be.visible");
    cy.contains("Thiago").should("be.visible");

    // Role badge
    cy.contains("Fighter").should("be.visible");

    // Record
    cy.contains("14-2").should("be.visible");
    cy.contains("Record").should("be.visible");

    // Bio
    cy.contains("Striker especialista em muay thai").should("be.visible");

    // Weight class
    cy.contains("Lightweight").should("be.visible");

    // Location
    cy.contains("São Paulo, SP").should("be.visible");

    // Link de edição
    cy.contains("Edit Profile").should("be.visible");
  });
});