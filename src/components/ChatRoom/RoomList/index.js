import userPlacehoderImg from "../../../assets/images/user.png";
import classNames from "classnames/bind";
import styles from "./RoomList.module.scss";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

const cx = classNames.bind(styles);

function RoomList() {
  // Không nên gọi trực tiếp truy vấn trong đây
  // vì mỗi lần render lại thực hiện truy vấn
  // gây lãng phí số lần query đến database
  // -> Cách khắc phục: dùng useContext
  // const rooms = useFirestore("rooms", roomsCondition);
  const { rooms, setSelectedRoomId } = useContext(AppContext);

  return (
    <div className={cx("wrapper")}>
      <ul className={cx("room-list")}>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={cx("room")}
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;