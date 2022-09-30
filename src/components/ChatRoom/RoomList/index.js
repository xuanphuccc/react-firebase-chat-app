import userPlacehoderImg from "../../../assets/images/user.png";
import classNames from "classnames/bind";
import styles from "./RoomList.module.scss";

import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";
import Skeleton from "../../Skeleton";

const cx = classNames.bind(styles);

function RoomList() {
  const { rooms, setSelectedRoomId, selectedRoomId, isMobile } =
    useContext(AppContext);

  return (
    <div className={cx("wrapper", { isMobile })}>
      <ul className={cx("room-list")}>
        {rooms.map((room) => (
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
              <img
                className={cx("room_img")}
                src={room.photoURL || userPlacehoderImg}
                alt=""
              />
              <div className={cx("room-info")}>
                <h4 className={cx("room_name")}>{room.name}</h4>
                <p className={cx("room-desc")}>Bạn: Hello .20 phút</p>
              </div>
              <span className={cx("new-message-dot")}></span>
            </li>
          </Link>
        ))}

        <Skeleton />
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
