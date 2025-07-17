export const k8s = () => {
  it('k8s cluster create', () => {
    cy.toDashboard();
    cy.get('div').contains('K8S 叢集').click().wait(2000);
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('k8s', 'e2ek8s');
    cy.get('.v-select__selection').parent().click();
    cy.get('button').contains('下一步 : 硬體設定').click().wait(1000);
    cy.get('button').contains('下一步 : 虛擬網路').click().wait(1000);
    cy.get('.v-field__input').filter(':visible').parent().click();
    cy.get('.v-list-item-title').each($el => {
      cy.wrap($el)
        .invoke('text')
        .then((text: string) => {
          if (text.startsWith('e2e')) {
            cy.wrap($el).click();
          }
        });
    });
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);

    cy.get('.mdi-autorenew', { timeout: 1800000 }).should('not.exist');
    cy.get('.mdi-check-circle').should('exist');
  });
};
