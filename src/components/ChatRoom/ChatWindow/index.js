import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faArrowDown,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState, useRef, useEffect, useMemo, memo } from "react";
import { AppContext } from "../../../Context/AppProvider";

import useFirestore from "../../../hooks/useFirestore";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";

import RoomOptions from "../RoomOptions";
import CustomNickname from "../../Modals/CustomNickname";
import ChangeRoomName from "../../Modals/ChangeRoomName";
import MessagesForm from "../MessagesForm";
import MessagesList from "../MessagesList";
import ReactionsModal from "../../Modals/ReactionsModal";

const cx = classNames.bind(styles);

function ChatWindow({ roomId }) {
  const {
    rooms,
    roomsActiveStatus,
    setSelectedRoomId,
    isMobile,
    handleRoomMenuVisible,
    isRoomMenuVisible,
    setSelectedRoomMessages,
    isVisibleReactionsModal,
    setIsVisibleReactionsModal,
    currentMessageReactions,
    handleGenerateRoomName,
    setIsOpenSearchUsers,
  } = useContext(AppContext);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isMutedSound, setIsMutedSound] = useState(true);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);

  const mesListRef = useRef();

  // Set room ID (AppContext) when selected room or load
  useEffect(() => {
    setSelectedRoomId(roomId);
  }, [roomId, setSelectedRoomId]);

  // HANDLE GET MESSAGES
  // Get current room messages
  const messagesCondition = useMemo(() => {
    // Get messages with the same roomId field as (current) roomId
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: roomId,
    };
  }, [roomId]);

  const messages = useFirestore("messages", messagesCondition);

  // Global
  useEffect(() => {
    setSelectedRoomMessages(messages);
  }, [messages, setSelectedRoomMessages]);

  // Get selected room with room id
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId),
    [rooms, roomId]
  );

  // Play sound when have new message
  useEffect(() => {
    if (messages.length) {
      const messagesLength = messages.length;
      setCurrentMessage(messages[messagesLength - 1]);
    }
  }, [messages]);

  useEffect(() => {
    const audio = new Audio(messageSound);
    audio.volume = 0.3;
    if (isMutedSound) {
      audio.muted = true;
    } else {
      audio.muted = false;
      audio.play();
    }
  }, [currentMessage.id, isMutedSound]);

  // Handle side by side messages with the same sender
  const sideBySideMessages = useMemo(() => {
    // const newMessages = [...messages];

    const newMessages = messages.slice(0);

    //### Messages length >= 3
    if (newMessages.length >= 3) {
      for (let i = 0; i < newMessages.length; i++) {
        //## i = 0
        if (i === 0) {
          if (
            newMessages[i].uid === newMessages[i + 1].uid &&
            newMessages[i + 1].type !== "@roomnotify"
          ) {
            newMessages[i].posType = "first-message";
          } else newMessages[i].posType = "default";
        }

        //## i = messages list length
        else if (i === newMessages.length - 1) {
          if (
            newMessages[i].uid === newMessages[i - 1].uid &&
            newMessages[i - 1].type !== "@roomnotify"
          ) {
            newMessages[i].posType = "last-message";
          } else newMessages[i].posType = "default";
        }

        //## i = messages[i]
        else {
          // messages[i-1].uid = messages[i].uid = messages[i+1].uid
          // => Middle message
          if (
            newMessages[i].uid === newMessages[i + 1].uid &&
            newMessages[i].uid === newMessages[i - 1].uid &&
            newMessages[i + 1].type !== "@roomnotify" &&
            newMessages[i - 1].type !== "@roomnotify"
          ) {
            newMessages[i].posType = "middle-message";
          }

          // messages[i-1].uid != messages[i].uid = messages[i+1].uid
          // First message
          else if (
            newMessages[i].uid === newMessages[i + 1].uid &&
            newMessages[i + 1].type !== "@roomnotify"
          ) {
            newMessages[i].posType = "first-message";
          }

          // messages[i-1].uid = messages[i].uid != messages[i+1].uid
          // Last message
          else if (
            newMessages[i].uid === newMessages[i - 1].uid &&
            newMessages[i - 1].type !== "@roomnotify"
          ) {
            newMessages[i].posType = "last-message";
          }

          // messages[i-1].uid != messages[i].uid != messages[i+1].uid
          // Default message
          else {
            newMessages[i].posType = "default";
          }
        }
      }
    }

    //### Messages length = 2
    else if (newMessages.length === 2) {
      if (
        newMessages[0].uid === newMessages[1].uid &&
        newMessages[0].type !== "@roomnotify" &&
        newMessages[1].type !== "@roomnotify"
      ) {
        newMessages[0].posType = "first-message";
        newMessages[1].posType = "last-message";
      } else {
        newMessages[0].posType = "default";
        newMessages[1].posType = "default";
      }
    }

    //### Messages length = 1
    else if (newMessages.length === 1) {
      newMessages[0].posType = "default";
    }
    return newMessages.reverse();
  }, [messages]);

  // Room active status
  const findRoomActive = (roomId) => {
    const roomActive = roomsActiveStatus.find(
      (roomActive) => roomActive.roomId === roomId
    );
    if (roomActive) {
      if (roomActive.isActive) {
        return "Đang hoạt động";
      } else {
        return (
          roomActive.timeCount && `Hoạt động ${roomActive.timeCount} trước`
        );
      }
    }
  };

  // Handle scroll
  const handleScrollToBottom = () => {
    if (mesListRef.current) {
      mesListRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    // instant
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (!isScrollToBottom) {
      handleScrollToBottom();
    }
  }, [messages, isScrollToBottom]);

  return (
    <>
      {selectedRoom && (
        <div className={cx("chat-window-wrapper")}>
          <div
            onClick={() => {
              setIsOpenSearchUsers(false);
            }}
            className={cx("chat-window")}
          >
            {/*=========== Header ===========*/}
            <div className={cx("chat-window_header")}>
              {/* Room Name And Image */}
              <div className={cx("chat-window_header-info")}>
                {isMobile ? (
                  <Link to={"/room-list"}>
                    <button
                      onClick={() => {
                        // Remove active room
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

                <div className={cx("chat-window_header-img-wrap")}>
                  <img
                    src={
                      handleGenerateRoomName(selectedRoom).photoURL ||
                      placeHolderImg
                    }
                    alt=""
                    className={cx("chat-window_header-img")}
                  />

                  {/* Room active status */}
                  {findRoomActive(roomId) &&
                    findRoomActive(roomId).includes("Đang hoạt động") && (
                      <span
                        className={cx("chat-window_header-active-status")}
                      ></span>
                    )}
                </div>
                <div className={cx("chat-window_header-name-wrap")}>
                  <h4 className={cx("chat-window_header-name")}>
                    {handleGenerateRoomName(selectedRoom).name}
                  </h4>
                  {findRoomActive(roomId) && (
                    <>
                      <p className={cx("chat-desc")}>
                        {findRoomActive(roomId)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Room Controls btn*/}
              <div className={cx("chat-window_header-users")}>
                <i
                  onClick={handleRoomMenuVisible}
                  className={cx("header-menu_icon")}
                  title="Tùy chọn đoạn chat"
                >
                  <FontAwesomeIcon icon={faEllipsisH} />
                </i>
              </div>
            </div>

            {/*=========== Message List ===========*/}

            <div className={cx("message-list")}>
              {sideBySideMessages.length > 0 && (
                <MessagesList
                  ref1={mesListRef}
                  roomId={roomId}
                  sideBySideMessages={sideBySideMessages}
                  isScrollToBottom={isScrollToBottom}
                  setIsScrollToBottom={setIsScrollToBottom}
                />
              )}

              <ReactionsModal
                isVisible={isVisibleReactionsModal}
                handleVisible={() => {
                  setIsVisibleReactionsModal(!isVisibleReactionsModal);
                }}
                reactions={currentMessageReactions}
              />

              {isScrollToBottom && (
                <button
                  onClick={() => {
                    handleScrollToBottom();
                  }}
                  className={cx("to-bottom-btn")}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              )}
            </div>

            {/*=========== Message Form ===========*/}
            <MessagesForm roomId={roomId} setMuted={setIsMutedSound} />
          </div>
          {isRoomMenuVisible && (
            <div className={cx("room-option")}>
              <RoomOptions
                messages={messages}
                activeTime={findRoomActive(roomId)}
              />
            </div>
          )}

          <CustomNickname />
          <ChangeRoomName />
        </div>
      )}
    </>
  );
}

export default memo(ChatWindow);
