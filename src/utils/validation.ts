import i18n from '@/i18n';

const { t } = i18n.global;
const onlyLowercaseAndNumberRegExp = /^[a-z0-9]+$/;
const onlyLowercaseNumberMinusDotRegExp = /^[a-z0-9-.]+$/;

const ruleOnlyLowercaseAndNumber = (message?: string) => {
  return (val: string) => {
    const check = onlyLowercaseAndNumberRegExp.test(val);
    if (val && !check) {
      return message ?? t('form.lowercaseNumber');
    }
    return true;
  };
};

const ruleOnlyLowercaseNumberMinusDot = (message?: string) => {
  return (val: string) => {
    const check = onlyLowercaseNumberMinusDotRegExp.test(val);
    if (val && !check) {
      return message ?? t('form.lowercaseNumberMinusDot');
    }
    return true;
  };
};

const ruleRequired = (message?: string) => {
  return (val: string) => {
    return (!!val || message) ?? t('form.required');
  };
};

const ruleComboboxRequired = (message?: string) => {
  return (val: string[]) => {
    return (val.length > 0 || message) ?? t('form.required');
  };
};

const rulePassword = () => {
  return [
    atLeastOne.upperCase,
    atLeastOne.lowerCase,
    atLeastOne.digit,
    atLeastOne.special,
    checkPwdLength,
  ];
};

const ruleInputLength = (message: string, max: number, min: number = 1) => {
  return (val: string) => {
    const exceed = val && (val.length > max || val.length < min);
    if (exceed) return message;
    else if (!val && min >= 1) {
      return message;
    }
    return true;
  };
};

const duplicateCheck = (message: string, list: string[]) => {
  return (val: string) => {
    const duplicate = val && list.includes(val);
    if (duplicate) return message;
    else if (!val) return message;
    return true;
  };
};

const firstAlphabet = (input: string) => {
  return /^[a-z]$/.test(input.slice(0, 1)) || t('form.firstAlphabetLowercase');
};

const lastLowercaseNumber = (input: string) => {
  return (
    /^[a-z0-9]$/.test(input.slice(input.length - 1)) ||
    t('form.lastLowercaseNumber')
  );
};

const ruleFirstAlphabet = (message?: string) => {
  return (val: string) => firstAlphabet(val);
};

const ruleLastLowercaseNumber = (message?: string) => {
  return (val: string) => lastLowercaseNumber(val);
};

const lowercaseNumber = (input: string) => {
  return onlyLowercaseAndNumberRegExp.test(input) || t('form.lowercaseNumber');
};

const lowercaseNumberMinusDot = (input: string) => {
  return (
    onlyLowercaseNumberMinusDotRegExp.test(input) ||
    t('form.lowercaseNumberMinusDot')
  );
};

const atLeastOne = {
  upperCase: (input: string) => {
    const regex = /(?=.*[A-Z])/;
    return regex.test(input) || t('form.error.atLeastOne.upperCase');
  },
  lowerCase: (input: string) => {
    const regex = /(?=.*[a-z])/;
    return regex.test(input) || t('form.error.atLeastOne.lowerCase');
  },
  digit: (input: string) => {
    const regex = /(?=.*[0-9])/;
    return regex.test(input) || t('form.error.atLeastOne.digit');
  },
  special: (input: string) => {
    const regex = /(?=.*[\W_])/;
    return regex.test(input) || t('form.error.atLeastOne.special');
  },
};

const checkPwdLength = (input: string) => {
  return (
    (input.length <= 72 && input.length >= 8) || t('form.error.pwd.length')
  );
};

const checkNumberRange = ({
  val,
  minVal,
  maxVal,
}: {
  val: number;
  minVal: number;
  maxVal: number;
}) => {
  return (
    (val <= maxVal && val >= minVal) ||
    t('form.error.number.exceedLimit', { min: minVal, max: maxVal })
  );
};

const ruleOnlyAlphabetNumberMinusRule = (input: string) => {
  return (
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(input) || t('form.error.en.number.Minus')
  );
};

const ruleValidIp = (input: string) => {
  const ipRegex =
    /^\b((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b$/;
  return ipRegex.test(input) || t('form.error.invalid.ip');
};

const ruleValidCidr = (input: string) => {
  const cidrRegex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[1-2]?[0-9])$/;
  return cidrRegex.test(input) || t('form.error.invalid.cidr');
};

export default {
  ruleOnlyLowercaseAndNumber,
  ruleOnlyLowercaseNumberMinusDot,
  ruleRequired,
  ruleComboboxRequired,
  rulePassword,
  ruleInputLength,
  ruleFirstAlphabet,
  ruleLastLowercaseNumber,
  ruleOnlyAlphabetNumberMinusRule,
  ruleValidIp,
  ruleValidCidr,
  firstAlphabet,
  lastLowercaseNumber,
  lowercaseNumber,
  lowercaseNumberMinusDot,
  atLeastOne,
  checkPwdLength,
  checkNumberRange,
  duplicateCheck,
};
