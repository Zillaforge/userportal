// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      inputName(startWith: string, value: string): void;

      // eslint-disable-next-line @typescript-eslint/method-signature-style
      deleteTableItem(search: string, timeout?: number): void;

      // eslint-disable-next-line @typescript-eslint/method-signature-style
      toDashboard(): void;
    }
  }
}