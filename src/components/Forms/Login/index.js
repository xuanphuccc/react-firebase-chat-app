import classNames from "classnames/bind";
import styles from "./Login.module.scss";

import { useNavigate } from "react-router-dom";

import Form from "../Form";

const cx = classNames.bind(styles);

function Login() {
  const navigate = useNavigate();

  return (
    <Form>
      {/* Login with password */}
      <div className={cx("form_with-password")}>
        <p className={cx("form_description")}>
          Hoặc đăng nhập với email và mật khẩu của bạn:
        </p>
        <div className={cx("form_input-wrapper")}>
          <input
            className={cx("form_input")}
            type="text"
            placeholder="Email của bạn"
          />
          <input
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
        <button className={cx("form_controls-btn", " btn", "primary")}>
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
