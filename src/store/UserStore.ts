import { defineStore } from 'pinia';
import { ref, type Ref, computed } from 'vue';

import { StatusCodes as HttpStatus } from 'http-status-codes';

import type { IamUserInfo } from '@/interfaces/DataTypeInterface';
import type { VueCookies } from 'vue-cookies';

import {
  loginApi,
  logoutApi,
  changePasswordApi,
  fetchUserInfo,
  makeApiCall,
  verifyTokenApi,
} from '@/api';
import { setToken2Cookie, removeAllCookies } from '@/utils/utils';

const useUserStore = defineStore('user', () => {
  // State
  const cookiesInstance = ref<VueCookies | undefined>(undefined);
  const token: Ref<string> = ref('');
  const userInfo: Ref<IamUserInfo> = ref({
    account: '',
    createdAt: '',
    description: '',
    displayName: '',
    email: '',
    extra: undefined,
    frozen: false,
    lastLoginAt: '',
    mfa: false,
    namespace: '',
    updatedAt: '',
    userId: '',
  });

  // Getters
  const getToken = computed(() => token.value);
  const getUserInfo = computed(() => userInfo.value);
  const getCookiesInstance = computed(() => cookiesInstance.value);
  const isCloudinfraUser = computed(
    () => userInfo.value?.namespace === 'ci.asus.com'
  );

  // Actions
  const setLoginInfo = (payload: any) => {
    userInfo.value = payload.userInfo;
    token.value = payload.token;
  };

  const verifyToken = async (token: string) => {
    await makeApiCall({
      apiCallFn: verifyTokenApi,
      payload: token,
      skipErrorDialog: true,
      successCallback: () => {
        setLoginInfo({ token });
        setToken2Cookie(token);
      },
      errorCallback: async err => await Promise.reject(err),
    });
  };

  const login = async (payload: {
    token?: string;
    account?: string;
    password?: string;
  }) => {
    const serverRes = await makeApiCall({
      apiCallFn: loginApi,
      payload: payload.token
        ? {
            token: payload.token,
          }
        : {
            account: payload.account,
            password: payload.password,
          },
      skipErrorDialog: true,
    });

    if (serverRes?.status === HttpStatus.OK) {
      token.value = serverRes?.data?.token ?? '';
      userInfo.value = serverRes?.data?.userInfo ?? {};
      setLoginInfo({ token: token.value, userInfo: userInfo.value });
      setToken2Cookie(token.value);
      // await fetchUserSelfInfo();
      return await Promise.resolve(serverRes);
    } else if (serverRes?.status === HttpStatus.RESET_CONTENT) {
      return await Promise.resolve(serverRes);
    } else {
      return await Promise.reject(new Error('Login Fail'));
    }
  };

  const logout = async () => {
    await makeApiCall({
      apiCallFn: logoutApi,
      skipErrorDialog: true,
    });
    try {
      await fetch('https://iservice.nchc.org.tw/nchc_service/new_saml_slo.php');
    } catch (err) {
      // in order to not trigger error dialog from changePassword function
      console.log('iservice error');
    } finally {
      removeAllCookies();
      location.reload();
    }
  };

  const changePassword = (password: string) => {
    makeApiCall({
      apiCallFn: changePasswordApi,
      payload: password,
      successCallback: logout,
    });
  };

  const setCookiesInstance = (cookie: VueCookies | undefined) => {
    cookiesInstance.value = cookie;
  };

  const fetchUserSelfInfo = async (
    cookieToken: string,
    skipProgress: boolean = false,
    skipErrorDialog: boolean = true
  ) => {
    token.value = cookieToken;
    const serverRes = await makeApiCall({
      apiCallFn: fetchUserInfo,
      skipProgress,
      skipErrorDialog,
    });

    if (serverRes?.status === HttpStatus.OK) {
      setLoginInfo({ token: token.value, userInfo: serverRes?.data ?? {} });
      setToken2Cookie(token.value);
      return await Promise.resolve(true);
    } else {
      return await Promise.resolve(false);
    }
  };
  return {
    token,
    userInfo,
    getCookiesInstance,
    getToken,
    getUserInfo,
    isCloudinfraUser,
    fetchUserSelfInfo,
    setCookiesInstance,
    setLoginInfo,
    login,
    logout,
    verifyToken,
    changePassword,
    cookiesInstance,
  };
});

export default useUserStore;
