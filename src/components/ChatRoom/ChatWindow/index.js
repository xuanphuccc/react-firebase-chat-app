import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faPersonWalkingArrowRight,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import { useContext, useState, useMemo, useRef, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { addDocument } from "../../../firebase/service";
import useFirestore from "../../../hooks/useFirestore";

import EmptyRoom from "../EmptyRoom";
import Message from "../Message";
import InviteMemberModal from "../../Modals/InviteMemberModal";
import BasicModal from "../../Modals/BasicModal";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";
import { db } from "../../../firebase/config";

const cx = classNames.bind(styles);

function ChatWindow() {
  const { selectedRoom, selectedRoomId, members, setIsInviteMemberVisible } =
    useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [isRoomMenuVisible, setIsRoomMenuVisible] = useState(false);

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
                    <div className={cx("participants-wrapper")}>
                      {members.map((member) => (
                        <div key={member.id}>
                          <Tippy
                            placement="bottom"
                            content={
                              <div className={cx("participants_name")}>
                                {member.displayName}
                              </div>
                            }
                          >
                            <img
                              key={member.uid}
                              className={cx("participants_img")}
                              src={member.photoURL}
                              alt=""
                            />
                          </Tippy>
                        </div>
                      ))}
                    </div>
                    <div className={cx("leave-room")}>
                      <button
                        onClick={handleLeaveRoom}
                        className={cx("leave-room-btn")}
                      >
                        <span>Rời phòng</span>
                        <i className={cx("leave-room-icon")}>
                          <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                        </i>
                      </button>
                    </div>
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
