import { useState, useContext } from "react";

import { AppContext } from "../../Context/AppProvider";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/config";

import Modal from "./Modal";

function InviteMemberModal() {
  const [name, setName] = useState("");

  const { isInviteMemberVisible, setIsInviteMemberVisible, selectedRoomId } =
    useContext(AppContext);

  const handleOk = () => {
    // Logic...

    const roomRef = doc(db, "rooms", selectedRoomId);

    updateDoc(roomRef, {
      members: arrayUnion(name),
    });

    // Đóng modal và xóa input
    setIsInviteMemberVisible(false);
    setName("");
  };

  const handleCancel = () => {
    setName("");
    setIsInviteMemberVisible(false);
  };

  return (
    <Modal
      title="Mời thêm thành viên"
      visible={isInviteMemberVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="add-room-modal">
        <div className="input-wrap">
          <label className="input-label" htmlFor="">
            Mã mời
          </label>
          <input
            className="input-box"
            type="text"
            placeholder="Nhập mã mời"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
          />
        </div>
      </div>
    </Modal>
  );
}

export default InviteMemberModal;
