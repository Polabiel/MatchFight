// apps/nextjs/cypress/support/commands.ts

/**
 * Login full-stack: chama a rota de seed que popula o banco e devolve
 * um cookie de sessão válido, então o seta no navegador.
 *
 * Esta rota só funciona em não-produção e requer Postgres rodando.
 */
interface SeedResponse {
  cookieName: string;
  cookieValue: string;
}

Cypress.Commands.add("login", () => {
  cy.request<SeedResponse>("GET", "/api/test/seed").then((res) => {
    cy.setCookie(res.body.cookieName, res.body.cookieValue);
  });
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Faz login real via seed route. Requer Postgres + migrações.
       * Uso: cy.login()  →  cy.visit("/swipe")
       */
      login(): Chainable<void>;
    }
  }
}

export {};