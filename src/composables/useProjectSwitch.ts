import { useProject } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, watch, onBeforeUnmount } from 'vue';

// eslint-disable-next-line require-jsdoc
export default function () {
  const { getCurrentProject } = storeToRefs(useProject());

  const projectSwitchCallback = ref<(() => any) | null>(null);
  const setProjectSwitchCallback = (callback: () => any) => {
    projectSwitchCallback.value = callback;
  };
  const clearProjectSwitchCallback = () => {
    projectSwitchCallback.value = null;
  };

  watch(getCurrentProject, (newVal, oldVal) => {
    if (newVal.id !== oldVal.id) {
      if (projectSwitchCallback.value) {
        projectSwitchCallback.value();
      }
    }
  });
  onBeforeUnmount(() => {
    clearProjectSwitchCallback();
  });

  return {
    setProjectSwitchCallback,
    clearProjectSwitchCallback,
  };
}
