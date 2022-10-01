import classNames from "classnames/bind";
import styles from "./CreateRoomModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

import { useState, useContext, useRef, useEffect } from "react";

import { addDocument, uploadFile } from "../../../firebase/service";
import { serverTimestamp } from "firebase/firestore";

import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";
import Modal from "../Modal";

const cx = classNames.bind(styles);

function CreateRoomModal() {
  const [name, setName] = useState("");
  const [uploadPhoto, setUploadPhoto] = useState(null);
  const [previewPhotoURL, setPreviewPhotoURL] = useState("");
  const {
    isAddRoomVisible,
    setIsAddRoomVisible,
    setAlertContent,
    setAlertVisible,
  } = useContext(AppContext);
  const currentUser = useContext(AuthContext);
  const inputImageRef = useRef();
  const inputNameRef = useRef();

  // Handle Image input
  const handleImageInput = (e) => {
    if (e.target.files[0].size < 3000000) {
      setUploadPhoto(e.target.files[0]);
      setPreviewPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else {
      setAlertVisible(true);
      setAlertContent({
        title: "Không tải tệp lên được",
        description:
          "File bạn đã chọn quá lớn. Kích thước ảnh đại diện tối đa là 3MB",
      });
    }
  };

  const handleOk = () => {
    let isValid = false;

    // Add new room with avatar to firestore
    if (uploadPhoto && name !== "") {
      uploadFile(uploadPhoto, `images/rooms_avatar/`, (url, fullPath) => {
        const data = {
          name,
          description: "",
          isAcceptLink: false,
          photoURL: url,
          fullPath: fullPath,
          members: [currentUser.uid],
          admins: [currentUser.uid],
          roomNicknames: [
            { nickname: currentUser.displayName, uid: currentUser.uid },
          ],
          lastMessage: {
            type: "",
            text: "",
            uid: "",
            displayName: "",
            createAt: serverTimestamp(),
          },
        };

        addDocument("rooms", data);
      });

      isValid = true;
    }
    // add new room without avatar to firestore
    // else if (name !== "") {
    //   const data = {
    //     name,
    //     description,
    //     photoURL: "",
    //     fullPath: "",
    //     members: [currentUser.uid],
    //     admins: [currentUser.uid],
    //     roomNicknames: [
    //       { nickname: currentUser.displayName, uid: currentUser.uid },
    //     ],
    //   };
    //   addDocument("rooms", data);
    //   isValid = true;
    // }

    // Close modal and clear input
    if (isValid) {
      setIsAddRoomVisible(false);
      setName("");
      setUploadPhoto(null);
      setPreviewPhotoURL("");
      inputImageRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setName("");
    setUploadPhoto(null);
    setIsAddRoomVisible(false);
    setPreviewPhotoURL("");
    inputImageRef.current.value = "";
  };

  // Submit form on press "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && previewPhotoURL) {
      handleOk();
    }
  };

  // Focus input when open
  useEffect(() => {
    inputNameRef.current.focus();
  }, [isAddRoomVisible]);

  return (
    <Modal
      title="Tạo phòng"
      visible={isAddRoomVisible}
      onOk={handleOk}
      OkTitle="Tạo phòng"
      onCancel={handleCancel}
    >
      <div className={cx("add-room-modal")}>
        <p className={cx("input-title")}>Chọn tên và ảnh đại diện</p>
        <div className={cx("room-infor")}>
          <div className={cx("avatar-preview")}>
            <input
              ref={inputImageRef}
              onChange={handleImageInput}
              className={cx("input-image")}
              accept="image/*"
              type="file"
              name=""
              id=""
            />
            <div className={cx("avatar-preview-img-container")}>
              {previewPhotoURL && (
                <img
                  className={cx("avatar-preview-img")}
                  src={previewPhotoURL}
                  alt=""
                />
              )}
            </div>

            <button
              onClick={() => {
                inputImageRef.current.click();
              }}
              className={cx("avatar-preview-icon")}
            >
              {!previewPhotoURL && <FontAwesomeIcon icon={faCamera} />}
            </button>
          </div>

          <div
            onClick={() => {
              inputNameRef.current.focus();
            }}
            className={cx("input-wrap")}
          >
            <div className={cx("input-container")}>
              <label className={cx("input-label")} htmlFor="">
                Tên phòng chat
              </label>
              <input
                ref={inputNameRef}
                className={cx("input-box")}
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                value={name.length <= 100 ? name : ""}
              />
            </div>

            <p className={cx("input-count")}>{name.length}/100</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateRoomModal;
