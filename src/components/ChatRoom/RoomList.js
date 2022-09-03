import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";
import userPlacehoderImg from "../../assets/images/user.png";
import AddRoomModal from "../Modals/AddRoomModal";

function RoomList() {
  // Không nên gọi trực tiếp truy vấn trong đây
  // vì mỗi lần render lại thực hiện truy vấn
  // gây lãng phí số lần query đến database
  // -> Cách khắc phục: dùng useContext
  // const rooms = useFirestore("rooms", roomsCondition);
  const { rooms, setIsAddRoomVisible, setSelectedRoomId } =
    useContext(AppContext);

  // Mở modal khi click vào thêm phòng
  const handleAddRoom = () => {
    setIsAddRoomVisible(true);
  };

  return (
    <div className="room-list-wrap">
      <ul className="room-list">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="room"
            onClick={() => {
              setSelectedRoomId(room.id);
            }}
          >
            <img
              className="room_img"
              src={room.photoURL || userPlacehoderImg}
              alt=""
            />
            <h4 className="room_name">{room.name}</h4>
          </li>
        ))}
      </ul>
      <div className="add-room">
        <button onClick={handleAddRoom} className="add-room-btn btn border">
          + Thêm phòng
        </button>
      </div>

      <AddRoomModal />
    </div>
  );
}

export default RoomList;
