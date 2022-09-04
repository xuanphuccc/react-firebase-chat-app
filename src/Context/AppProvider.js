import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthProvider";
import useFirestore from "../hooks/useFirestore";

const AppContext = createContext();

// LƯU TRỮ CHUNG DỮ LIỆU CHO TOÀN BỘ APP

// Có nhiệm vụ truyền context khi lấy được data
// từ câu truy vấn đến realtime database
function AppProvider({ children }) {
  // Set trạng thái hiển thị cho modal Add Room
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);

  // Set trạng thái hiển thị cho modal Join Room
  const [isJoinRoomVisible, setIsJoinRoomVisible] = useState(false);

  // Set trạng thái hiển thị cho modal Invite Members
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);

  // Phòng đang được chọn để hiển thị chat
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Lấy ra uid của user hiện tại
  const { uid } = useContext(AuthContext);

  // Lấy danh sách các phòng có user hiện tại
  /**room:
   * {
   *    name: 'room name',
   *    description: 'mo ta',
   *    members: [uid1, uid2,...]
   * }
   */

  // LƯU Ý: Vì object là kiểu tham chiếu
  // Nên mỗi lần được gọi useFirestore hiểu là
  // 1 dữ liệu mới nên sẽ tạo nên vòng lặp vô hạn
  // nên cần phải cho vào useMemo
  const roomsCondition = useMemo(() => {
    // Tìm trong trường members có chứa uid không
    return {
      fielName: "members",
      operator: "array-contains",
      compareValue: uid,
    };
  }, [uid]);

  const rooms = useFirestore("rooms", roomsCondition);

  // Lấy ra phòng được selected
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  // Kiểm tra xem đã được chọn phòng chưa
  // nếu chưa phải gán cho 1 object chứa members rỗng
  // nếu không sẽ bị lỗi undefined.members
  let roomMembers = selectedRoom;
  if (!roomMembers) {
    roomMembers = {
      members: "",
    };
  }

  // Lấy danh sách users trong phòng chat
  const usersCondition = useMemo(() => {
    // uid có nằm trong mảng members của selectedRoom không
    return {
      fielName: "uid",
      operator: "in",
      compareValue: roomMembers.members,
      // Trường hợp selectedRoom chưa có thì lỗi
    };
  }, [roomMembers.members]);

  const members = useFirestore("users", usersCondition);

  // Lấy message của phòng được selected
  const messagesCondition = useMemo(() => {
    // Kiểm tra xem tin nhắn có roomId
    // trùng với selectedRoomId không
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: selectedRoomId,
    };
  }, [selectedRoomId]);

  const messages = useFirestore("messages", messagesCondition);

  return (
    <AppContext.Provider
      value={{
        rooms,
        members,
        messages,
        isAddRoomVisible,
        setIsAddRoomVisible,
        isJoinRoomVisible,
        setIsJoinRoomVisible,
        selectedRoomId,
        setSelectedRoomId,
        selectedRoom,
        isInviteMemberVisible,
        setIsInviteMemberVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };
export default AppProvider;
