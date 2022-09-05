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
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import { useContext, useState, useRef, useEffect } from "react";
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
    isMobile,
    setToggleComponent,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [visibleAdmin, setVisibleAdmin] = useState(false);
  const [isOnlyAdmin, setIsOnlyAdmin] = useState(false);
  const [messageId, setMessageId] = useState("");

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

  // Xử lý scroll tin nhắn lên mỗi khi có tin nhắn mới
  useEffect(() => {
    if (mesListRef.current) {
      mesListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [messages]);

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
    // handleScroll();
  };

  // Xử lý sự kiện nhấn nút Enter vào input
  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleOnSubmit();
    }
  };

  // Phát âm báo mỗi lần có tin nhắn mới
  useEffect(() => {
    if (messages.length) {
      const messagesLength = messages.length;
      setMessageId(messages[messagesLength - 1].id);
    }
  }, [messages]);

  useEffect(() => {
    const audio = new Audio(messageSound);
    audio.volume = 0.5;
    audio.play();
  }, [messageId]);

  // ------ HANDLE RESPONSIVE -------
  const handleToggleComponent = () => {
    setToggleComponent(true);
  };

  // ------ HANDLE LEAVE ROOM ------
  const handleLeaveRoom = () => {
    // Xóa uid của người dùng hiện tại
    // khỏi trường members của rooms
    const roomRef = doc(db, "rooms", selectedRoomId);

    if (admins.includes(uid) && admins.length === 1) {
      console.log("You are the only admin!!!");
      setIsOnlyAdmin(true);
    } else {
      updateDoc(roomRef, {
        members: arrayRemove(uid),
      });

      // Nếu là admin và không là admin duy nhất
      // thì xóa vai trò admin
      handleRemoveAdmin(uid);

      // Đóng modal sau khi rời phòng
      setIsRoomMenuVisible(false);
      console.log("Leave Room!");
    }
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
  }, [selectedRoom, visibleAdmin]);

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

      // Sau khi thêm admin thì chuyển trạng thái
      // only admin thành false
      setIsOnlyAdmin(false);
    }
  };

  // Xử lý Xóa admin
  const handleRemoveAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      // Nếu người dùng là admin duy nhất thì không được xóa
      // vai trò của mình
      if (userId === uid && admins.length === 1) {
        console.log("You are the only admin!!!");
        setIsOnlyAdmin(true);
      } else {
        updateDoc(roomRef, {
          admins: arrayRemove(userId),
        });
      }

      // Có tác dụng cập nhật hiển thị lên admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  return (
    <>
      {selectedRoom ? (
        <div className={cx("chat-window")}>
          {/*=========== Header ===========*/}
          <div className={cx("chat-window_header")}>
            {/* Room Name And Image */}
            <div className={cx("chat-window_header-info")}>
              {isMobile ? (
                <button
                  onClick={() => {
                    handleToggleComponent();
                  }}
                  className={cx("back-btn")}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>
              ) : (
                false
              )}
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

            {/* Invite Members And Room Controls */}
            <div className={cx("chat-window_header-users")}>
              <i
                onClick={handleInviteMemberModal}
                className={cx("header-user_icon", "icon-small")}
              >
                <FontAwesomeIcon icon={faCirclePlus} />
              </i>

              {/* Invite Members Modal */}
              <InviteMemberModal />

              {/* Room Controls Modal */}
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

                    {/* Controls participants */}
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
                              <i
                                className={cx("admin-icon", {
                                  disable: isOnlyAdmin,
                                })}
                              >
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

                                {/* Hiện icon nếu là admin */}
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

                    {/* Room Control Buttons */}
                    <div className={cx("room-control")}>
                      <button
                        onClick={handleLeaveRoom}
                        className={cx("room-control-btn", "leave-room-btn", {
                          disable: isOnlyAdmin,
                        })}
                      >
                        <div className={cx("btn-content")}>
                          <span>Rời phòng</span>
                          <i className={cx("room-control-icon")}>
                            <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                          </i>
                        </div>
                        <div className={cx("disable-message")}>
                          <p className={cx("title")}>Bạn là admin duy nhất!</p>
                          <p className={cx("content")}>
                            Vui lòng chuyển vị trí admin cho những người khác
                            trước khi rời phòng
                          </p>
                        </div>
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

          {/*=========== Message List ===========*/}
          <div className={cx("message-list")}>
            {messages.map((message, index) => (
              <Message
                key={index}
                content={message.text}
                displayName={message.displayName}
                createAt={message.createAt}
                photoURL={message.photoURL}
              />
            ))}
            <span ref={mesListRef}></span>
          </div>

          {/*=========== Message Form ===========*/}
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
