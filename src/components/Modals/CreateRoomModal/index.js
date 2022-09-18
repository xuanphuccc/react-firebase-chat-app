import classNames from "classnames/bind";
import styles from "./CreateRoomModal.module.scss";
import userPlaceHolderImg from "../../../assets/images/user.png";

import { useState, useContext, useRef, useEffect } from "react";

import Modal from "../Modal";
import { AppContext } from "../../../Context/AppProvider";
import { addDocument, uploadFile } from "../../../firebase/service";
import { AuthContext } from "../../../Context/AuthProvider";
import { getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function CreateRoomModal() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadPhoto, setUploadPhoto] = useState(null);
  const [previewPhotoURL, setPreviewPhotoURL] = useState("");
  const { isAddRoomVisible, setIsAddRoomVisible } = useContext(AppContext);
  const currentUser = useContext(AuthContext);
  const inputImageRef = useRef();
  const inputNameRef = useRef();

  // Handle Image input
  const handleImageInput = (e) => {
    setUploadPhoto(e.target.files[0]);
    setPreviewPhotoURL(URL.createObjectURL(e.target.files[0]));
  };

  const handleOk = () => {
    let isValid = false;
    if (uploadPhoto && name !== "") {
      const downloadUrl = uploadFile(uploadPhoto, `images/rooms_avatar/`);
      downloadUrl.then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          // add new room to firestore
          const data = {
            name,
            description,
            photoURL: url,
            fullPath: snapshot.metadata.fullPath,
            members: [currentUser.uid],
            admins: [currentUser.uid],
          };

          addDocument("rooms", data);
        });
      });
      isValid = true;
    }
    // add new room without avatar to firestore
    else if (name !== "") {
      const data = {
        name,
        description,
        photoURL: "",
        fullPath: "",
        members: [currentUser.uid],
        admins: [currentUser.uid],
      };
      addDocument("rooms", data);
      isValid = true;
    }

    // Đóng modal và xóa input
    if (isValid) {
      setIsAddRoomVisible(false);
      setName("");
      setDescription("");
      setUploadPhoto(null);
      setPreviewPhotoURL("");
      inputImageRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setUploadPhoto(null);
    setIsAddRoomVisible(false);
    setPreviewPhotoURL("");
    inputImageRef.current.value = "";
  };

  // Submit form on press enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && previewPhotoURL) {
      handleOk();
    }
  };

  // Focus input on open
  useEffect(() => {
    inputNameRef.current.focus();
  }, [isAddRoomVisible]);

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
            ref={inputNameRef}
            className={cx("input-box")}
            type="text"
            placeholder="Nhập tên phòng"
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            value={name}
          />
        </div>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Mô tả
          </label>
          <input
            className={cx("input-box")}
            type="text"
            placeholder="Nhập mô tả"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            value={description}
          />
        </div>
        <div className={cx("input-wrap", "avatar-container")}>
          <input
            ref={inputImageRef}
            onChange={handleImageInput}
            className={cx("input-image")}
            accept="image/*"
            type="file"
            name=""
            id=""
          />

          <div className={cx("avatar-preview-wrap")}>
            <img
              className={cx("avatar-preview-img")}
              src={previewPhotoURL || userPlaceHolderImg}
              alt=""
            />

            <button
              onClick={() => {
                inputImageRef.current.click();
              }}
              className={cx("avatar-preview-icon")}
            >
              {!previewPhotoURL && <FontAwesomeIcon icon={faCamera} />}
            </button>
          </div>
          <p className={cx("avatar-preview-title")}>Chọn ảnh đại diện</p>
        </div>
      </div>
    </Modal>
  );
}

export default CreateRoomModal;
