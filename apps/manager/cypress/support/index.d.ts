/// <reference types="cypress" />
/// <reference types="cypress-real-events" />
import 'cypress-file-upload';

Cypress.Commands.add('upload_file', (fileName, fileType = ' ', selector) => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName, 'base64').then(content => {
      const el = subject[0];
      const testFile = new File([content], fileName, { type: fileType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      el.files = dataTransfer.files;
    });
  });
});

declare namespace Cypress {
  interface Chainable<Subject> {
    realMouseDown(options?: Partial<{ button: 'left' | 'right' | 'middle' }>): Chainable<Subject>;
    realMouseMove(x: number, y: number, options?: Partial<{ position: 'topLeft' | 'top' | 'topRight' | 'left' | 'center' | 'right' | 'bottomLeft' | 'bottom' | 'bottomRight' }>): Chainable<Subject>;
    realMouseUp(options?: Partial<{ button: 'left' | 'right' | 'middle' }>): Chainable<Subject>;
  }
}