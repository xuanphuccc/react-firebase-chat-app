import classNames from "classnames/bind";
import styles from "./ChangeRoomName.module.scss";

import { useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "../../../Context/AppProvider";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";

const cx = classNames.bind(styles);

function ChangeRoomName() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef();

  const {
    selectedRoom,
    selectedRoomId,
    isOpenChangeRoomName,
    setIsOpenChangeRoomName,
    sendMessage,
  } = useContext(AppContext);

  // Handle change room name
  const handleChangeRoomName = () => {
    if (inputValue.trim() && inputValue.trim() !== selectedRoom.name) {
      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        name: inputValue.trim(),
      })
        .then(() => {
          sendMessage(
            `đã đặt tên nhóm là ${inputValue.trim()}`,
            null,
            null,
            "@roomnotify"
          );
        })
        .catch((error) => {
          console.error(error);
        });

      setIsOpenChangeRoomName(false);
    }
    setIsOpenChangeRoomName(false);
  };

  // Set input initial value
  useEffect(() => {
    if (selectedRoom) {
      setInputValue(selectedRoom.name);
    }
  }, [selectedRoom]);

  // Focus input when open
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpenChangeRoomName]);

  // Submit when press Enter
  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      handleChangeRoomName();
      setIsOpenChangeRoomName(false);
    }
  };

  return (
    <Modal
      title="Đổi tên đoạn chat"
      visible={isOpenChangeRoomName}
      okButton={false}
      onCancel={() => {
        setIsOpenChangeRoomName(false);
        setInputValue(selectedRoom.name);
      }}
    >
      <div className={cx("wrapper")}>
        <p className={cx("title")}>
          Mọi người đều không biết khi tên nhóm chat thay đổi.
        </p>
        <div
          onClick={() => {
            inputRef.current.focus();
          }}
          className={cx("input-wrap")}
        >
          <div className={cx("input-container")}>
            <label className={cx("input-label")} htmlFor="input">
              Tên đoạn chat
            </label>
            <input
              ref={inputRef}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onKeyDown={handleOnKeyDown}
              value={inputValue.length < 100 ? inputValue : ""}
              className={cx("input")}
              type="text"
              id="input"
            />
          </div>
          <p className={cx("character-count")}>{`${inputValue.length}/100`}</p>
        </div>
        <div className={cx("controls")}>
          <button
            onClick={() => {
              setInputValue(selectedRoom.name);
              setIsOpenChangeRoomName(false);
            }}
            className={cx("btn", "cancel-btn")}
          >
            Hủy
          </button>
          <button
            onClick={handleChangeRoomName}
            className={cx("btn", "primary", "ok-btn")}
          >
            Lưu
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ChangeRoomName;
