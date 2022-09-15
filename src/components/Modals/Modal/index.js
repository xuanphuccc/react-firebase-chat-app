import classNames from "classnames/bind";
import styles from "./Modal.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function Modal({
  title = "This is modal",
  visible = false,
  okButton = true,
  onOk,
  onCancel,
  children,
}) {
  return (
    <div
      className={cx("wrapper", {
        "modal--show": visible,
        "modal--hide": !visible,
      })}
    >
      <div onClick={onCancel} className={cx("overlay")}></div>
      <div className={cx("modal")}>
        <div className={cx("header")}>
          <h4 className={cx("title")}>{title}</h4>
        </div>
        <div className={cx("children")}>{children}</div>
        <div className={cx("controls")}>
          {okButton && (
            <button
              onClick={onOk}
              className={cx("ok-btn", "btn primary", "max")}
            >
              OK
            </button>
          )}
          <i onClick={onCancel} className={cx("cancel-btn")}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </i>
        </div>
      </div>
    </div>
  );
}

export default Modal;
