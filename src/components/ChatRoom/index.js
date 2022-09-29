import classNames from "classnames/bind";
import styles from "./ChatRoom.module.scss";

import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";

import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import AlertModal from "../Modals/AlertModal";

const cx = classNames.bind(styles);

function ChatRoom() {
  const { isMobile } = useContext(AppContext);

  return (
    <div className={cx("app")}>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}

      {/* Show all alert and notification */}
      <AlertModal />
    </div>
  );
}

export default ChatRoom;
