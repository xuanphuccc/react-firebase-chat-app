import classNames from "classnames/bind";
import styles from "./InviteMemberModal.module.scss";

import { useState, useContext } from "react";

import { AppContext } from "../../../Context/AppProvider";
// import { AuthContext } from "../../Context/AuthProvider";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";
const cx = classNames.bind(styles);

function InviteMemberModal() {
  const [inputValue, setInputValue] = useState("");

  const { isInviteMemberVisible, setIsInviteMemberVisible, selectedRoomId } =
    useContext(AppContext);

  // Lấy uid của người dùng hiện tại
  // const { uid } = useContext(AuthContext);

  const handleOk = () => {
    const roomRef = doc(db, "rooms", selectedRoomId);

    if (inputValue.trim()) {
      updateDoc(roomRef, {
        members: arrayUnion(inputValue.trim()),
      });
    }

    // Đóng modal và xóa input
    setIsInviteMemberVisible(false);
    setInputValue("");
  };

  const handleCancel = () => {
    setInputValue("");
    setIsInviteMemberVisible(false);
  };

  return (
    <Modal
      title="Mời thêm thành viên"
      visible={isInviteMemberVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className={cx("wrapper")}>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Mã mời
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="Nhập ID thành viên"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
          />
        </div>
      </div>
    </Modal>
  );
}

export default InviteMemberModal;
