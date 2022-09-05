import classNames from "classnames/bind";
import styles from "./MobileLayout.module.scss";
import { useContext } from "react";

import { AppContext } from "../../../Context/AppProvider";

import Sidebar from "../Sidebar";
import ChatWindow from "../ChatWindow";

const cx = classNames.bind(styles);

function DesktopLayout() {
  const { toggleComponent } = useContext(AppContext);

  return (
    <div className={cx("wrapper")}>
      {toggleComponent ? <Sidebar /> : <ChatWindow />}
    </div>
  );
}

export default DesktopLayout;
