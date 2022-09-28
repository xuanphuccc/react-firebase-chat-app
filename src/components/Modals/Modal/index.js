import classNames from "classnames/bind";
import styles from "./Modal.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

const cx = classNames.bind(styles);

function Modal({
  title = "This is modal",
  visible = false,
  okButton = true,
  isHeader = true,
  onOk,
  OkTitle = "OK",
  onCancel,
  children,
}) {
  const { isMobile } = useContext(AppContext);

  return (
    <div
      className={cx("wrapper", {
        "modal--show": visible,
        "modal--hide": !visible,
      })}
    >
      <div onClick={onCancel} className={cx("overlay")}></div>
      <div className={cx("modal", { isMobile: isMobile })}>
        {isHeader && (
          <div className={cx("header")}>
            <h4 className={cx("title")}>{title}</h4>
          </div>
        )}
        <div className={cx("children")}>{children}</div>
        <div className={cx("controls")}>
          {okButton && (
            <div className={cx("ok-btn-wrap")}>
              <button
                onClick={onOk}
                className={cx("ok-btn", "btn primary", "max")}
              >
                {OkTitle}
              </button>
            </div>
          )}
          <i onClick={onCancel} className={cx("cancel-btn")}>
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
      </div>
    </div>
  );
}

export default Modal;
