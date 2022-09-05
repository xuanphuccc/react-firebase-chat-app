import classNames from "classnames/bind";
import styles from "./DesktopLayout.module.scss";

import Sidebar from "../Sidebar";
import ChatWindow from "../ChatWindow";

const cx = classNames.bind(styles);

function DesktopLayout() {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("side-bar")}>
        <Sidebar />
      </div>
      <div className={cx("chat-window")}>
        <ChatWindow />
      </div>
    </div>
  );
}

export default DesktopLayout;
