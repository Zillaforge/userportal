import 'cypress-if';

export const vm = () => {
  it('enter vm menu', () => {
    cy.toDashboard();
    cy.get('div').contains('虛擬機器').click().wait(2000);
  });
  it('Keypair create', () => {
    cy.get('.ocis-left-menu').contains('鑰匙對').click().wait(1000);
    cy.url().should('include', '/keypair/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('kp','e2ekeypair');
    cy.get('button').filter(':visible').contains('確定').click().wait(1000);
    cy.get('button').filter(':visible').contains('關閉').click().wait(1000);
  });

  it('Volume create',() => {
    cy.get('.ocis-left-menu').contains('虛擬磁碟').click().wait(1000)
    cy.url().should('include', '/volume/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('vol','e2evolume');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(1000);
  });

  it('Network create',() => {
    cy.get('#v-list-group--id-虛擬網路介面 > div.v-list-item__append > i')
      .click()
      .wait(1000);
    cy.get(
      '#app > div > div > main > div.ocis-left-menu > nav > div > div > div:nth-child(8) > div.v-list-group__items > div:nth-child(1)'
    )
      .click()
      .wait(1000);
    cy.url().should('include', '/network/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('vn','e2enetwork');
    cy.get('input[placeholder="eg. 10.0.0.0/24"]').type('192.168.0.0/24');
    cy.get('input[placeholder="eg.10.0.0.254"]').type('192.168.0.1');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(1000);
    cy.url({ timeout: 10000 }).should('include', '/network/list');
  })

  it('SecurityGroup create', () => {
    cy.get('.ocis-left-menu').contains('安全群組').click().wait(1000);
    cy.url().should('include', '/securityGroup/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('sg', 'e2esg');
    cy.get('button').contains('下一步 : 規則設定').click().wait(1000);
    cy.get('button').contains('新增安全群組規則').click().wait(1000);
    cy.get('input[placeholder="連接埠範圍(最小)"]').type('6443');
    cy.get('input[placeholder="連接埠範圍(最大)"]').type('6443');
    cy.get('input[placeholder="CIDR"]').type('10.0.0.0/24');
    cy.get('button').filter(':visible').contains('確定').click().wait(1000);
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(3000);
  })

  it('VM Create', () => {
    cy.get('#v-list-group--id-虛擬機器 > div.v-list-item__append > i')
      .click()
      .wait(1000);
    cy.get('.ocis-left-menu').contains('虛擬機器管理').click();
    cy.url().should('include', '/vm/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('vm', 'e2evm');
    cy.get('button').contains('下一步 : 硬體設定').click().wait(1000);
    cy.get('button').contains('下一步 : 虛擬網路').click().wait(1000);
    cy.get('button').contains('新增虛擬網卡').click().wait(1000);
    cy.get('button').filter(':visible').contains('確定').click().wait(1000);
    cy.get('button').contains('下一步 : 儲存資訊').click().wait(1000);
    cy.get('button').contains('掛載虛擬磁碟').click().wait(1000);
    cy.get('button').filter(':visible').contains('確定').click().wait(1000);
    cy.get('button').contains('下一步 : 認證').click().wait(1000);
    cy.get('label').contains('啟用').click().wait(1000);
    cy.get('input[placeholder="密碼"]').type('Abcd.1234');
    cy.get('button').contains('下一步 : 初始化指令').click().wait(1000);
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').filter(':visible').contains(' 建立').click().wait(5000);
  });

  it('LoadBalancer create', () => {
    cy.get('.ocis-left-menu').contains('負載平衡').click().wait(1000)
    cy.url().should('include', '/loadBalancer/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('lb', 'e2elb');
    cy.get('input[placeholder="虛擬網路"]').parent().click().wait(1000);
    cy.get('.v-list-item-title').contains('default').click();
    cy.get('button').contains('下一步 : 監聽器 / 目標群組').click().wait(1000);
    cy.get('input[placeholder="監聽器連接埠"]').type('1234');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(5000);
    // eslint-disable-next-line require-jsdoc
    function waitAndClick(count = 0, maxRetry = 20, interval = 5000) {
      if (count > maxRetry) {
        return;
      }
      cy.get('.mdi-minus-circle')
        .if()
        .then(() => {
          cy.get('.mdi-refresh').click().wait(interval);
          waitAndClick(count + 1);
        });
    }
    waitAndClick();
    cy.get('.mdi-minus-circle').should('not.exist');
    cy.get('.mdi-check-circle').should('exist');
  });

  it('AutoScaling create', () => {
    cy.get('.ocis-left-menu').contains('自動擴展').click().wait(1000)
    cy.url().should('include', '/autoScaling/list');
    cy.get('button').contains('建立').click().wait(1000);
    cy.inputName('as', 'e2eas');
    cy.get('input[placeholder="虛擬網路"]').parent().click().wait(1000);
    cy.get('.v-list-item-title').contains('default').click();
    cy.get('button').contains('下一步 : 虛擬機器規格').click().wait(1000);
    cy.get('.v-combobox--multiple').type('e2esg').wait(1000);
    cy.get('input[placeholder="密碼"]').type('Abcd.1234');
    cy.get('button').contains('下一步 : 檢閱+建立').click().wait(1000);
    cy.get('button').contains(' 建立').click().wait(5000);
  });
};
