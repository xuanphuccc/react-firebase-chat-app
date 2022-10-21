import classNames from "classnames/bind";
import styles from "./MessageControls.module.scss";
import { faReply, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";

import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../../../Context/AuthProvider";
import { AppContext } from "../../../../Context/AppProvider";

import { db } from "../../../../firebase/config";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

import ReactionsControl from "../ReactionsControl";

const cx = classNames.bind(styles);

function MessageControls({
  message,
  setIsHasIcon,
  messageIndex,
  messagesLength,
}) {
  const { uid } = useContext(AuthContext);
  const { setReplyMessage } = useContext(AppContext);

  const [activeIcon, setActiveIcon] = useState("");

  const {
    id: msgid,
    text: content,
    displayName,
    uid: userId,
    reactions,
    roomId,
  } = message;

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
  }, [reactions, uid, setIsHasIcon]);

  // Handle unsend message
  const handleUnsendMessage = () => {
    if (userId === uid) {
      // Update this message type
      let messageRef = doc(db, "messages", msgid);
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

  return (
    <>
      {/* Reactions message */}
      <Tippy
        interactive="true"
        trigger="click"
        content={
          <ReactionsControl
            id={msgid}
            reactions={reactions}
            activeIcon={activeIcon}
            setIsHasIcon={setIsHasIcon}
            setActiveIcon={setActiveIcon}
          />
        }
      >
        <button className={cx("control-btn")} title="Bày tỏ cảm xúc">
          <FontAwesomeIcon icon={faFaceSmile} />
        </button>
      </Tippy>

      {/* Reply message */}
      <button
        onClick={() => {
          setReplyMessage(message);
        }}
        className={cx("control-btn")}
        title="Trả lời"
      >
        <FontAwesomeIcon icon={faReply} />
      </button>

      {/* Unsend message */}
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
          <button className={cx("control-btn")} title="Xem thêm">
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </Tippy>
      )}
    </>
  );
}

export default MessageControls;
