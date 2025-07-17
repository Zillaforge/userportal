import { application } from './application.cy';
import { deleteAll } from './deleteAll.cy';
import { login } from './login.cy';
import { remoteHPC } from './remoteHPC.cy';
import { vm } from './vm.cy';

let skip = false;
describe('Trusty Cloud Full Test', () => {
  login();
  deleteAll();

  vm();
  remoteHPC();
  application();

  deleteAll();
  beforeEach(function () {
    if (skip) {
      this.skip();
    }
  });
  afterEach(function () {
    if (this.currentTest?.state === 'failed') {
      skip = true;
    }
  });
});
