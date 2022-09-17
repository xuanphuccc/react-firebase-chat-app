import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../Context/AuthProvider";

import ReactionsControl from "../ReactionsControl";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
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
  type,
  reactions,
  messagePhotoURL,
}) {
  const { uid } = useContext(AuthContext);

  const [isHasIcon, setIsHasIcon] = useState(false);

  // Kiểm tra tin nhắn là nhận hay gửi
  const isSentMsg = userId === uid;

  // Set active reaction icon
  const [activeIcon, setActiveIcon] = useState("");

  // Set trạng thái hiển thị của ReactionsModal
  const [isVisibleReactionsModal, setIsVisibleReactionsModal] = useState(false);

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

  // Set hiển thị icon và set active icon
  useEffect(() => {
    for (let type in reactions) {
      if (reactions[type].length >= 1) {
        setIsHasIcon(true);
        if (reactions[type].includes(uid)) {
          setActiveIcon(type);
          break;
        }
      }
    }
  }, [reactions, uid]);

  // Xử lý đóng mở modal ReactionsModal
  const handleToggleReactionsModal = () => {
    setIsVisibleReactionsModal(!isVisibleReactionsModal);
  };

  return (
    <div
      className={cx("wrapper", {
        sent: isSentMsg,
        received: !isSentMsg,
        [type]: type,
        isHasIcon: isHasIcon,
      })}
    >
      <img className={cx("user-img")} src={photoURL} alt="" />

      <div className={cx("content")}>
        <h4 className={cx("user-name")}>{displayName}</h4>
        <div className={cx("text-wrap")}>
          <div className={cx("text", { [type]: type })}>
            <Tippy
              placement="top"
              delay={[400, 250]}
              content={
                <div>
                  <p className={cx("time")}>{formatMessageDate(createAt)}</p>
                </div>
              }
            >
              {messagePhotoURL ? (
                <img
                  className={cx("message-photo")}
                  src={messagePhotoURL}
                  alt=""
                />
              ) : (
                <p className={cx("text-inner")}>{content}</p>
              )}
            </Tippy>
            <div onClick={handleToggleReactionsModal}>
              {isHasIcon && <ReactionsIcon reactions={reactions} />}
            </div>

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
