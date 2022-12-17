import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthProvider";
import useFirestore from "../hooks/useFirestore";

import useViewport from "../hooks/useViewport";
import useGetAllFirestore from "../hooks/useGetAllFirestore";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { addDocument } from "../firebase/service";

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
  const [userOptionsVisible, setUserOptionsVisible] = useState(false);
  const [isOpenSearchUsers, setIsOpenSearchUsers] = useState(false);
  const [isVisibleReactionsModal, setIsVisibleReactionsModal] = useState(false);
  const [currentMessageReactions, setCurrentMessageReactions] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);

  // Current room messages
  const [selectedRoomMessages, setSelectedRoomMessages] = useState(null);

  // User Active Status
  const [usersActiveStatus, setUsersActiveStatus] = useState([]);
  // Room Active Status
  const [roomsActiveStatus, setRoomsActiveStatus] = useState([]);

  // Dark Mode / Light Mode
  const appConfig = JSON.parse(
    localStorage.getItem("xuanphuc_space_config")
  ) ?? { appTheme: "light" };

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

  // Format time
  const formatTime = (numbers) => {
    const hours = Math.floor(numbers / 60);
    let result = "";

    if (hours < 1) {
      result = numbers + " phút";
    } else if (hours < 24) {
      result = hours + " giờ";
    }
    return result;
  };

  // Update users active status
  useEffect(() => {
    const updateUserActive = () => {
      let isNotNull = true;

      const usersActiveTime = users.map((user) => {
        if (user.active === null) {
          isNotNull = false;
          return null;
        }

        const currentTime = Date.parse(new Date()) / 1000;
        const activeTime = user.active.seconds;
        const timeCount = Math.floor((currentTime - activeTime) / 60);
        const isActive = Math.floor((currentTime - activeTime) / 60) <= 1;

        return {
          uid: user.uid,
          timeCount,
          isActive,
        };
      });

      if (isNotNull) {
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
    }, 60 * 1000);

    return () => {
      clearInterval(timeId);
    };
  }, [users]);

  // Room active status
  useEffect(() => {
    if (rooms.length > 0 && usersActiveStatus.length > 0) {
      const roomsActive = rooms.map((room) => {
        let membersActive = usersActiveStatus.filter((user) => {
          return room.members.includes(user.uid);
        });

        if (
          membersActive.some(
            (member) => member.isActive === true && member.uid !== uid
          )
        ) {
          return {
            roomId: room.id,
            isActive: true,
            timeCount: 0,
          };
        } else {
          let minCount = 9999;
          membersActive.forEach((member) => {
            if (member.timeCount < minCount && member.uid !== uid) {
              minCount = member.timeCount;
            }
          });

          return {
            roomId: room.id,
            isActive: false,
            timeCount: formatTime(minCount),
          };
        }
      });

      setRoomsActiveStatus(roomsActive);
    }
  }, [rooms, usersActiveStatus, uid]);

  // Active time
  useEffect(() => {
    const updateActiveTime = () => {
      if (currentUser) {
        if (currentUser.active) {
          const currentTime = Date.parse(new Date()) / 1000;
          const activeTime = currentUser.active.seconds;

          if (currentTime - activeTime > 60) {
            console.log("Active");
            const currentUserRef = doc(db, "users", currentUser.id);
            updateDoc(currentUserRef, {
              active: serverTimestamp(),
            });
          }
        }
      }
    };
    document.addEventListener("click", updateActiveTime);
    document.addEventListener("keydown", updateActiveTime);
    document.addEventListener("wheel", updateActiveTime);

    return () => {
      document.removeEventListener("click", updateActiveTime);
      document.removeEventListener("keydown", updateActiveTime);
      document.removeEventListener("wheel", updateActiveTime);
    };
  }, [currentUser]);

  // Handle create chat room
  const handleCreateRoom = (
    members,
    nicknames,
    role,
    name = "",
    photoURL = "",
    callback
  ) => {
    const data = {
      name: name,
      description: "",
      isAcceptLink: false,
      photoURL: photoURL,
      fullPath: "",
      members: [...members],
      admins: [uid],
      roomNicknames: [...nicknames],
      role: role,
      lastMessage: {
        type: "",
        text: "",
        uid: "",
        displayName: "",
        createAt: serverTimestamp(),
      },
    };

    addDocument("rooms", data, callback);
  };

  // Send message (add document to "messages" collection)
  const sendMessage = (
    messText = "",
    messPhoto = "",
    fullPath = "",
    messType = "",
    subRoomId = ""
  ) => {
    addDocument("messages", {
      type: messType,
      text: messText,
      uid,
      photoURL: currentUser.photoURL,
      messagePhotoURL: messPhoto,
      fullPath,
      displayName: currentUser.displayName,
      roomId: selectedRoomId || subRoomId,
      reply: replyMessage,
      reactions: {
        heart: [],
        haha: [],
        wow: [],
        sad: [],
        angry: [],
        like: [],
      },
    });

    // Update room last message
    let roomRef = doc(db, "rooms", selectedRoomId || subRoomId);
    updateDoc(roomRef, {
      lastMessage: {
        type: messType,
        text: messText,
        uid,
        displayName: currentUser.displayName,
        createAt: serverTimestamp(),
      },
    }).catch((error) => {
      console.error(error);
    });
  };

  // Handle join Global chat (for new user)
  const joinGlobalChat = (uid) => {
    const roomid = "pe0dBPnY8yAkOwdiCUDU";
    const roomRef = doc(db, "rooms", roomid);

    if (uid && roomid) {
      updateDoc(roomRef, {
        members: arrayUnion(uid),
        roomNicknames: arrayUnion({ nickname: "", uid }),
        role: "group",
      })
        .then(() => {
          sendMessage(
            `đã tham gia Satellite`,
            null,
            null,
            "@roomnotify",
            roomid
          );
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  };

  // Generate room name
  const handleGenerateRoomName = (room) => {
    if (room) {
      if (room.role.includes("person")) {
        if (room.members.length === 1) {
          return {
            name: room.name,
            photoURL: room.photoURL,
          };
        } else if (room.members.length === 2) {
          // Return friend name
          const friendUID = room.members.find((members) => members !== uid);
          const friendNickname = room.roomNicknames.find(
            (nickname) => nickname.uid !== uid
          );
          const friendInfor =
            friendUID &&
            users.find((user) => {
              return user.uid === friendUID;
            });
          return (
            friendInfor && {
              name:
                (friendNickname && friendNickname.nickname) ||
                friendInfor.displayName,
              photoURL: friendInfor.photoURL,
            }
          );
        }
      } else if (room.role.includes("group")) {
        return {
          name: room.name,
          photoURL: room.photoURL,
        };
      }
    }
  };

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
        sendMessage,
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
        isOpenSearchUsers,
        setIsOpenSearchUsers,
        userOptionsVisible,
        setUserOptionsVisible,
        isVisibleReactionsModal,
        setIsVisibleReactionsModal,
        currentMessageReactions,
        setCurrentMessageReactions,
        alertContent,
        setAlertContent,
        alertVisible,
        setAlertVisible,
        isRoomListLoading,
        isUsersLoading,
        formatDate,
        usersActiveStatus,
        roomsActiveStatus,
        replyMessage,
        setReplyMessage,
        handleCreateRoom,
        handleGenerateRoomName,
        joinGlobalChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };
export default AppProvider;
