import { useGlobal } from '@/store';

export const uiShowProgress = (message: string = '') => {
  useGlobal().uiShowProgressDlg({
    message,
  });
};

export const uiHideProgress = () => {
  useGlobal().uiHideProgressDlg();
};
