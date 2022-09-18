import classNames from "classnames/bind";
import styles from "./UserInfo.module.scss";

import { useContext, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";
import userPlacehoderImg from "../../../assets/images/user.png";
import BasicModal from "../../Modals/BasicModal";
import CreateRoomModal from "../../Modals/CreateRoomModal";

const cx = classNames.bind(styles);

function UserInfo() {
  // Lấy dữ liệu từ context
  const user = useContext(AuthContext);
  const { displayName, photoURL, uid } = user;

  // Set trạng thái của Modal Add Room và Join Room
  const { setIsAddRoomVisible, isMobile } = useContext(AppContext);

  // Trạng thái hiển thị của menu user
  const [isVisible, setIsVisible] = useState(false);

  // Đóng mở menu User
  const handleMenuVisible = () => {
    setIsVisible(!isVisible);
  };

  // Mở modal khi click vào tạo phòng
  const handleAddRoom = () => {
    setIsAddRoomVisible(true);
  };

  // Xử lý Sign Out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className={cx("user-info", { fixed: isMobile })}>
      <BasicModal
        isVisible={isVisible}
        handleVisible={handleMenuVisible}
        title="Thông tin của bạn"
        modal={
          <div className={cx("user-controls")}>
            <div className={cx("invite-wrap")}>
              <h4 className={cx("invite-title")}>Id của bạn</h4>
              <p className={cx("invite-code")}>{uid}</p>
            </div>
            <div className={cx("btn-wrap")}>
              <button className={cx("signout-btn")} onClick={handleSignOut}>
                <span className={cx("signout-btn-content")}>Đăng xuất</span>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </button>
            </div>
          </div>
        }
      >
        <div onClick={handleMenuVisible} className={cx("container")}>
          <img
            className={cx("user-img")}
            src={photoURL || userPlacehoderImg}
            alt=""
          />
          <div className={cx("name-wrap")}>
            <h4 className={cx("user-name")}>{displayName}</h4>
          </div>
        </div>
      </BasicModal>

      <div className={cx("new-room-wrap")}>
        <i onClick={handleAddRoom} className={cx("new-room-icon")}>
          <FontAwesomeIcon icon={faPenToSquare} />
        </i>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal />
    </div>
  );
}

export default UserInfo;
