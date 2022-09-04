import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faPersonWalkingArrowRight,
  faEllipsisVertical,
  faTrash,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import { useContext, useState, useMemo, useRef, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { addDocument } from "../../../firebase/service";
import { db } from "../../../firebase/config";

import EmptyRoom from "../EmptyRoom";
import Message from "../Message";
import InviteMemberModal from "../../Modals/InviteMemberModal";
import BasicModal from "../../Modals/BasicModal";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";

const cx = classNames.bind(styles);

function ChatWindow() {
  const {
    selectedRoom,
    selectedRoomId,
    members,
    setIsInviteMemberVisible,
    messages,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [visibleAdmin, setVisibleAdmin] = useState(false);

  const { uid, displayName, photoURL } = useContext(AuthContext);

  const inputRef = useRef();
  const mesListRef = useRef();

  // Hàm xử lý mở modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // Hàm xử lý mở modal Room Menu
  const handleRoomMenuVisible = () => {
    setIsRoomMenuVisible(!isRoomMenuVisible);
  };

  // ------ HANDLE SEND MESSAGE ------
  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Xử lý scroll tin nhắn lên mỗi khi gửi
  const handleScroll = () => {
    const timeId = setTimeout(() => {
      mesListRef.current.scrollTo(0, mesListRef.current.scrollHeight);
      clearTimeout(timeId);
    }, 100);
  };

  // Hàm xử lý sự kiện Submit gửi tin nhắn lên database
  const handleOnSubmit = () => {
    if (inputValue) {
      addDocument("messages", {
        text: inputValue,
        uid,
        photoURL,
        displayName,
        roomId: selectedRoomId,
      });
    }

    // Clear input and focus
    setInputValue("");
    inputRef.current.focus();
    handleScroll();
  };

  // Xử lý sự kiện nhấn nút Enter vào input
  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleOnSubmit();
    }
  };

  // Phát âm báo mỗi lần có tin nhắn mới
  useEffect(() => {
    const audio = new Audio(messageSound);
    audio.volume = 0.5;
    audio.play();
  }, [messages]);

  // ------ HANDLE LEAVE ROOM ------
  const handleLeaveRoom = () => {
    // Xóa uid của người dùng hiện tại
    // khỏi trường members của rooms
    const roomRef = doc(db, "rooms", selectedRoomId);

    updateDoc(roomRef, {
      members: arrayRemove(uid),
    });

    // Đóng modal sau khi rời phòng
    setIsRoomMenuVisible(false);
    console.log("Leave Room!");
  };

  // ------ HANDLE ADMINS CONTROLS ------
  // Check selectedRoom có tồn tại hay không
  useEffect(() => {
    let roomAdmin = selectedRoom;
    if (!roomAdmin) {
      roomAdmin = {
        admins: [],
      };
    }

    setAdmins(roomAdmin.admins);
  }, [visibleAdmin, selectedRoomId]);

  // Xử lý xóa phòng hiện tại
  // và toàn bộ tin nhắn của phòng
  const handleDeleteRoom = () => {
    if (admins.includes(uid)) {
      // Xóa toàn bộ tin nhắn của phòng bị xóa
      messages.forEach((message) => {
        deleteDoc(doc(db, "messages", message.id));
      });

      // Xóa phòng hiện tại
      deleteDoc(doc(db, "rooms", selectedRoomId));
    }
  };

  // Xử lý thêm admin
  const handleAddAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      updateDoc(roomRef, {
        admins: arrayUnion(userId),
      });

      // Có tác dụng cập nhật hiển thị lên admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  // Xử lý Xóa admin
  const handleRemoveAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      updateDoc(roomRef, {
        admins: arrayRemove(userId),
      });

      // Có tác dụng cập nhật hiển thị lên admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  return (
    <>
      {selectedRoom ? (
        <div className={cx("chat-window")}>
          <div className={cx("chat-window_header")}>
            <div className={cx("chat-window_header-info")}>
              <img
                src={selectedRoom.photoURL || placeHolderImg}
                alt=""
                className={cx("chat-window_header-img")}
              />
              <div className={cx("chat-window_header-name-wrap")}>
                <h4 className={cx("chat-window_header-name")}>
                  {selectedRoom.name}
                </h4>
              </div>
            </div>
            <div className={cx("chat-window_header-users")}>
              <i
                onClick={handleInviteMemberModal}
                className={cx("header-user_icon", "icon-small")}
              >
                <FontAwesomeIcon icon={faCirclePlus} />
              </i>

              <InviteMemberModal />

              <BasicModal
                isVisible={isRoomMenuVisible}
                handleVisible={handleRoomMenuVisible}
                title="Thông tin phòng"
                modal={
                  <div className={cx("wrapper")}>
                    <div className={cx("room-code-wrap")}>
                      <h4 className={cx("room-code-title")}>Mã phòng</h4>
                      <p className={cx("room-code")}>{selectedRoomId}</p>
                    </div>
                    <p className={cx("q-and-a")}>
                      <span className={cx("q-and-a-title")}>Admin</span>
                      <FontAwesomeIcon icon={faCrown} />
                    </p>

                    <div className={cx("participants-wrapper")}>
                      {members.map((member) => (
                        <div key={member.id}>
                          <Tippy
                            placement="bottom"
                            content={
                              <div className={cx("participant_name")}>
                                {member.displayName}
                              </div>
                            }
                          >
                            <div
                              className={cx("participant_wrap", {
                                admin: admins.includes(member.uid),
                              })}
                            >
                              <img
                                key={member.uid}
                                className={cx("participant_img")}
                                src={member.photoURL}
                                alt=""
                              />
                              <i className={cx("admin-icon")}>
                                <i
                                  onClick={() => {
                                    handleRemoveAdmin(member.uid);
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className={cx("inner-icon-true")}
                                    icon={faCrown}
                                  />
                                </i>
                                {admins.includes(uid) ? (
                                  <i
                                    onClick={() => {
                                      handleAddAdmin(member.uid);
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      className={cx("inner-icon-false")}
                                      icon={faCirclePlus}
                                    />
                                  </i>
                                ) : (
                                  ""
                                )}
                              </i>
                            </div>
                          </Tippy>
                        </div>
                      ))}
                    </div>
                    <div className={cx("room-control")}>
                      <button
                        onClick={handleLeaveRoom}
                        className={cx("room-control-btn")}
                      >
                        <span>Rời phòng</span>
                        <i className={cx("room-control-icon")}>
                          <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                        </i>
                      </button>
                    </div>
                    {admins.includes(uid) ? (
                      <div className={cx("room-control")}>
                        <button
                          onClick={handleDeleteRoom}
                          className={cx("room-control-btn")}
                        >
                          <span>Xóa phòng</span>
                          <i className={cx("room-control-icon")}>
                            <FontAwesomeIcon icon={faTrash} />
                          </i>
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                }
              >
                <i
                  onClick={handleRoomMenuVisible}
                  className={cx("header-user_icon")}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </i>
              </BasicModal>
            </div>
          </div>

          <div ref={mesListRef} className={cx("message-list")}>
            {messages.map((message, index) => (
              <Message
                key={index}
                content={message.text}
                displayName={message.displayName}
                createAt={message.createAt}
                photoURL={message.photoURL}
              />
            ))}
          </div>
          <div className={cx("message-form")}>
            <input
              className={cx("message-form_input")}
              type="text"
              placeholder="Aa"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
            />
            <button
              onClick={handleOnSubmit}
              className={cx("message-form_btn", "btn", "rounded", "primary")}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      ) : (
        <EmptyRoom />
      )}
    </>
  );
}

export default ChatWindow;
