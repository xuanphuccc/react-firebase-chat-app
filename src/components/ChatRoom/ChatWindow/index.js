import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faEllipsisVertical,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { addDocument } from "../../../firebase/service";

import EmptyRoom from "../EmptyRoom";
import Message from "../Message";
import InviteMemberModal from "../../Modals/InviteMemberModal";
import RoomControlsModal from "../../Modals/RoomControlsModal";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";

const cx = classNames.bind(styles);

function ChatWindow() {
  const {
    selectedRoom,
    selectedRoomId,
    setSelectedRoomId,
    setIsInviteMemberVisible,
    messages,
    isMobile,
    setToggleComponent,
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
      const timeId = setTimeout(() => {
        mesListRef.current.scrollTo(0, mesListRef.current.scrollHeight);
        clearTimeout(timeId);
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (LastMesListRef.current) {
      LastMesListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [messageId]);

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

  return (
    <>
      {selectedRoom ? (
        <div className={cx("chat-window", { fixed: isMobile })}>
          {/*=========== Header ===========*/}
          <div className={cx("chat-window_header")}>
            {/* Room Name And Image */}
            <div className={cx("chat-window_header-info")}>
              {isMobile ? (
                <button
                  onClick={() => {
                    handleToggleComponent();
                    setSelectedRoomId("");
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
            {messages.map((message, index) => (
              <Message
                key={index}
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
