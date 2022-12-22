import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay, faReply } from "@fortawesome/free-solid-svg-icons";

import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

import ReactionsIcon from "./ReactionsIcon";
import MessageControls from "./MessageControls";

const cx = classNames.bind(styles);

function Message({
  message,
  messageIndex,
  messagesLength,
  nowPlaying,
  setNowPlaying,
  zIndex,
}) {
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
  } = message;
  const { uid } = useContext(AuthContext);
  const {
    users,
    selectedRoom,
    setSelectedPhoto,
    formatDate,
    isVisibleReactionsModal,
    setIsVisibleReactionsModal,
    setCurrentMessageReactions,
  } = useContext(AppContext);

  const [isHasIcon, setIsHasIcon] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isOpenMessageControls, setIsOpenMessageControls] = useState(false);

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

  // Handle Play Video
  const handlePlay = useCallback(() => {
    setNowPlaying(id);
    videoRef.current.play();
    videoRef.current.setAttribute("controls", "controls");
  }, [id, setNowPlaying]);

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("controls");
    }
  };

  const handlePauseVisible = () => {
    setIsPlay(false);
  };
  const handlePlayVisible = () => {
    setIsPlay(true);
  };

  const handleRemoveVideoControls = () => {
    videoRef.current.removeAttribute("controls");
  };

  useEffect(() => {
    if (nowPlaying !== id) {
      handlePause();
    }
  }, [nowPlaying, id]);

  useEffect(() => {
    if (videoRef.current) {
      const videoTag = videoRef.current;
      videoTag.addEventListener("mouseover", handlePlay);
      videoTag.addEventListener("mouseleave", handleRemoveVideoControls);
      videoTag.addEventListener("pause", handlePauseVisible);
      videoTag.addEventListener("play", handlePlayVisible);

      return () => {
        videoTag.removeEventListener("mouseover", handlePlay);
        videoTag.removeEventListener("mouseleave", handleRemoveVideoControls);
        videoTag.removeEventListener("pause", handlePauseVisible);
        videoTag.addEventListener("play", handlePlayVisible);
      };
    }
  }, [handlePlay]);

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

  // User name and reply name
  const userName = useMemo(() => {
    if (Object.keys(userInfor).length) {
      if (Object.keys(message).includes("reply") && message.reply) {
        return (
          <>
            <span>
              <FontAwesomeIcon icon={faReply} />
            </span>
            {` `}
            {userInfor.uid === uid
              ? `Bạn`
              : userInfor.nickname || userInfor.displayName || displayName}
            {` đã trả lời `}
            {message.reply.uid === uid ? "bạn" : message.reply.displayName}
          </>
        );
      } else {
        return (
          <>{userInfor.nickname || userInfor.displayName || displayName}</>
        );
      }
    }
  }, [userInfor, uid, message, displayName]);

  // handle open and close ReactionsModal
  const handleToggleReactionsModal = () => {
    setIsVisibleReactionsModal(!isVisibleReactionsModal);
    setCurrentMessageReactions(reactions);
  };

  return (
    <div
      style={{ zIndex: zIndex }}
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
        // Trường hợp tin nhắn của người đã rời phòng thì dùng ảnh mặc định
        src={Object.keys(userInfor).length ? userInfor.photoURL : photoURL}
        alt=""
      />

      <div className={cx("content")}>
        <h4
          className={cx("user-name", {
            replyUserName:
              Object.keys(message).includes("reply") && message.reply,
          })}
        >
          {userName}
        </h4>
        <div className={cx("text-wrap")}>
          {Object.keys(message).includes("reply") && message.reply && (
            <>
              {message.reply.type === "@unsentmsg" ? (
                <p className={cx("reply")}>Tin nhắn đã bị thu hồi</p>
              ) : (
                <p className={cx("reply")}>{message.reply.text}</p>
              )}
            </>
          )}
          <div className={cx("text")}>
            {/* Message Content */}
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

            {/* Play Video Icon */}
            {!isPlay && type === "@video" && (
              <span
                onClick={handlePlay}
                className={cx("message-video-play-icon")}
              >
                <FontAwesomeIcon icon={faCirclePlay} />
              </span>
            )}

            {/* Reactions Icon Component */}
            <div onClick={handleToggleReactionsModal}>
              {isHasIcon && <ReactionsIcon reactions={reactions} />}
            </div>

            {/* Message Controls */}
            <div
              className={cx("message-controls", {
                onlyReaction: userId !== uid,
              })}
            >
              <MessageControls
                message={message}
                setIsHasIcon={setIsHasIcon}
                messageIndex={messageIndex}
                messagesLength={messagesLength}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
