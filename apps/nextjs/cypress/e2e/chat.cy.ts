describe("Chat Page", () => {
  beforeEach(() => {
    cy.login();
  });

  it("exibe mensagens, campo de input e botão enviar", () => {
    const fightId = "00000000-0000-0000-0000-000000000001";
    cy.visit(`/fights/${fightId}/chat`);

    // Cabeçalho
    cy.contains("Opponent Name").should("be.visible");

    // Mensagens
    cy.contains("E aí, pronto para o combate?").should("be.visible");
    cy.contains("Sempre pronto. Nos vemos no octógono.").should("be.visible");
    cy.contains("O treino hoje foi pesado. Vou descansar.").should(
      "be.visible",
    );

    // Input
    cy.get('input[placeholder="Type a message..."]').should("exist");

    // Botão de envio
    cy.contains("Send").should("be.visible");
  });
});
