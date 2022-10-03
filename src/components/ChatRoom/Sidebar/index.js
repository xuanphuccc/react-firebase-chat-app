import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

import UserInfo from "../UserInfo";
import RoomList from "../RoomList";
import AlertModal from "../../Modals/AlertModal";
import UserOptions from "../../Modals/UserOptions";
import CreateRoomModal from "../../Modals/CreateRoomModal";

const cx = classNames.bind(styles);

function Sidebar() {
  const { theme, isRoomListLoading, isUsersLoading, isMobile } =
    useContext(AppContext);

  return (
    <div className={cx("side-bar", { isMobile })} data-theme={theme}>
      {isUsersLoading ? <UserInfo.Loading /> : <UserInfo />}
      {isRoomListLoading ? <RoomList.Loading /> : <RoomList />}

      {/* Show all alert and notification */}
      <AlertModal />

      <UserOptions />
      {/* Create Room Modal */}
      <CreateRoomModal />
    </div>
  );
}

export default Sidebar;
