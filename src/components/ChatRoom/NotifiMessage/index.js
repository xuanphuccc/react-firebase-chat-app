import classNames from "classnames/bind";
import styles from "./NotifiMessage.module.scss";

import { useMemo, useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function NotifiMessage({ message }) {
  const { uid } = useContext(AuthContext);
  const { users, selectedRoom } = useContext(AppContext);

  // Get message user
  const userInfor = useMemo(() => {
    let result = {};
    if (users) {
      const infor = users.find((user) => user.uid === message.uid);
      const nickname = selectedRoom.roomNicknames.find(
        (nickname) => nickname.uid === message.uid
      );
      result = {
        ...infor,
        ...nickname,
      };
    }

    return result;
  }, [users, message.uid, selectedRoom]);

  return (
    <p key={message.id} className={cx("notifi-message")}>
      {(message.uid === uid
        ? "Bạn "
        : Object.keys(userInfor).length
        ? userInfor.nickname || userInfor.displayName
        : message.displayName) +
        " " +
        message.text}
      {"."}
    </p>
  );
}

export default NotifiMessage;
