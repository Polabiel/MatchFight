describe("Fight Detail Page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("exibe detalhes, VS e botões de ação", () => {
    const fightId = "00000000-0000-0000-0000-000000000001";
    cy.visit(`/fights/${fightId}`);

    // Título
    cy.contains("Luta").should("be.visible");

    // VS
    cy.contains("VS").should("be.visible");

    // Lutadores
    cy.contains("Thiago Silva").should("be.visible");
    cy.contains("Anderson K.").should("be.visible");

    // Status
    cy.contains("CONFIRMADA").should("be.visible");

    // Detalhes
    cy.contains("LOCAL").should("be.visible");
    cy.contains("Chute Boxe, PR").should("be.visible");
    cy.contains("JUIZ").should("be.visible");
    cy.contains("Não atribuído").should("be.visible");

    // Botões
    cy.contains("Cancelar luta").should("be.visible");
    cy.contains("💬 Chat").should("be.visible");
  });
});