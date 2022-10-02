import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

import UserInfo from "../UserInfo";
import RoomList from "../RoomList";

const cx = classNames.bind(styles);

function Sidebar() {
  const { theme, isRoomListLoading, isUsersLoading, isMobile } =
    useContext(AppContext);

  return (
    <div className={cx("side-bar", { isMobile })} data-theme={theme}>
      {isUsersLoading ? <UserInfo.Loading /> : <UserInfo />}
      {isRoomListLoading ? <RoomList.Loading /> : <RoomList />}
    </div>
  );
}

export default Sidebar;
