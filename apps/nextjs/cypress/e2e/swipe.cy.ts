describe("Swipe Page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("exibe candidatos, filtro de peso e botões de ação", () => {
    cy.visit("/swipe");

    // Título
    cy.contains("Find your opponent").should("be.visible");

    // Filtro de peso
    cy.get('select[aria-label="Filter by weight class"]').should("exist");

    // Card do candidato
    cy.contains("José Carlos").should("be.visible");
    cy.contains("8-6").should("be.visible");
    cy.contains("Lightweight").should("be.visible");

    // Botões
    cy.contains("Passar").should("be.visible");
    cy.contains("Dar Match").should("be.visible");
  });
});