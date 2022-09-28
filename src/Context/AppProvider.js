import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthProvider";
import useFirestore from "../hooks/useFirestore";

import useViewport from "../hooks/useViewport";
import useGetAllFirestore from "../hooks/useGetAllFirestore";

const AppContext = createContext();

// LƯU TRỮ CHUNG DỮ LIỆU CHO TOÀN BỘ APP

// Có nhiệm vụ truyền context khi lấy được data
// từ câu truy vấn đến realtime database
function AppProvider({ children }) {
  // Set trạng thái hiển thị cho modal Add Room
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);

  // Set trạng thái hiển thị cho modal Invite Members
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);

  // Set trạng thái hiển thị cho modal Custom Nickname
  const [isOpenCustomNickname, setIsOpenCustomNickname] = useState(false);

  // Set trạng thái hiển thị cho modal Custom Nickname
  const [isOpenChangeRoomName, setIsOpenChangeRoomName] = useState(false);

  // Phòng đang được chọn để hiển thị chat
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Ảnh tin nhắn đang được chọn
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Set trạng thái hiển thị của Room Menu
  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);
  // Hàm xử lý mở modal Room Menu
  const handleRoomMenuVisible = () => {
    setIsRoomMenuVisible(!isRoomMenuVisible);
  };

  // Lấy ra uid của user hiện tại khi đăng nhập
  const { uid } = useContext(AuthContext);

  // Lấy messages từ selected room
  const [selectedRoomMessages, setSelectedRoomMessages] = useState(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState("");

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
    // Tìm tất cả rooms có trường members chứa uid không
    return {
      fielName: "members",
      operator: "array-contains",
      compareValue: uid,
    };
  }, [uid]);

  const rooms = useFirestore("rooms", roomsCondition);

  // Lấy ra phòng được selected
  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  // Kiểm tra xem đã được chọn phòng chưa
  // nếu chưa phải gán cho 1 object chứa members rỗng
  // nếu không sẽ bị lỗi undefined.members
  const selectedRoomMembers = useMemo(() => {
    let roomMembers = selectedRoom;
    if (!roomMembers) {
      roomMembers = {
        members: "",
      };
    }
    return roomMembers;
  }, [selectedRoom]);

  // Lấy TẤT CẢ user
  const users = useGetAllFirestore("users");

  const members = useMemo(() => {
    if (users.length >= 1 && selectedRoomMembers) {
      return users.filter((user) => {
        return selectedRoomMembers.members.includes(user.uid);
      });
    }
  }, [users, selectedRoomMembers]);

  // Lấy người dùng hiện tại từ users
  const currentUser = useMemo(() => {
    if (users.length >= 1) {
      return users.find((user) => user.uid === uid);
    }
  }, [users, uid]);

  // Xử lý responsive
  const viewport = useViewport();
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (viewport.width < 768) {
      setIsMobile(true);
      setIsDesktop(false);
    } else {
      setIsMobile(false);
      setIsDesktop(true);
    }
  }, [viewport.width]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        rooms,
        members,
        users,
        isAddRoomVisible,
        setIsAddRoomVisible,
        selectedRoomId,
        setSelectedRoomId,
        selectedRoom,
        isInviteMemberVisible,
        setIsInviteMemberVisible,
        isMobile,
        isDesktop,
        isRoomMenuVisible,
        setIsRoomMenuVisible,
        handleRoomMenuVisible,
        isOpenCustomNickname,
        setIsOpenCustomNickname,
        selectedPhoto,
        setSelectedPhoto,
        selectedRoomMessages,
        setSelectedRoomMessages,
        isOpenChangeRoomName,
        setIsOpenChangeRoomName,
        alertContent,
        setAlertContent,
        alertVisible,
        setAlertVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };
export default AppProvider;
