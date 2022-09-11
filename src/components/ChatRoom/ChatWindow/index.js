import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faEllipsisVertical,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState, useRef, useEffect, useMemo, memo } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { addDocument } from "../../../firebase/service";
import useFirestore from "../../../hooks/useFirestore";

import Message from "../Message";
import InviteMemberModal from "../../Modals/InviteMemberModal";
import RoomControlsModal from "../../Modals/RoomControlsModal";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";

const cx = classNames.bind(styles);

function ChatWindow({ roomId }) {
  const {
    rooms,
    setSelectedRoomId,
    setIsInviteMemberVisible,
    isMobile,
    handleRoomMenuVisible,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [messageId, setMessageId] = useState("");

  const { uid, displayName, photoURL } = useContext(AuthContext);

  const inputRef = useRef();
  const mesListRef = useRef();
  const LastMesListRef = useRef();

  // Hàm xử lý mở modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // ------ HANDLE SEND MESSAGE ------
  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Xử lý scroll tin nhắn lên mỗi khi có tin nhắn mới
  useEffect(() => {
    if (mesListRef.current) {
      mesListRef.current.scrollTo({
        top: mesListRef.current.scrollHeight,
        left: 0,
        behavior: "instant",
      });
    }
  }, [messageId, roomId]);

  // useEffect(() => {
  //   if (LastMesListRef.current) {
  //     LastMesListRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //       inline: "nearest",
  //     });
  //   }
  // }, [messageId]);

  // Hàm xử lý sự kiện Submit gửi tin nhắn lên database
  const handleOnSubmit = () => {
    if (inputValue) {
      addDocument("messages", {
        text: inputValue,
        uid,
        photoURL,
        displayName,
        roomId: roomId,
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

  // HANDLE GET MESSAGES
  // Lấy message của phòng được selected
  const messagesCondition = useMemo(() => {
    // Kiểm tra xem tin nhắn có roomId
    // trùng với current roomId không
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: roomId,
    };
  }, [roomId]);

  const messages = useFirestore("messages", messagesCondition);

  // Lấy ra phòng được selected
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId),
    [rooms, roomId]
  );

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

  return (
    <>
      {selectedRoom && (
        <div className={cx("chat-window", { fixed: isMobile })}>
          {/*=========== Header ===========*/}
          <div className={cx("chat-window_header")}>
            {/* Room Name And Image */}
            <div className={cx("chat-window_header-info")}>
              {isMobile ? (
                <Link to={"/room-list"}>
                  <button
                    onClick={() => {
                      // Bỏ active room
                      setSelectedRoomId("");
                    }}
                    className={cx("back-btn")}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </button>
                </Link>
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
                <p className={cx("chat-desc")}>Đang hoạt động</p>
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
              <RoomControlsModal>
                <i
                  onClick={handleRoomMenuVisible}
                  className={cx("header-user_icon")}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </i>
              </RoomControlsModal>
            </div>
          </div>

          {/*=========== Message List ===========*/}

          <div ref={mesListRef} className={cx("message-list")}>
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.text}
                displayName={message.displayName}
                createAt={message.createAt}
                photoURL={message.photoURL}
                userId={message.uid}
              />
            ))}

            <span ref={LastMesListRef}></span>
          </div>

          {/*=========== Message Form ===========*/}
          <div className={cx("message-form")}>
            <input
              className={cx("message-form_input")}
              type="text"
              placeholder="Aa"
              spellCheck="false"
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
      )}
    </>
  );
}

export default memo(ChatWindow);
