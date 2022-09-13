import classNames from "classnames/bind";
import styles from "./DesktopLayout.module.scss";

import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar";

const cx = classNames.bind(styles);

function DesktopLayout() {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("side-bar")}>
        <Sidebar />
      </div>
      <div className={cx("chat-window")}>
        <Outlet />
      </div>
    </div>
  );
}

export default DesktopLayout;
