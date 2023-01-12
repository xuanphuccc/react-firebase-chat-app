import classNames from "classnames/bind";
import styles from "./UserInfo.module.scss";

import { useContext } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../Context/AppProvider";
import userPlacehoderImg from "../../../assets/images/user.png";
import Skeleton from "../../Skeleton";

const cx = classNames.bind(styles);

function UserInfo({ inputValue, setInputValue }) {
  const {
    setUserOptionsVisible,
    setIsAddRoomVisible,
    isOpenSearchUsers,
    setIsOpenSearchUsers,
    currentUser,
  } = useContext(AppContext);

  // Open modal when click reacte room button
  const handleAddRoom = () => {
    setIsAddRoomVisible(true);
  };

  // Handle input
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cx("user-info")}>
      <div
        onClick={() => {
          setIsOpenSearchUsers(false);
        }}
        className={cx("user-info-wrapper")}
      >
        <div
          onClick={() => {
            setUserOptionsVisible(true);
          }}
          className={cx("container")}
        >
          {currentUser && (
            <img
              className={cx("user-img")}
              src={currentUser.photoURL || userPlacehoderImg}
              alt=""
              title="Tùy chọn tài khoản"
            />
          )}
        </div>

        <h1 className={cx("title")}>Chat</h1>

        <div className={cx("new-room-wrap")} title="Tạo nhóm chat">
          <i onClick={handleAddRoom} className={cx("new-room-icon")}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </i>
        </div>
      </div>

      <div className={cx("users-search")}>
        {isOpenSearchUsers && (
          <span
            onClick={() => {
              setIsOpenSearchUsers(false);
            }}
            className={cx("users-search_back-btn")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
        )}
        <div className={cx("users-search_input-wrap")}>
          <span className={cx("users-search_icon")}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            onClick={() => {
              setIsOpenSearchUsers(true);
            }}
            onChange={handleInputChange}
            value={inputValue}
            className={cx("users-search_input")}
            type="text"
            placeholder="Nhắn tin riêng tư"
          />
        </div>
      </div>
    </div>
  );
}

const Loading = () => {
  const { isMobile } = useContext(AppContext);

  return (
    <div className={cx("user-info", { fixed: isMobile })}>
      <div className={cx("user-info-wrapper")}>
        <div className={cx("container")}>
          <Skeleton className={cx("user-img")} />
        </div>

        <Skeleton style={{ height: 18, width: 60 }} className={cx("title")} />

        <div className={cx("new-room-wrap")}>
          <Skeleton className={cx("new-room-icon")} />
        </div>
      </div>

      <div className={cx("users-search")}>
        <Skeleton
          style={{ height: 36 }}
          className={cx("users-search_input-wrap")}
        />
      </div>
    </div>
  );
};

UserInfo.Loading = Loading;

export default UserInfo;
