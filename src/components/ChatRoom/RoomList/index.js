import userPlacehoderImg from "../../../assets/images/user.png";
import classNames from "classnames/bind";
import styles from "./RoomList.module.scss";

import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";
import Skeleton from "../../Skeleton";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function RoomList() {
  const { uid } = useContext(AuthContext);
  const {
    users,
    rooms,
    roomsActiveStatus,
    setSelectedRoomId,
    selectedRoomId,
    formatDate,
    isMobile,
    handleGenerateRoomName,
  } = useContext(AppContext);

  const descriptionText = (room) => {
    const lastMessage = room.lastMessage;
    // console.log("createAt: ", room.lastMessage);
    let userName;
    let message;

    // Get Name
    if (lastMessage.uid === uid) {
      userName = "Bạn";
    } else {
      const memberNickname = room.roomNicknames.find(
        (memberNickname) => memberNickname.uid === lastMessage.uid
      );

      const userCurrentName = users.find(
        (user) => user.uid === lastMessage.uid
      );

      if (memberNickname && userCurrentName) {
        userName = memberNickname.nickname || userCurrentName.displayName;
      } else if (userCurrentName) {
        userName = userCurrentName.displayName;
      } else {
        userName = lastMessage.displayName;
      }
    }

    // Get Message text
    switch (lastMessage.type) {
      case "@unsentmsg":
        message = "Đã thu hồi tin nhắn";
        break;
      case "@roomnotify":
        message = lastMessage.text;
        break;

      case "@icon":
      case "@text":
        message = lastMessage.text;
        break;

      case "@sticker":
        message = "đã gửi một nhãn dán";
        break;

      case "@image":
        message = "đã gửi một ảnh";
        break;
      case "@video":
        message = "đã gửi một video";
        break;
      default:
    }

    if (!userName || !message) {
      return "Bắt đầu đoạn chat";
    }

    return `${userName}: ${message}`;
  };

  const descriptionTimeFormat = (createAt) => {
    const descTime = formatDate(createAt);
    let dateTimeString = "";
    if (descTime.date && descTime.month && descTime.year) {
      dateTimeString = `${descTime.date}Th${descTime.month}`;
    } else {
      dateTimeString = descTime.hoursMinutes;
    }

    return dateTimeString;
  };

  const roomSortByLastMessage = useMemo(() => {
    const newRoomsArr = [...rooms];

    for (let i = 0; i < newRoomsArr.length - 1; i++) {
      for (let j = i + 1; j < newRoomsArr.length; j++) {
        if (
          newRoomsArr[i].lastMessage.createAt >
          newRoomsArr[j].lastMessage.createAt
        ) {
          let tmp = newRoomsArr[i];
          newRoomsArr[i] = newRoomsArr[j];
          newRoomsArr[j] = tmp;
        }
      }
    }

    return newRoomsArr;
  }, [rooms]);

  const findRoomActive = (roomId) => {
    return roomsActiveStatus.find((roomActive) => roomActive.roomId === roomId);
  };

  return (
    <div className={cx("wrapper", { isMobile })}>
      <ul className={cx("room-list")}>
        {roomSortByLastMessage.map((room) => (
          <Link
            key={room.id}
            to={`/room/${room.id}`}
            className={cx("text-decor-none")}
          >
            <li
              className={cx("room", { active: room.id === selectedRoomId })}
              onClick={() => {
                setSelectedRoomId(room.id);
              }}
            >
              <div className={cx("room_img-wrapper")}>
                <img
                  className={cx("room_img")}
                  src={
                    handleGenerateRoomName(room).photoURL || userPlacehoderImg
                  }
                  alt=""
                />
                {findRoomActive(room.id) && (
                  <>
                    {findRoomActive(room.id).isActive ? (
                      <span className={cx("room_active")}></span>
                    ) : (
                      <>
                        {findRoomActive(room.id).timeCount && (
                          <div className={cx("room_not-active")}>
                            <span className={cx("room_not-active-overlay")}>
                              {findRoomActive(room.id).timeCount}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              <div className={cx("room-info")}>
                <h4 className={cx("room_name")}>
                  {handleGenerateRoomName(room).name}
                </h4>
                <div className={cx("room-desc-wrap")}>
                  <p className={cx("room-desc")}>{descriptionText(room)}</p>
                  <span className={cx("room-desc-time")}>
                    {" · " + descriptionTimeFormat(room.lastMessage.createAt)}
                  </span>
                </div>
              </div>
              <span className={cx("new-message-dot")}></span>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

const Loading = () => {
  const { isMobile } = useContext(AppContext);
  return (
    <div className={cx("wrapper", { isMobile })}>
      <ul className={cx("room-list")}>
        {[1, 2, 3, 4, 5, 6].map((item, index) => (
          <li key={index} className={cx("room")}>
            <Skeleton className={cx("room_img")} />
            <div className={cx("room-info")}>
              <Skeleton
                style={{ height: 18, width: 140 }}
                className={cx("room_name")}
              />
              <div className={cx("room-desc-wrap")}>
                <Skeleton
                  style={{ height: 14, width: "100%" }}
                  className={cx("room-desc")}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

RoomList.Loading = Loading;

export default RoomList;
