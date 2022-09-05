import classNames from "classnames/bind";
import styles from "./ChatRoom.module.scss";

import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";

import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

const cx = classNames.bind(styles);

function ChatRoom() {
  const { isMobile } = useContext(AppContext);

  return (
    <div className={cx("app")}>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}

export default ChatRoom;
