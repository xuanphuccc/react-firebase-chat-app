import classNames from "classnames/bind";
import styles from "./JoinRoomModal.module.scss";

import { useState, useContext } from "react";

import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";

const cx = classNames.bind(styles);

function JoinRoomModal() {
  const [roomCode, setRoomCode] = useState("");
  const { isJoinRoomVisible, setIsJoinRoomVisible } = useContext(AppContext);
  const currentUser = useContext(AuthContext);

  const handleOk = () => {
    if (roomCode.trim()) {
      const roomRef = doc(db, "rooms", roomCode.trim());

      updateDoc(roomRef, {
        members: arrayUnion(currentUser.uid),
      });
    }

    // Đóng modal và xóa input
    setIsJoinRoomVisible(false);
    setRoomCode("");
  };

  const handleCancel = () => {
    setRoomCode("");
    setIsJoinRoomVisible(false);
  };

  return (
    <Modal
      title="Tham gia phòng"
      visible={isJoinRoomVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className={cx("add-room-modal")}>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Mã phòng *
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="Nhập mã phòng"
            onChange={(e) => {
              setRoomCode(e.target.value);
            }}
            value={roomCode}
          />
        </div>
      </div>
    </Modal>
  );
}

export default JoinRoomModal;
