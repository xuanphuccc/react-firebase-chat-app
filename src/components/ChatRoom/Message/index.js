import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";

import { useContext } from "react";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function Message({ content, displayName, createAt, photoURL, userId, type }) {
  const { uid } = useContext(AuthContext);

  // Kiểm tra tin nhắn là nhận hay gửi
  const isSentMsg = userId === uid;

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

    // let timeDayOfWeek = "Thứ hai";
    // switch (time.day) {
    //   case 2:
    //     timeDayOfWeek = "Thứ ba";
    //     break;
    //   case 3:
    //     timeDayOfWeek = "Thứ tư";
    //     break;
    //   case 4:
    //     timeDayOfWeek = "Thứ năm";
    //     break;
    //   case 5:
    //     timeDayOfWeek = "Thứ sáu";
    //     break;
    //   case 6:
    //     timeDayOfWeek = "Thứ bảy";
    //     break;
    //   case 0:
    //     timeDayOfWeek = "CN";
    //     break;

    //   default:
    //     break;
    // }

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

  return (
    <div
      className={cx("wrapper", {
        sent: isSentMsg,
        received: !isSentMsg,
        [type]: type,
      })}
    >
      <img className={cx("user-img")} src={photoURL} alt="" />
      <Tippy
        placement="top"
        delay={[400, 250]}
        content={
          <div>
            <p className={cx("time")}>{formatMessageDate(createAt)}</p>
          </div>
        }
      >
        <div className={cx("content")}>
          <h4 className={cx("user-name")}>{displayName}</h4>
          <p className={cx("text", { [type]: type })}>{content}</p>
        </div>
      </Tippy>
    </div>
  );
}

export default Message;
