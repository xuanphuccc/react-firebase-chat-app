import classNames from "classnames/bind";
import styles from "./Login.module.scss";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";

import Form from "../Form";

const cx = classNames.bind(styles);

function Login() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const navigate = useNavigate();

  const handleLoginWithEmailAndPassword = () => {
    signInWithEmailAndPassword(auth, emailInput, passwordInput)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;

        console.log("Log In: ", userCredential);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.error({ errorCode, errorMessage });
      });
  };

  return (
    <Form>
      {/* Login with password */}
      <div className={cx("form_with-password")}>
        <p className={cx("form_description")}>
          Hoặc đăng nhập với email và mật khẩu của bạn:
        </p>
        <div className={cx("form_input-wrapper")}>
          {/* Email */}
          <input
            onChange={(e) => {
              setEmailInput(e.target.value);
            }}
            value={emailInput}
            className={cx("form_input")}
            type="text"
            placeholder="Email của bạn"
          />

          {/* Password */}
          <input
            onChange={(e) => {
              setPasswordInput(e.target.value);
            }}
            value={passwordInput}
            className={cx("form_input")}
            type="password"
            name=""
            id=""
            placeholder="Mật khẩu"
          />
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
          onClick={handleLoginWithEmailAndPassword}
          className={cx("form_controls-btn", " btn", "primary")}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => {
            navigate("/signup");
          }}
          className={cx("form_controls-btn", " btn", "border")}
        >
          Đăng ký
        </button>
      </div>
    </Form>
  );
}

export default Login;
