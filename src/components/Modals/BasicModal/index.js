import classNames from "classnames/bind";
import styles from "./BasicModal.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

const cx = classNames.bind(styles);

function BasicModal({
  isVisible,
  placement = "bottom",
  children,
  modal,
  handleVisible,
  title = "This is title",
}) {
  return (
    <Tippy
      visible={isVisible}
      interactive="true"
      placement={placement}
      content={
        <div className={cx("wrapper")}>
          <i onClick={handleVisible} className={cx("cancel-btn")}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </i>
          <h4 className={cx("title")}>{title}</h4>
          {modal}
        </div>
      }
    >
      <div>
        <div
          onClick={handleVisible}
          className={cx("overlay", { isVisible })}
        ></div>
        {children}
      </div>
    </Tippy>
  );
}

export default BasicModal;
