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
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isRoomListLoading, setIsRoomListLoading] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
  const [isOpenCustomNickname, setIsOpenCustomNickname] = useState(false);
  const [isOpenChangeRoomName, setIsOpenChangeRoomName] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState("");

  // Current room messages
  const [selectedRoomMessages, setSelectedRoomMessages] = useState(null);

  // User Active Status
  const [usersActiveStatus, setUsersActiveStatus] = useState([]);

  // Dark Mode / Light Mode
  const appConfig = JSON.parse(
    localStorage.getItem("xuanphuc_space_config")
  ) ?? { appTheme: "dark" };

  const setAppConfig = (key, value) => {
    appConfig[key] = value;
    localStorage.setItem("xuanphuc_space_config", JSON.stringify(appConfig));
  };

  const [theme, setTheme] = useState(appConfig.appTheme);

  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);

  const handleRoomMenuVisible = () => {
    setIsRoomMenuVisible(!isRoomMenuVisible);
  };

  // Get current user UID
  const { uid } = useContext(AuthContext);

  // Lấy danh sách các phòng có user hiện tại
  /**room:
   * {
   *    name: 'room name',
   *    description: 'mo ta',
   *    members: [uid1, uid2,...]
   * }
   */

  const roomsCondition = useMemo(() => {
    // Tìm tất cả rooms có trường members chứa uid
    return {
      fielName: "members",
      operator: "array-contains",
      compareValue: uid,
    };
  }, [uid]);

  const roomsCallback = useMemo(() => {
    return () => {
      setIsRoomListLoading(false);
    };
  }, []);

  const rooms = useFirestore("rooms", roomsCondition, roomsCallback);

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

  const usersCallback = useMemo(() => {
    return () => {
      setIsUsersLoading(false);
    };
  }, []);

  // Get All user
  const users = useGetAllFirestore("users", usersCallback);

  useEffect(() => {
    const updateUserActive = () => {
      let count = true;

      const usersActiveTime = users.map((user) => {
        if (user.active === null) {
          count = false;
          return null;
        }

        const currentTime = Date.parse(new Date()) / 1000;
        const activeTime = user.active.seconds;
        const preMinutesActive = Math.floor((currentTime - activeTime) / 60);
        const isActive = Math.floor((currentTime - activeTime) / 60) <= 1;

        return {
          uid: user.uid,
          preMinutesActive,
          isActive,
        };
      });

      if (count) {
        setUsersActiveStatus(usersActiveTime);
      }
    };

    if (users) {
      updateUserActive();
    }

    const timeId = setInterval(() => {
      if (users) {
        updateUserActive();
      }
    }, 30 * 1000);

    return () => {
      console.log("clear time id!");
      clearInterval(timeId);
    };
  }, [users]);
  // console.log(usersActiveStatus);

  // Get members by selected room
  const members = useMemo(() => {
    if (users.length >= 1 && selectedRoomMembers) {
      return users.filter((user) => {
        return selectedRoomMembers.members.includes(user.uid);
      });
    }
  }, [users, selectedRoomMembers]);

  // Get current user
  const currentUser = useMemo(() => {
    if (users.length >= 1) {
      return users.find((user) => user.uid === uid);
    }
  }, [users, uid]);

  // Date time format
  const formatDate = (createAt) => {
    const time = {
      year: 0,
      month: 0,
      date: 0,
      hours: 0,
      minutes: 0,
      day: 0,
    };
    if (createAt) {
      const messageTime = createAt.toDate();
      time.year = messageTime.getFullYear();
      time.month = messageTime.getMonth() + 1;
      time.date = messageTime.getDate();
      time.hours = messageTime.getHours();
      time.minutes = messageTime.getMinutes();
      time.day = messageTime.getDay();
    }

    // let yearMonthDate = `${time.date} Tháng ${time.month}, ${time.year}`;
    let yearMonthDate = {
      date: "" + time.date,
      month: "" + time.month,
      year: "" + time.year,
    };
    const currentTime = new Date();
    if (
      time.year === currentTime.getFullYear() &&
      time.month === currentTime.getMonth() + 1 &&
      time.date === currentTime.getDate()
    ) {
      yearMonthDate = { date: "", month: "", year: "" };
    }

    const hoursMinutes = `${time.hours < 10 ? `0${time.hours}` : time.hours}:${
      time.minutes < 10 ? `0${time.minutes}` : time.minutes
    }`;
    // return `${hoursMinutes} ${yearMonthDate}`;
    return { hoursMinutes, ...yearMonthDate };
  };

  // Handle reponsive
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
        setAppConfig,
        theme,
        setTheme,
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
        isRoomListLoading,
        isUsersLoading,
        formatDate,
        usersActiveStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };
export default AppProvider;
