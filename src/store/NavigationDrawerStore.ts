import { defineStore } from 'pinia';

interface ConfigState {
  showMiniDrawer: boolean;
}
const useNavigationDrawerStore = defineStore('navigationDrawer', {
  state: (): ConfigState => ({
    showMiniDrawer: false,
  }),
  getters: {
    showNavigationDrawer: (s): boolean => s.showMiniDrawer,
  },
  actions: {
    toggleNavigationDrawer(value?: boolean) {
      this.showMiniDrawer = value ?? !this.showMiniDrawer;
    },
  },
});

export default useNavigationDrawerStore;
