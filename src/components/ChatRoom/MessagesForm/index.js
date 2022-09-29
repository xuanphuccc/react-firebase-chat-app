import classNames from "classnames/bind";
import styles from "./MessagesForm.module.scss";
import {
  faPaperPlane,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";

import { useContext, useState, useRef } from "react";

import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

import { addDocument, uploadFile } from "../../../firebase/service";

import hahaIcon from "../../../assets/images/minicon/haha.png";
import StickerIcon from "../../../assets/images/icons/StickerIcon.js";
import GifIcon from "../../../assets/images/icons/GifIcon.js";
import StickerModal from "../../Modals/StickerModal";

const cx = classNames.bind(styles);

function MessagesForm({ roomId }) {
  const { uid, displayName, photoURL } = useContext(AuthContext);
  const { setAlertVisible, setAlertContent } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  const [previewImageInput, setPreviewImageInput] = useState();

  const inputRef = useRef();
  const imageInputRef = useRef();

  // ------ HANDLE SEND MESSAGE ------
  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleImageInput = (e) => {
    if (e.target.files[0].size <= 25000000) {
      setImageUpload(e.target.files[0]);
      setPreviewImageInput(URL.createObjectURL(e.target.files[0]));
      inputRef.current.focus();
    } else {
      setAlertVisible(true);
      setAlertContent({
        title: "Không tải tệp lên được",
        description: "File bạn đã chọn quá lớn. Kích thước file tối đa là 25MB",
      });
      imageInputRef.current.value = "";
    }
  };

  const sendMessage = (messText, messPhoto, fullPath = "", messType) => {
    addDocument("messages", {
      type: messType,
      text: messText,
      uid,
      photoURL,
      messagePhotoURL: messPhoto,
      fullPath,
      displayName,
      roomId: roomId,
      reactions: {
        heart: [],
        haha: [],
        wow: [],
        sad: [],
        angry: [],
        like: [],
      },
    });
  };

  // Hàm xử lý sự kiện Submit gửi tin nhắn lên database
  const handleOnSubmit = () => {
    if (imageUpload) {
      // Nếu đã chọn ảnh thì gửi lên URL hình ảnh
      uploadFile(imageUpload, `images/chat_room/${roomId}`, (url, fullPath) => {
        // Nếu có input value thì gửi cả ảnh và tin nhắn
        if (inputValue.trim()) {
          // Gửi tin nhắn
          sendMessage(inputValue, null, null, "@text");
        }

        //Gửi ảnh
        sendMessage("Photo", url, fullPath, "@image");
      });
    } else if (inputValue) {
      // Nếu chưa chọn ảnh thì gửi inputValue
      sendMessage(inputValue, null, null, "@text");
    }

    // Clear input and focus
    handleClearPreview();
    setInputValue("");
  };

  // Gửi riêng icon
  const handleSendIcon = (value) => {
    if (value) {
      sendMessage(value, null, null, "@icon");
    }
  };

  // Xử lý sự kiện nhấn nút Enter vào input
  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleOnSubmit();
    }
  };

  // Xóa preview
  const handleClearPreview = () => {
    setImageUpload(null);
    setPreviewImageInput("");
    //clear input
    imageInputRef.current.value = "";
    inputRef.current.focus();
  };

  return (
    <div className={cx("message-form")}>
      <div className={cx("media-wrapper")}>
        <input
          ref={imageInputRef}
          className={cx("media_input-image")}
          onChange={handleImageInput}
          type="file"
          accept="image/*"
          name=""
          id=""
        />
        <button
          onClick={() => {
            imageInputRef.current.click();
          }}
          className={cx("media-btn")}
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
        <Tippy
          interactive="true"
          trigger="click"
          content={<StickerModal sendMessage={sendMessage} />}
        >
          <div>
            <button className={cx("media-btn")}>
              <StickerIcon />
            </button>
            <button className={cx("media-btn")}>
              <GifIcon />
            </button>
          </div>
        </Tippy>
      </div>

      <div className={cx("message-form_input-wrap")}>
        {previewImageInput && (
          <div className={cx("media-preview")}>
            <div className={cx("media-preview-img-wrap")}>
              <img
                className={cx("media-preview-img")}
                src={previewImageInput}
                alt=""
              />
              <button
                onClick={handleClearPreview}
                className={cx("remove-preview-img-btn")}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          onChange={handleInputChange}
          onKeyUp={handleKeyUp}
          value={inputValue}
          type="text"
          spellCheck="false"
          placeholder="Aa"
          className={cx("message-form_input")}
        />

        {/* <div
                  ref={inputRef}
                  onChange={handleInputChange}
                  spellCheck="false"
                  contentEditable="true"
                  className={cx("message-form_input")}
                ></div> */}
      </div>

      <div className={cx("button-wrap")}>
        {inputValue.trim() || imageUpload ? (
          <button
            onClick={handleOnSubmit}
            className={cx("message-form_btn", "btn", "rounded")}
          >
            <FontAwesomeIcon
              className={cx("form-btn-icon")}
              icon={faPaperPlane}
            />
          </button>
        ) : (
          <button
            onClick={() => {
              handleSendIcon("😂");
            }}
            className={cx("message-form_btn", "btn", "rounded")}
          >
            <img className={cx("form-btn-image")} src={hahaIcon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
}

export default MessagesForm;
