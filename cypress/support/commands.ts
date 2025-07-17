/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import 'cypress-if';

const inputName = (startWith: string, value: string) => {
  cy.get('input').each($el => {
    cy.wrap($el)
      .invoke('val')
      .then((val: string) => {
        if (val.startsWith(startWith)) {
          cy.wrap($el).clear().type(value);
        }
      });
  });
};

const deleteTableItem = (search: string = 'e2e', timeouot: number = 300000) => {
  cy.get('.v-field__input')
    .should('exist', { timeout: 10000 })
    .first()
    .type(search)
    .wait(2000);
  cy.get('.mdi-dots-vertical')
    .if()
    .each(($el, index) => {
      cy.wrap($el).click().wait(500);
      cy.get('.v-list-item-title').contains('刪除').click().wait(500);
      cy.get('button').contains('確認').click();
    });
  cy.get('.mdi-dots-vertical', { timeout: timeouot }).should('not.exist');
};

const toDashboard = () => {
  cy.get('.v-img').first().click().wait(1000);
};

Cypress.Commands.addAll({
  inputName,
  deleteTableItem,
  toDashboard,
});
