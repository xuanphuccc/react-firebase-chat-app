import userPlacehoderImg from "../../../assets/images/user.png";
import classNames from "classnames/bind";
import styles from "./RoomList.module.scss";

import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";

const cx = classNames.bind(styles);

function RoomList() {
  // Không nên gọi trực tiếp truy vấn trong đây
  // vì mỗi lần render lại thực hiện truy vấn
  // gây lãng phí số lần query đến database
  // -> Cách khắc phục: dùng useContext
  // const rooms = useFirestore("rooms", roomsCondition);
  const { rooms, setSelectedRoomId, selectedRoomId, isMobile } =
    useContext(AppContext);

  // const navigate = useNavigate();

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
                // navigate("/chat-window");
              }}
            >
              <img
                className={cx("room_img")}
                src={room.photoURL || userPlacehoderImg}
                alt=""
              />
              <div className={cx("room-info")}>
                <h4 className={cx("room_name")}>{room.name}</h4>
                <p className={cx("room-desc")}>Bạn: Hello</p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;
