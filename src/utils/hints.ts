import i18n from '@/i18n';
import validation from '@/utils/validation';

const { t } = i18n.global;

const requiredHint = (event: string) => {
  if (event) {
    return {
      icon: 'mdi-check-circle',
      color: 'hint-success',
      text: t('form.required'),
    };
  }
  return {
    icon: 'mdi-close-circle',
    color: 'hint-error',
    text: t('form.required'),
  };
};

const nameHint = (event: string, max: number, min: number) => {
  /*
   * hint1 : first char must be a lowercase alphabet
   * hint2 : content must be lowercase or number and allow dash -
   * hint3 : length must be between 3 and 63
   */
  const hint1 = validation.firstAlphabet(event) === true;
  const hint2 = validation.ruleOnlyAlphabetNumberMinusRule(event) === true;
  const hint3 = validation.ruleInputLength('length', max, min)(event) === true;
  return [
    {
      icon: hint1 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint1 ? 'hint-success' : 'hint-error',
      text: t('form.firstAlphabetLowercase'),
    },
    {
      icon: hint2 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint2 ? 'hint-success' : 'hint-error',
      text: t('form.error.en.number.Minus'),
    },
    {
      icon: hint3 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint3 ? 'hint-success' : 'hint-error',
      text: t('form.inputLength', { min, max }),
    },
  ];
};

const firstAlphabetHint = (event: string) => {
  const hint = validation.firstAlphabet(event) === true;
  return [
    {
      icon: hint ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint ? 'hint-success' : 'hint-error',
      text: t('form.firstAlphabetLowercase'),
    },
  ];
};

const lowercaseNumberMinusDotHint = (event: string) => {
  const hint = validation.lowercaseNumberMinusDot(event) === true;
  return [
    {
      icon: hint ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint ? 'hint-success' : 'hint-error',
      text: t('form.lowercaseNumberMinusDot'),
    },
  ];
};

const numberHint = (numberInfo: {
  val: number;
  minVal: number;
  maxVal: number;
}) => {
  const hint1 = validation.checkNumberRange(numberInfo) === true;
  return [
    {
      icon: hint1 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: hint1 ? 'hint-success' : 'hint-error',
      text: t('form.error.number.exceedLimit', {
        min: numberInfo.minVal,
        max: numberInfo.maxVal,
      }),
    },
  ];
};

const passwordHint = (event: string) => {
  const uppercase = validation.atLeastOne.upperCase(event) === true;
  const lowercase = validation.atLeastOne.lowerCase(event) === true;
  const digit = validation.atLeastOne.digit(event) === true;
  const special = validation.atLeastOne.special(event) === true;
  const length = validation.checkPwdLength(event) === true;
  return [
    {
      icon: uppercase ? 'mdi-check-circle' : 'mdi-close-circle',
      color: uppercase ? 'hint-success' : 'hint-error',
      text: t('form.error.atLeastOne.upperCase'),
    },
    {
      icon: lowercase ? 'mdi-check-circle' : 'mdi-close-circle',
      color: lowercase ? 'hint-success' : 'hint-error',
      text: t('form.error.atLeastOne.lowerCase'),
    },
    {
      icon: digit ? 'mdi-check-circle' : 'mdi-close-circle',
      color: digit ? 'hint-success' : 'hint-error',
      text: t('form.error.atLeastOne.digit'),
    },
    {
      icon: special ? 'mdi-check-circle' : 'mdi-close-circle',
      color: special ? 'hint-success' : 'hint-error',
      text: t('form.error.atLeastOne.special'),
    },
    {
      icon: length ? 'mdi-check-circle' : 'mdi-close-circle',
      color: length ? 'hint-success' : 'hint-error',
      text: t('form.error.pwd.length'),
    },
  ];
};

export default {
  nameHint,
  numberHint,
  requiredHint,
  passwordHint,
  firstAlphabetHint,
  lowercaseNumberMinusDotHint,
};
