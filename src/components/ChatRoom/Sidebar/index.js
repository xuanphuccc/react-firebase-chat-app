import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

import UserInfo from "../UserInfo";
import RoomList from "../RoomList";

const cx = classNames.bind(styles);

function Sidebar() {
  const { theme } = useContext(AppContext);

  return (
    <div className={cx("side-bar")} data-theme={theme}>
      <UserInfo />
      <RoomList />
    </div>
  );
}

export default Sidebar;
