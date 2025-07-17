import { application } from './application.cy';
import { deleteAll } from './deleteAll.cy';
import { k8s } from './k8s.cy';
import { login } from './login.cy';
import { remoteHPC } from './remoteHPC.cy';
import { vm } from './vm.cy';

let skip = false;
const testK8s = true;
describe('Trusty Cloud Full Test', () => {
  login();
  deleteAll(testK8s);

  vm();
  remoteHPC();
  application();
  k8s();

  deleteAll(testK8s);
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
