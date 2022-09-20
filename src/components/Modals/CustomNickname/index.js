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
  } = useContext(AppContext);

  const [showInput, setShowInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef();
  const submitBtnRef = useRef();

  const handleInputOnChange = (e) => {
    setInputValue(e.target.value);
  };

  // Lấy thông tin của user từ mảng roomNicknames
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

  useEffect(() => {
    setShowInput("");
  }, [isOpenCustomNickname]);

  // Handle change nickname
  const handleOnSubmit = (userId) => {
    if (inputValue.trim()) {
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== userId
      );

      newRoomNicknames.push({ uid: userId, nickname: inputValue });

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        roomNicknames: newRoomNicknames,
      });

      setInputValue("");
      setShowInput("");
    }
  };

  // Xử lý focus input khi bấm sửa
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  // Sử lý submit kh bấm enter
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
      }}
      title="Biệt danh"
    >
      <div className={cx("wrapper")}>
        <ul className={cx("users-list")}>
          {renderUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => {
                setShowInput(user.uid);
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
                    placeholder={user.nickname}
                    type="text"
                  />
                ) : (
                  <h4 className={cx("user-name")}>
                    {user.nickname}
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
                      handleOnSubmit(user.uid);
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
