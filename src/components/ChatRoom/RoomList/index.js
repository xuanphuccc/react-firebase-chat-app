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
    setSelectedRoomId,
    selectedRoomId,
    formatDate,
    isMobile,
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

      if (memberNickname) {
        userName = memberNickname.nickname;
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

      case "@icon":
      case "@text":
        message = lastMessage.text;
        break;

      case "@sticker":
        message = "Gửi sticker";
        break;

      case "@image":
        message = "Gửi hình ảnh";
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
          newRoomsArr[i].lastMessage.createAt <
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
                  src={room.photoURL || userPlacehoderImg}
                  alt=""
                />
                <span className={cx("room_active")}></span>
              </div>
              <div className={cx("room-info")}>
                <h4 className={cx("room_name")}>{room.name}</h4>
                <p className={cx("room-desc")}>
                  {descriptionText(room)}
                  {" · "}
                  {descriptionTimeFormat(room.lastMessage.createAt)}
                </p>
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
        <li className={cx("room")}>
          <Skeleton className={cx("room_img", "xuanphuc")} />
          <div className={cx("room-info")}>
            <Skeleton style={{ height: 14 }} className={cx("room_name")} />
            <Skeleton style={{ height: 14 }} className={cx("room-desc")} />
          </div>
        </li>

        <li className={cx("room")}>
          <Skeleton className={cx("room_img", "xuanphuc")} />
          <div className={cx("room-info")}>
            <Skeleton style={{ height: 14 }} className={cx("room_name")} />
            <Skeleton style={{ height: 14 }} className={cx("room-desc")} />
          </div>
        </li>

        <li className={cx("room")}>
          <Skeleton className={cx("room_img", "xuanphuc")} />
          <div className={cx("room-info")}>
            <Skeleton style={{ height: 14 }} className={cx("room_name")} />
            <Skeleton style={{ height: 14 }} className={cx("room-desc")} />
          </div>
        </li>
      </ul>
    </div>
  );
};

RoomList.Loading = Loading;

export default RoomList;
