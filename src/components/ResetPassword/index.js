import classNames from "classnames/bind";
import styles from "./ResetPassword.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faKey } from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import { useContext, useState } from "react";
import { AppContext } from "../../Context/AppProvider";

import Validator from "../../validateForm/Validator";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

const cx = classNames.bind(styles);

function ResetPassword() {
  const { isMobile } = useContext(AppContext);
  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMsgStyles, setErrorMsgStyles] = useState({ color: "red" });
  const navigate = useNavigate();

  const handleValidateEmail = () => {
    const isValid = Validator({
      setErrorMessage: setErrorMessage,
      rules: [
        Validator.isRequired(emailInput, "Vui lòng nhập email của bạn"),
        Validator.isEmail(emailInput, "Vui lòng nhập đúng định dạng"),
      ],
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (handleValidateEmail()) {
      sendPasswordResetEmail(auth, emailInput)
        .then(() => {
          // Password reset email sent!
          setErrorMessage(
            '🚀 Email được gửi thành công! Vui lòng kiểm tra trong hộp thư "hoặc hộp thư rác" để đặt lại mật khẩu.'
          );
          setErrorMsgStyles({ color: "#333" });
          setEmailInput("");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error({ errorCode, errorMessage });

          setErrorMessage("Không tồn tại tài khoản này.");
          setErrorMsgStyles({ color: "red" });
        });
    } else {
      setErrorMsgStyles({ color: "red" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Satellite - Ứng dụng nhắn tin</title>
        <meta
          name="description"
          content="Ứng dụng nhắn tin với giao diện được thiết kế theo phong cách tối giản"
        />
        <link rel="canonical" href="/login" />
      </Helmet>
      <div className={cx("wrapper")}>
        <div className={cx("reset-password", { isMobile: isMobile })}>
          {/* Header */}
          <div className={cx("reset-password_header")}>
            <div className={cx("reset-password_icon-wrap")}>
              <span className={cx("reset-password_icon")}>
                <FontAwesomeIcon icon={faKey} />
              </span>
            </div>
            <h2 className={cx("reset-password_title")}>Bạn quên mật khẩu?</h2>
            <div className={cx("reset-password_description")}>
              Đừng lo lắng, chúng tôi sẽ gửi cho bạn email hướng dẫn đặt lại mật
              khẩu ngay bây giờ.
            </div>
          </div>

          {/* Input */}
          <div className={cx("reset-password_input-wrap")}>
            <label className={cx("reset-password_input-label")} htmlFor="">
              Email
            </label>
            <input
              onChange={(e) => {
                setEmailInput(e.target.value);
              }}
              value={emailInput}
              className={cx("reset-password_input")}
              type="text"
              placeholder="Nhập email của bạn"
            />
          </div>

          <p style={errorMsgStyles} className={cx("reset-password_message")}>
            {errorMessage}
          </p>

          {/* Controls */}
          <div className={cx("reset-password_controls")}>
            <button
              onClick={handleSubmit}
              className={cx("reset-password_send-email", "btn", "primary")}
            >
              Gửi email cho tôi
            </button>

            <button
              onClick={() => {
                navigate("/login");
              }}
              className={cx("reset-password_back")}
            >
              <span className={cx("reset-password_back-icon")}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </span>
              Quay trở lại trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
