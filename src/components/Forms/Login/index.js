import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-regular-svg-icons";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";

import { Helmet } from "react-helmet-async";

import Form from "../Form";

const cx = classNames.bind(styles);

function Login() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const passwordRef = useRef();

  const handleLoginWithEmailAndPassword = () => {
    signInWithEmailAndPassword(auth, emailInput, passwordInput)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.error({ errorCode, errorMessage });

        setErrorMessage("Email hoặc mật khẩu không đúng");

        // sign out when login error
        signOut(auth)
          .then(() => {
            console.log("Sign out successful");
          })
          .catch((error) => {
            console.error(error);
          });
      });
  };

  // handle show/hide password
  const handleToggleShowPassword = () => {
    if (passwordRef.current) {
      passwordRef.current.type === "password"
        ? (passwordRef.current.type = "text")
        : (passwordRef.current.type = "password");
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập vào Satellite - Ứng dụng nhắn tin</title>
        <meta
          name="description"
          content="Ứng dụng nhắn tin với giao diện được thiết kế theo phong cách tối giản"
        />
        <link rel="canonical" href="/login" />
      </Helmet>
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
            <div className={cx("form_password-input-wrap")}>
              <input
                ref={passwordRef}
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

              <span
                onClick={handleToggleShowPassword}
                className={cx("show-password-btn")}
              >
                <FontAwesomeIcon icon={faEye} />
              </span>
            </div>

            <p className={cx("error-message")}>{errorMessage}</p>
          </div>
        </div>

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

        {/* Forgot password */}
        <div className={cx("forgot-password")}>
          <button
            onClick={() => {
              navigate("/forgot-password");
            }}
            className={cx("forgot-password-btn")}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Terms */}
        <p className={cx("form_terms")}>
          Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với{" "}
          <span className={cx("text-highlight")}>Điều khoản sử dụng</span> của
          chúng tôi.
        </p>
      </Form>
    </>
  );
}

export default Login;
