import { should } from 'chai';
import 'cypress-if';

export const remoteHPC = () => {
  it('hpc remote create', () => {
    cy.toDashboard();
    cy.get('div').contains('HPC 遠端派送').click().wait(2000);

    // remote image
    cy.get('.ocis-left-menu').contains('遠端映像檔').click().wait(1000);
    cy.get('button').contains('建立').click().wait(1000);
    cy.get('button').contains('選擇').click().wait(1000);
    cy.get('.option-card').eq(1).click();
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);

    cy.get('.mdi-dots-vertical')
      .first()
      .if()
      .then($el => {
        cy.wrap($el).click().wait(1000);
        cy.get('.v-list-item-title').contains('同步').click().wait(1000);
      });

    cy.get('.mdi-autorenew', { timeout: 600000 }).should('not.exist');
    cy.get('.mdi-check-circle').should('exist');

    // remote data
    cy.toDashboard();
    cy.get('div').contains('資料儲存').click().wait(2000);
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('bucket', 'e2ebucket');
    cy.get('button').filter(':visible').contains('確定').click().wait(3000);
    cy.toDashboard();
    cy.get('div').contains('HPC 遠端派送').click().wait(2000);
    cy.get('.ocis-left-menu').contains('遠端資料').click().wait(1000);
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('hpcrd', 'e2ehpcdata');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);
    cy.get('.mdi-dots-vertical')
      .if()
      .then($el => {
        cy.wrap($el).click().wait(1000);
        cy.get('.v-list-item-title').contains('同步').click().wait(1000);
      });

    // remote hpc
    cy.toDashboard();
    cy.get('div').contains('HPC 遠端派送').click().wait(2000);
    cy.get('button').contains('建立').click().wait(1000);
    cy.get('button').contains('下一步 : 硬體設定').click().wait(1000);
    cy.get('button').contains('下一步 : 儲存設定').click().wait(1000);
    cy.get('input[placeholder="遠端資料儲存體"]').parent().click().wait(1000);
    cy.get('.v-list-item-title').contains('e2ehpcdata').click();
    cy.get('input[placeholder=""]').filter(':visible').type('/e2ehpc');
    cy.get('button').contains('下一步 : 變數設定').click().wait(1000);
    cy.get('button').contains('下一步 : 初始化指令').click().wait(1000);
    cy.get('textarea[placeholder="CMD"]').type('echo "Hello World"');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);

    cy.get('.mdi-check-circle', { timeout: 100000 }).should('exist');
  });
};
