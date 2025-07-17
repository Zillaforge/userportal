import { ref, watch, onBeforeUnmount } from 'vue';

const autoReloadMonitorItem = ref<any>(null);
const timer = ref<number>(0);
const autoReloadCallback = ref<(() => any) | null>(null);
const autoReloadCondition = ref<string[]>([]);
// eslint-disable-next-line require-jsdoc
export default function () {
  const setAutoReload = (
    item: any,
    callback: () => any,
    condition: string[]
  ) => {
    autoReloadMonitorItem.value = item;
    autoReloadCallback.value = callback;
    autoReloadCondition.value = condition;
  };

  onBeforeUnmount(() => {
    clearInterval(timer.value);
  });

  watch(
    autoReloadMonitorItem,
    newVal => {
      if (
        autoReloadCondition.value.some(
          (condition: any) =>
            newVal?.value?.status?.toLowerCase() === condition?.toLowerCase()
        )
      ) {
        if (!timer.value) {
          timer.value = window.setInterval(() => {
            autoReloadCallback.value?.();
          }, 10000);
        }
      } else {
        clearInterval(timer.value);
        timer.value = 0;
      }
    },
    { deep: true }
  );
  return {
    setAutoReload,
  };
}
