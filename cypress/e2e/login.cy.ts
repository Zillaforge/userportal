export const login = () => {
  it('login', () => {
    cy.clearCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.fixture('server.json').then(server => {
      cy.visit(server.url as string);
    });
    cy.get('button').contains('其他使用者').click();
    cy.fixture('user.json').then(user => {
      cy.get('input[placeholder="請輸入帳號"]').type(user.account as string);
      cy.get('input[placeholder="請輸入密碼"]').type(user.password as string);
    });
    cy.get('button').contains('登入').click().wait(3000);
    cy.url().should('include', '/dashboard');
  });
};
