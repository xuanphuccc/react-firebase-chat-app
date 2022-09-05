import classNames from "classnames/bind";
import styles from "./Message.module.scss";

import Tippy from "@tippyjs/react";

import { useContext } from "react";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function Message({ content, displayName, createAt, photoURL, userId }) {
  const { uid } = useContext(AuthContext);

  const isReceivedMsg = userId === uid;

  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "America/Los_Angeles",
  };
  const time = new Intl.DateTimeFormat("en-US", options).format(createAt);

  return (
    <div className={cx("wrapper", { received: isReceivedMsg })}>
      <img className={cx("user-img")} src={photoURL} alt="" />
      <Tippy
        placement="left"
        content={
          <div>
            <p className={cx("time")}>{time}</p>
          </div>
        }
      >
        <div className={cx("content")}>
          <h4 className={cx("user-name")}>{displayName}</h4>
          <p className={cx("text")}>{content}</p>
        </div>
      </Tippy>
    </div>
  );
}

export default Message;
