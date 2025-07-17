import { createI18n } from 'vue-i18n';

import en from '@/i18n/en/lang';
import tw from '@/i18n/tw/lang';

let browserPreferredLang =
  window.navigator.languages?.[0] || window.navigator.language;

if (browserPreferredLang.slice(0, 2) === 'zh') {
  browserPreferredLang = 'tw';
} else {
  browserPreferredLang = 'en';
}
const locale = localStorage.getItem('locale') ?? browserPreferredLang;
localStorage.setItem('locale', locale);

const i18n = createI18n({
  locale: 'tw', // set locale
  messages: { en, tw },
});
export default i18n;
