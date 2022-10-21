import classNames from "classnames/bind";
import styles from "./ChatRoom.module.scss";

import { Helmet } from "react-helmet-async";

import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";

import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

const cx = classNames.bind(styles);

function ChatRoom() {
  const { isMobile, theme } = useContext(AppContext);

  return (
    <>
      <Helmet>
        <title>Satellite - Ứng dụng nhắn tin</title>
        <meta
          name="description"
          content="Ứng dụng nhắn tin với giao diện được thiết kế theo phong cách tối giản"
        />
        <link rel="canonical" href="/login" />
      </Helmet>
      <div className={cx("app")} data-theme={theme}>
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </div>
    </>
  );
}

export default ChatRoom;
