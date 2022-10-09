import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

import { db } from "../../../firebase/config";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

import ReactionsControl from "../ReactionsControl";
import ReactionsIcon from "../ReactionsIcon";
import ReactionsModal from "../../Modals/ReactionsModal";

const cx = classNames.bind(styles);

function Message({ message, messageIndex, messagesLength }) {
  const {
    id,
    text: content,
    displayName,
    createAt,
    photoURL,
    uid: userId,
    posType,
    type,
    reactions,
    messagePhotoURL,
    roomId,
  } = message;
  const { uid } = useContext(AuthContext);
  const { users, selectedRoom, setSelectedPhoto, formatDate } =
    useContext(AppContext);

  const [isHasIcon, setIsHasIcon] = useState(false);
  const [activeIcon, setActiveIcon] = useState("");
  const [isVisibleReactionsModal, setIsVisibleReactionsModal] = useState(false);
  const [isPlay, setIsPlay] = useState(false);

  const videoRef = useRef();

  const navigate = useNavigate();

  // Received or sent messages check
  const isSentMsg = userId === uid;

  // Get message user
  const userInfor = useMemo(() => {
    let result = {};
    if (users) {
      const infor = users.find((user) => user.uid === userId);
      const nickname = selectedRoom.roomNicknames.find(
        (nickname) => nickname.uid === userId
      );
      result = {
        ...infor,
        ...nickname,
      };
    }

    return result;
  }, [users, userId, selectedRoom]);

  // Format Time
  const formatMessageDate = (createAt) => {
    const messageDate = formatDate(createAt);

    let dateTimeString = "";
    if (messageDate.date && messageDate.month && messageDate.year) {
      dateTimeString = `${messageDate.hoursMinutes} ${messageDate.date} Tháng ${messageDate.month}, ${messageDate.year}`;
    } else {
      dateTimeString = messageDate.hoursMinutes;
    }

    return dateTimeString;
  };

  // Open ChatMedia when click image
  const handleOpenChatMedia = useMemo(() => {
    return (url) => {
      setSelectedPhoto(url);
      navigate("/chat-media");
    };
  }, [navigate, setSelectedPhoto]);

  //
  useEffect(() => {
    const handlePlay = () => {
      videoRef.current.play();
      videoRef.current.setAttribute("controls", "controls");
    };

    const handlePauseVisible = () => {
      setIsPlay(false);
    };
    const handlePlayVisible = () => {
      setIsPlay(true);
    };

    const handleRemoveControls = () => {
      videoRef.current.removeAttribute("controls");
    };
    if (videoRef.current) {
      const videoTag = videoRef.current;
      videoTag.addEventListener("mouseover", handlePlay);
      videoTag.addEventListener("mouseleave", handleRemoveControls);
      videoTag.addEventListener("pause", handlePauseVisible);
      videoTag.addEventListener("play", handlePlayVisible);

      return () => {
        videoTag.removeEventListener("mouseover", handlePlay);
        videoTag.removeEventListener("mouseleave", handleRemoveControls);
        videoTag.removeEventListener("pause", handlePauseVisible);
        videoTag.addEventListener("play", handlePlayVisible);
      };
    }
  }, []);

  // Handle display message
  const renderMessageContent = useMemo(() => {
    if (type === "@unsentmsg") {
      return <p className={cx("unsent-message")}>Tin nhắn đã bị thu hồi</p>;
    } else if (type === "@image") {
      return (
        <img
          onClick={() => {
            handleOpenChatMedia(messagePhotoURL);
          }}
          className={cx("message-photo", "text-inner")}
          src={messagePhotoURL}
          alt=""
        />
      );
    } else if (type === "@video") {
      return (
        <video
          ref={videoRef}
          className={cx("message-video")}
          src={messagePhotoURL}
          muted="muted"
        ></video>
      );
    } else if (type === "@sticker") {
      return (
        <img className={cx("sticker-photo")} src={messagePhotoURL} alt="" />
      );
    } else if (type === "@text" || type === "@icon") {
      if (
        content.includes("http://") ||
        content.includes("https://") ||
        content.includes("www.")
      ) {
        return (
          <p className={cx("text-inner")}>
            <a
              className={cx("text-link")}
              href={`${content}`}
              target="_blank"
              rel="noreferrer nofollow"
            >
              {content}
            </a>
          </p>
        );
      } else {
        return <p className={cx("text-inner")}>{content}</p>;
      }
    }
  }, [type, content, messagePhotoURL, handleOpenChatMedia]);

  // Set icon display and set active icon
  useEffect(() => {
    let count = 0;
    for (let type in reactions) {
      if (reactions[type].length >= 1) {
        setIsHasIcon(true);
        count = 1;

        if (reactions[type].includes(uid)) {
          setActiveIcon(type);
          break;
        }
      }
    }

    if (count === 0) {
      setIsHasIcon(false);
    }
  }, [reactions, uid]);

  // Handle unsend message
  const handleUnsendMessage = () => {
    if (userId === uid) {
      // Update this message type
      let messageRef = doc(db, "messages", id);
      updateDoc(messageRef, {
        type: "@unsentmsg",
      });

      // Update last message type
      if (messageIndex === messagesLength - 1) {
        let roomRef = doc(db, "rooms", roomId);
        updateDoc(roomRef, {
          lastMessage: {
            type: "@unsentmsg",
            text: content,
            uid: userId,
            displayName: displayName,
            createAt: serverTimestamp(),
          },
        });
      }
    }
  };

  // handle open and close ReactionsModal
  const handleToggleReactionsModal = () => {
    setIsVisibleReactionsModal(!isVisibleReactionsModal);
  };

  const [isOpenMessageControls, setIsOpenMessageControls] = useState(false);

  return (
    <div
      tabIndex={-1}
      onFocus={() => {
        setIsOpenMessageControls(true);
      }}
      onBlur={() => {
        setIsOpenMessageControls(false);
      }}
      className={cx("wrapper", {
        sent: isSentMsg,
        received: !isSentMsg,
        [posType]: posType,
        isHasIcon: isHasIcon,
        active: isOpenMessageControls,
      })}
    >
      <img
        className={cx("user-img")}
        // Trường hợp tin nhắn của người trong phòng (đã rời phòng) thì dùng ảnh mặc định
        src={Object.keys(userInfor).length ? userInfor.photoURL : photoURL}
        alt=""
      />

      <div className={cx("content")}>
        <h4 className={cx("user-name")}>
          {/*Trường hợp tin nhắn của người trong phòng (đã rời phòng) thì dùng tên mặc định */}
          {Object.keys(userInfor).length
            ? userInfor.nickname || userInfor.displayName
            : displayName}
        </h4>
        <div className={cx("text-wrap")}>
          <div className={cx("text")}>
            <Tippy
              placement="top"
              delay={[400, 250]}
              content={
                <div>
                  <p className={cx("time")}>{formatMessageDate(createAt)}</p>
                </div>
              }
            >
              {renderMessageContent}
            </Tippy>

            {!isPlay && type === "@video" && (
              <span className={cx("message-video-play-icon")}>
                <FontAwesomeIcon icon={faCirclePlay} />
              </span>
            )}

            <div onClick={handleToggleReactionsModal}>
              {isHasIcon && <ReactionsIcon reactions={reactions} />}
            </div>

            <div
              className={cx("message-controls", {
                onlyReaction: userId !== uid,
              })}
            >
              <Tippy
                interactive="true"
                trigger="click"
                content={
                  <ReactionsControl
                    id={id}
                    reactions={reactions}
                    activeIcon={activeIcon}
                    setIsHasIcon={setIsHasIcon}
                    setActiveIcon={setActiveIcon}
                  />
                }
              >
                <button className={cx("reaction-btn")}>
                  <FontAwesomeIcon icon={faFaceSmile} />
                </button>
              </Tippy>

              {userId === uid && (
                <Tippy
                  interactive="true"
                  trigger="click"
                  content={
                    <div className={cx("unsent-control")}>
                      <button
                        onClick={handleUnsendMessage}
                        className={cx("unsent-btn")}
                      >
                        Gỡ tin nhắn
                      </button>
                    </div>
                  }
                >
                  <button className={cx("reaction-btn")}>
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                </Tippy>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReactionsModal
        isVisible={isVisibleReactionsModal}
        handleVisible={handleToggleReactionsModal}
        reactions={reactions}
      />
    </div>
  );
}

export default Message;
