describe("Landing Page", () => {
  it("exibe hero, features e CTA", () => {
    cy.visit("/");

    // Hero
    cy.contains("Encontre seu próximo").should("be.visible");
    cy.contains("oponente").should("be.visible");

    // Features
    cy.contains("01").should("be.visible");
    cy.contains("02").should("be.visible");
    cy.contains("03").should("be.visible");
    cy.contains("Swipe").should("be.visible");
    cy.contains("Match").should("be.visible");
    cy.contains("Fight").should("be.visible");

    // CTA
    cy.contains("A luta começa antes do octógono").should("be.visible");

    // Nav — não autenticado
    cy.contains("Swipe").should("be.visible");
    cy.contains("Lutas").should("be.visible");
    cy.contains("Perfil").should("be.visible");
    cy.contains("Entrar").should("be.visible");
  });
});
