import 'cypress-if';

export const deleteAll = (k8s = false) => {
  it('delete all artifacts', () => {
    cy.toDashboard();
    cy.get('div').contains('資料儲存').click().wait(2000);
    cy.deleteTableItem('e2ebucket');

    cy.toDashboard();
    cy.get('div').contains('HPC 遠端派送').click().wait(2000);
    cy.deleteTableItem('e2e');
    cy.get('.ocis-left-menu').contains('遠端映像檔').click().wait(1000);
    cy.deleteTableItem('e2e');
    cy.get('.ocis-left-menu').contains('遠端資料').click().wait(1000);
    cy.deleteTableItem('e2e');

    cy.toDashboard();
    cy.get('div').contains('應用服務 APP').click().wait(2000);
    cy.deleteTableItem('e2e');

    if (k8s) {
      cy.toDashboard();
      cy.get('div').contains('K8S 叢集').click().wait(2000);
      cy.deleteTableItem('e2e');
    }

    cy.toDashboard();
    cy.get('div').contains('虛擬機器').click().wait(2000);
    cy.url().should('include', '/vm/list');
    cy.deleteTableItem('e2evm');
    cy.get('.ocis-left-menu').contains('鑰匙對').click().wait(1000);
    cy.deleteTableItem('e2ekeypair');
    cy.get('.ocis-left-menu').contains('負載平衡').click().wait(1000);
    cy.deleteTableItem('e2elb');
    cy.get('.ocis-left-menu').contains('自動擴展').click().wait(1000);
    cy.deleteTableItem('e2eas');
    cy.get('.ocis-left-menu').contains('虛擬磁碟').click().wait(1000);
    cy.deleteTableItem('e2evolume');
    cy.get('#v-list-group--id-虛擬網路介面 > div.v-list-item__append > i')
      .click()
      .wait(1000);
    cy.get(
      '#app > div > div > main > div.ocis-left-menu > nav > div > div > div:nth-child(8) > div.v-list-group__items > div:nth-child(1)'
    )
      .click()
      .wait(1000);
    cy.deleteTableItem('e2enetwork');
    cy.get('.ocis-left-menu').contains('安全群組').click().wait(1000);
    cy.deleteTableItem('e2esg');
  });
};
