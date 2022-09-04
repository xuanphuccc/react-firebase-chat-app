import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

import UserInfo from "../UserInfo";
import RoomList from "../RoomList";

const cx = classNames.bind(styles);

function Sidebar() {
  return (
    <div className={cx("side-bar")}>
      <UserInfo />
      <RoomList />
    </div>
  );
}

export default Sidebar;
