import classNames from "classnames/bind";
import styles from "./SignUp.module.scss";

import { useNavigate } from "react-router-dom";

import Form from "../Form";

const cx = classNames.bind(styles);

function SignUp() {
  const navigate = useNavigate();

  return (
    <Form title="Đăng ký tài khoản Satellite">
      {/* Sign Up with password */}
      <div className={cx("form_with-password")}>
        <p className={cx("form_description")}>
          Hoặc đăng ký với email và mật khẩu của bạn:
        </p>
        <div className={cx("form_input-wrapper")}>
          <input
            className={cx("form_input")}
            type="text"
            placeholder="Họ và tên của bạn"
          />
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
        <button className={cx("form_controls-btn", " btn", "primary ")}>
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
