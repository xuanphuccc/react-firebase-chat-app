import classNames from "classnames/bind";
import styles from "./CreateRoomModal.module.scss";

import { useState, useContext } from "react";

import Modal from "../Modal";
import { AppContext } from "../../../Context/AppProvider";
import { addDocument } from "../../../firebase/service";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function CreateRoomModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const { isAddRoomVisible, setIsAddRoomVisible } = useContext(AppContext);
  const currentUser = useContext(AuthContext);

  const handleOk = () => {
    // Logic...
    // add new room to firestore
    const inputData = {
      name,
      description,
      photoURL,
      members: [currentUser.uid],
      admins: [currentUser.uid],
    };

    if (name !== "" && description !== "") {
      addDocument("rooms", inputData);
    }

    // Đóng modal và xóa input
    setIsAddRoomVisible(false);
    setName("");
    setDescription("");
    setPhotoURL("");
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setPhotoURL("");
    setIsAddRoomVisible(false);
  };

  return (
    <Modal
      title="Tạo phòng"
      visible={isAddRoomVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className={cx("add-room-modal")}>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Tên phòng *
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="Nhập tên phòng"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
          />
        </div>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Mô tả *
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="Nhập mô tả"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            value={description}
          />
        </div>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Ảnh đại diện
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="URL hình ảnh"
            onChange={(e) => {
              setPhotoURL(e.target.value);
            }}
            value={photoURL}
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateRoomModal;
