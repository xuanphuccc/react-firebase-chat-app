import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

import { db } from "../../../firebase/config";
import { updateDoc, doc } from "firebase/firestore";

import ReactionsControl from "../ReactionsControl";
import ReactionsIcon from "../ReactionsIcon";
import ReactionsModal from "../../Modals/ReactionsModal";

const cx = classNames.bind(styles);

function Message({
  id,
  content,
  displayName,
  createAt,
  photoURL,
  userId,
  posType,
  type,
  reactions,
  messagePhotoURL,
}) {
  const { uid } = useContext(AuthContext);
  const { members, selectedRoom, setSelectedPhoto } = useContext(AppContext);

  const [isHasIcon, setIsHasIcon] = useState(false);

  // Kiểm tra tin nhắn là nhận hay gửi
  const isSentMsg = userId === uid;

  // Set active reaction icon
  const [activeIcon, setActiveIcon] = useState("");

  // Set trạng thái hiển thị của ReactionsModal
  const [isVisibleReactionsModal, setIsVisibleReactionsModal] = useState(false);

  // Navigate
  const navigate = useNavigate();

  // Lấy ra user của tin nhắn
  const memberInfor = useMemo(() => {
    let result = {};
    if (members) {
      const infor = members.find((member) => member.uid === userId);
      const nickname = selectedRoom.roomNicknames.find(
        (nickname) => nickname.uid === userId
      );
      result = {
        ...infor,
        ...nickname,
      };
    }

    return result;
  }, [members, userId, selectedRoom]);

  // Định dạng lại ngày tháng
  const formatMessageDate = (createAt) => {
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

    let yearMonthDate = `${time.date} Tháng ${time.month}, ${time.year}`;
    const currentTime = new Date();
    if (
      time.year === currentTime.getFullYear() &&
      time.month === currentTime.getMonth() + 1 &&
      time.date === currentTime.getDate()
    ) {
      yearMonthDate = "";
    }

    const hoursMinutes = `${time.hours < 10 ? `0${time.hours}` : time.hours}:${
      time.minutes < 10 ? `0${time.minutes}` : time.minutes
    }`;
    return `${hoursMinutes} ${yearMonthDate}`;
  };

  // Mở Chat media khi click vào ảnh
  const handleOpenChatMedia = useMemo(() => {
    return (url) => {
      setSelectedPhoto(url);
      navigate("/chat-media");
    };
  }, [navigate, setSelectedPhoto]);

  // Xử lý tin nhắn hình ảnh, không có hình ảnh và bị gỡ
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
    } else if (type === "@sticker") {
      return (
        <img className={cx("sticker-photo")} src={messagePhotoURL} alt="" />
      );
    } else if (type === "@text" || type === "@icon") {
      return <p className={cx("text-inner")}>{content}</p>;
    }
  }, [type, content, messagePhotoURL, handleOpenChatMedia]);

  // Set hiển thị icon và set active icon
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

  // Xử lý thu hồi tin nhắn
  const handleUnsentMessage = () => {
    if (userId === uid) {
      let messageRef = doc(db, "messages", id);
      updateDoc(messageRef, {
        type: "@unsentmsg",
      });
    }
  };

  // Xử lý đóng mở modal ReactionsModal
  const handleToggleReactionsModal = () => {
    setIsVisibleReactionsModal(!isVisibleReactionsModal);
  };

  return (
    <div
      className={cx("wrapper", {
        sent: isSentMsg,
        received: !isSentMsg,
        [posType]: posType,
        isHasIcon: isHasIcon,
      })}
    >
      <img
        className={cx("user-img")}
        // Trường hợp tin nhắn của người trong phòng (đã rời phòng) thì dùng ảnh mặc định
        src={Object.keys(memberInfor).length ? memberInfor.photoURL : photoURL}
        alt=""
      />

      <div className={cx("content")}>
        <h4 className={cx("user-name")}>
          {/*Trường hợp tin nhắn của người trong phòng (đã rời phòng) thì dùng tên mặc định */}
          {Object.keys(memberInfor).length ? memberInfor.nickname : displayName}
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
                        onClick={handleUnsentMessage}
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
