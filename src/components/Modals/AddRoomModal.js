import { useState, useContext } from "react";

import Modal from "./Modal";
import { AppContext } from "../../Context/AppProvider";
import { addDocument } from "../../firebase/service";
import { AuthContext } from "../../Context/AuthProvider";

function AddRoomModal() {
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
    };

    if (name !== "" && description !== "") {
      addDocument("rooms", inputData);
    }

    console.log("Input data: ", inputData);
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
      title="Thêm phòng"
      visible={isAddRoomVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="add-room-modal">
        <div className="input-wrap">
          <label className="input-label" htmlFor="">
            Tên phòng *
          </label>
          <input
            className="input-box"
            type="text"
            placeholder="Nhập tên phòng"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label" htmlFor="">
            Mô tả *
          </label>
          <input
            className="input-box"
            type="text"
            placeholder="Nhập mô tả"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            value={description}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label" htmlFor="">
            Ảnh đại diện
          </label>
          <input
            className="input-box"
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

export default AddRoomModal;
