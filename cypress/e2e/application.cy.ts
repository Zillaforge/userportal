export const application = () => {
  it('application create', () => {
    cy.toDashboard();
    cy.get('div').contains('應用服務 APP').click().wait(2000);

    cy.get('button').contains('建立').click().wait(1000);
    cy.get('.option-card').first().click().wait(1000);
    cy.get('button').filter(':visible').contains('確定').click().wait(1000);
    cy.get('button').contains('下一步 : 硬體設定').click().wait(1000);
    cy.get('button').contains('下一步 : 虛擬網路').click().wait(1000);
    cy.get('button').contains('下一步 : 認證').click().wait(1000);
    cy.get('input[placeholder="密碼"]').type('Abcd.1234');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);

    cy.get('.mdi-autorenew', { timeout: 600000 }).should('not.exist');
    cy.get('.mdi-check-circle').should('exist');
  });
};
