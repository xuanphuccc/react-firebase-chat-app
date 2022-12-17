import classNames from "classnames/bind";
import styles from "./SignUp.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-regular-svg-icons";

import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../../../firebase/config";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { addDocument } from "../../../firebase/service";
import { serverTimestamp } from "firebase/firestore";

import { Helmet } from "react-helmet-async";

import Form from "../Form";
import Validator from "../../../validateForm/Validator";
import { AppContext } from "../../../Context/AppProvider";

const cx = classNames.bind(styles);

function SignUp() {
  const { joinGlobalChat } = useContext(AppContext);

  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const passwordRef = useRef();
  const defaultPhotoURL =
    "https://firebasestorage.googleapis.com/v0/b/chataap-34af1.appspot.com/o/user.png?alt=media&token=84085bd3-d19e-427a-84ed-c5d1d68a01a8";

  // Validate name
  const validateNameInput = () => {
    const isValid = Validator({
      setErrorMessage: setNameError,
      rules: [Validator.isRequired(nameInput, "Vui lòng nhập tên của bạn")],
    });

    return isValid;
  };

  // Validate email
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

  // Validate password
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
      createUserWithEmailAndPassword(auth, emailInput, passwordInput)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;

          sendEmailVerification(auth.currentUser).then(() => {
            // Email verification sent!
            console.log("Email verification sent!");
          });

          // Update profile autithencation
          updateProfile(auth.currentUser, {
            displayName: nameInput,
            photoURL: defaultPhotoURL,
          }).catch((error) => {
            console.error(error);
          });

          // Create user firestore
          addDocument("users", {
            displayName: nameInput,
            email: emailInput,
            photoURL: defaultPhotoURL,
            fullPath: "",
            uid: user.uid,
            providerId: user.providerId,
            stickers: [],
            active: serverTimestamp(),
          });

          // join Global chat
          joinGlobalChat(user);

          // Clear input
          setNameInput("");
          setEmailInput("");
          setPasswordInput("");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          console.error({ errorCode, errorMessage });

          if (errorCode.includes("auth/email-already-in-use")) {
            setPasswordError(
              "Email đã được sử dụng vui lòng Đăng nhập hoặc sử dụng email khác"
            );
          }

          // signOut when error
          signOut(auth)
            .then(() => {
              console.log("Sign out successful");
            })
            .catch((error) => {
              console.error(error);
            });
        });
    }
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
        <title>Đăng ký Satellite - Ứng dụng nhắn tin</title>
        <meta
          name="description"
          content="Ứng dụng nhắn tin với giao diện được thiết kế theo phong cách tối giản"
        />
        <link rel="canonical" href="/login" />
      </Helmet>

      <Form title="Đăng ký tài khoản Satellite">
        {/* Sign Up with password */}
        <div className={cx("form_with-password")}>
          <p className={cx("form_description")}>
            Hoặc đăng ký với email và mật khẩu của bạn:
          </p>
          <div className={cx("form_input-wrapper")}>
            {/* Name Input */}
            <input
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
            <div className={cx("form_password-input-wrap")}>
              <input
                ref={passwordRef}
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

              <span
                onClick={handleToggleShowPassword}
                className={cx("show-password-btn")}
              >
                <FontAwesomeIcon icon={faEye} />
              </span>
            </div>
            <p className={cx("error-message")}>{passwordError}</p>
          </div>
        </div>

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

export default SignUp;
