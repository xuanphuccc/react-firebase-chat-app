import classNames from "classnames/bind";
import styles from "./SignUp.module.scss";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Form from "../Form";
import Validator from "../../../validateForm/Validator";

const cx = classNames.bind(styles);

function SignUp() {
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const nameInputRef = useRef();

  const validateNameInput = () => {
    const isValid = Validator({
      setErrorMessage: setNameError,
      rules: [Validator.isRequired(nameInput, "Vui lòng nhập tên của bạn")],
    });

    return isValid;
  };

  const validateEmailInput = () => {
    const isValid = Validator({
      setErrorMessage: setEmailError,
      rules: [
        Validator.isRequired(emailInput, "Vui lòng nhập email của bạn"),
        Validator.isEmail(emailInput, "Vui lòng nhập đúng định dạng"),
      ],
    });

    return isValid;
  };

  const validatePasswordInput = () => {
    const isValid = Validator({
      setErrorMessage: setPasswordError,
      rules: [
        Validator.isRequired(passwordInput, "Vui lòng nhập mật khẩu"),
        Validator.minLength(passwordInput, 8, ""),
      ],
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (
      validateNameInput() &&
      validateEmailInput() &&
      validatePasswordInput()
    ) {
      console.log("submit: ", { nameInput, emailInput, passwordInput });
    }
  };

  return (
    <Form title="Đăng ký tài khoản Satellite">
      {/* Sign Up with password */}
      <div className={cx("form_with-password")}>
        <p className={cx("form_description")}>
          Hoặc đăng ký với email và mật khẩu của bạn:
        </p>
        <div className={cx("form_input-wrapper")}>
          {/* Name Input */}
          <input
            ref={nameInputRef}
            onBlur={validateNameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setNameError("");
            }}
            value={nameInput}
            className={cx("form_input")}
            type="text"
            placeholder="Họ và tên của bạn"
          />
          <p className={cx("error-message")}>{nameError}</p>

          {/* Email Input */}
          <input
            onBlur={validateEmailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailError("");
            }}
            value={emailInput}
            className={cx("form_input")}
            type="text"
            placeholder="Email của bạn"
          />
          <p className={cx("error-message")}>{emailError}</p>

          {/* Password Input */}
          <input
            onBlur={validatePasswordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError("");
            }}
            value={passwordInput}
            className={cx("form_input")}
            type="password"
            name=""
            id=""
            placeholder="Mật khẩu"
          />
          <p className={cx("error-message")}>{passwordError}</p>
        </div>
      </div>

      {/* Terms */}
      <p className={cx("form_terms")}>
        Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với{" "}
        <span className={cx("text-highlight")}>Điều khoản sử dụng</span> của
        chúng tôi.
      </p>

      {/* Controls */}
      <div className={cx("form_controls")}>
        <button
          onClick={handleSubmit}
          className={cx("form_controls-btn", " btn", "primary ")}
        >
          Đăng ký
        </button>
        <button
          onClick={() => {
            navigate("/login");
          }}
          className={cx("form_controls-btn", " btn", "border")}
        >
          Đăng nhập
        </button>
      </div>
    </Form>
  );
}

export default SignUp;
