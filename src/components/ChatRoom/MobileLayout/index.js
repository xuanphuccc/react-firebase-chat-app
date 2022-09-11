import classNames from "classnames/bind";
import styles from "./MobileLayout.module.scss";

import { Outlet } from "react-router-dom";

const cx = classNames.bind(styles);

function MobileLayout() {
  return (
    <div className={cx("wrapper")}>
      <Outlet />
    </div>
  );
}

export default MobileLayout;
