import classNames from "classnames/bind";
import styles from "./CustomNickname.module.scss";
import placeHolderImg from "../../../assets/images/user.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "../../../Context/AppProvider";

import Modal from "../Modal";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

const cx = classNames.bind(styles);

function CustomNickname() {
  const {
    selectedRoom,
    selectedRoomId,
    members,
    isOpenCustomNickname,
    setIsOpenCustomNickname,
    sendMessage,
  } = useContext(AppContext);

  const [showInput, setShowInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef();
  const submitBtnRef = useRef();

  const handleInputOnChange = (e) => {
    setInputValue(e.target.value);
  };

  // Get user infor roomNicknames array
  const renderUsers = useMemo(() => {
    let result = [];
    if (selectedRoom && members.length) {
      result = selectedRoom.roomNicknames.map((memberNickname) => {
        let memberInfor = members.find(
          (member) => member.uid === memberNickname.uid
        );

        return {
          ...memberInfor,
          nickname: memberNickname.nickname,
        };
      });
    }

    return result;
  }, [selectedRoom, members]);

  // Handle change nickname
  const handleOnSubmit = (userId, userName) => {
    const prevNickname = selectedRoom.roomNicknames.find(
      (nickname) => nickname.uid === userId
    );

    if (prevNickname.nickname !== inputValue.trim()) {
      // delete old nickname
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== userId
      );

      // push new nickname
      newRoomNicknames.push({ uid: userId, nickname: inputValue });

      const roomRef = doc(db, "rooms", selectedRoomId);

      if (inputValue.trim() !== "") {
        updateDoc(roomRef, {
          roomNicknames: newRoomNicknames,
        })
          .then(() => {
            sendMessage(
              `đã đặt biệt danh của ${userName} là ${inputValue.trim()}`,
              null,
              null,
              "@roomnotify"
            );
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (inputValue.trim() === "") {
        updateDoc(roomRef, {
          roomNicknames: newRoomNicknames,
        })
          .then(() => {
            sendMessage(
              `đã xóa biệt danh của ${prevNickname.nickname || userName}`,
              null,
              null,
              "@roomnotify"
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
    setInputValue("");
    setShowInput("");
  };

  // Focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  // Handle submit when press "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitBtnRef.current.click();
    }
  };

  return (
    <Modal
      okButton={false}
      visible={isOpenCustomNickname}
      onCancel={() => {
        setIsOpenCustomNickname(false);
        setInputValue("");
      }}
      title="Biệt danh"
    >
      <div className={cx("wrapper")}>
        <ul className={cx("users-list")}>
          {renderUsers.map((user) => (
            <li
              key={user.uid}
              tabIndex="0"
              onClick={() => {
                setShowInput(user.uid);
              }}
              onBlur={() => {
                // setShowInput("");
                // setInputValue("");
              }}
              className={cx("user-item")}
            >
              <div className={cx("user-wrap")}>
                <img
                  className={cx("user-img")}
                  src={user.photoURL || placeHolderImg}
                  alt=""
                />

                {showInput === user.uid ? (
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputOnChange}
                    onKeyDown={handleKeyDown}
                    className={cx("nickname-input")}
                    placeholder={user.nickname || user.displayName}
                    type="text"
                  />
                ) : (
                  <h4 className={cx("user-name")}>
                    {user.nickname || user.displayName}
                    <span className={cx("custom-nickname-title")}>
                      Đặt biệt danh
                    </span>
                  </h4>
                )}
              </div>
              <div className={cx("icon-wrap")}>
                {showInput === user.uid ? (
                  <span
                    ref={submitBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOnSubmit(user.uid, user.displayName);
                    }}
                    className={cx("icon-item")}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                ) : (
                  <span className={cx("icon-item")}>
                    <FontAwesomeIcon icon={faPen} />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default CustomNickname;
