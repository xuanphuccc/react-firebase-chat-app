function Validator(options) {
  let errorMessage = undefined;
  if (options.rules && options.rules.length > 0) {
    for (let i = 0; i < options.rules.length; i++) {
      errorMessage = options.rules[i].test(options.rules[0].inputValue);

      if (errorMessage) {
        break;
      }
    }
    if (errorMessage) {
      options.setErrorMessage(errorMessage);
      return false;
    } else {
      return true;
    }
  }

  return false;
}

Validator.isRequired = (inputValue, message) => {
  return {
    inputValue,
    test: (value) => {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = (inputValue, message) => {
  return {
    inputValue,
    test: (value) => {
      var regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : message || "Vui lòng nhập email";
    },
  };
};

Validator.minLength = (inputValue, min, message) => {
  return {
    inputValue,
    test: (value) => {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

export default Validator;
