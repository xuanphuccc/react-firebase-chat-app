import classNames from "classnames/bind";
import styles from "./MessagesForm.module.scss";
import {
  faPaperPlane,
  faImage,
  faXmark,
  faCirclePlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";

import { useContext, useState, useRef } from "react";

import { AppContext } from "../../../Context/AppProvider";

import { uploadFile } from "../../../firebase/service";

import hahaIcon from "../../../assets/images/minicon/haha.png";
import StickerIcon from "../../../assets/images/icons/StickerIcon.js";
import GifIcon from "../../../assets/images/icons/GifIcon.js";
import StickerModal from "../../Modals/StickerModal";

const cx = classNames.bind(styles);

function MessagesForm({ roomId, setMuted }) {
  const { setAlertVisible, setAlertContent, sendMessage } =
    useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [fileUpload, setFileUpload] = useState(null);
  const [previewFileInput, setPreviewFileInput] = useState();

  const inputRef = useRef();
  const imageInputRef = useRef();

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle image input change and file size limit
  const handleImageInput = (e) => {
    if (
      e.target.files[0].size <= 25000000 &&
      e.target.files[0].type.includes("image")
    ) {
      setFileUpload(e.target.files[0]);
      setPreviewFileInput({
        type: "@image",
        data: URL.createObjectURL(e.target.files[0]),
      });
      inputRef.current.focus();
    } else if (e.target.files[0].type.includes("video")) {
      setFileUpload(e.target.files[0]);
      setPreviewFileInput({
        type: "@video",
        data: URL.createObjectURL(e.target.files[0]),
      });
      inputRef.current.focus();
    } else if (e.target.files[0].size > 25000000) {
      setAlertVisible(true);
      setAlertContent({
        title: "Không tải tệp lên được",
        description: "File bạn đã chọn quá lớn. Kích thước file tối đa là 25MB",
      });
      imageInputRef.current.value = "";
    } else {
      setAlertVisible(true);
      setAlertContent({
        title: "Không tải tệp lên được",
        description:
          "File bạn đã chọn không phù hợp. Hiện tại chưa hỗ trợ định dạng này.",
      });
      imageInputRef.current.value = "";
    }
  };

  // Handle send messages (text, image)
  const handleOnSubmit = () => {
    if (fileUpload) {
      if (fileUpload.type.includes("image")) {
        uploadFile(
          fileUpload,
          `images/chat_room/${roomId}`,
          (url, fullPath) => {
            if (inputValue.trim()) {
              // Send text
              sendMessage(inputValue, null, null, "@text");
            }

            // Send image
            sendMessage("Photo", url, fullPath, "@image");
          }
        );
      } else if (fileUpload.type.includes("video")) {
        uploadFile(
          fileUpload,
          `videos/chat_room/${roomId}`,
          (url, fullPath) => {
            if (inputValue.trim()) {
              // Send text
              sendMessage(inputValue, null, null, "@text");
            }

            // Send video
            sendMessage("Photo", url, fullPath, "@video");
          }
        );
      }
    } else if (inputValue) {
      // Send text only
      sendMessage(inputValue, null, null, "@text");
    }

    // Clear input, preview and focus input again
    handleClearPreview();
    setInputValue("");
    setMuted(false);
  };

  // Send icon only
  const handleSendIcon = (value) => {
    if (value) {
      sendMessage(value, null, null, "@icon");
    }
  };

  // Press "Enter" to send messages
  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleOnSubmit();
    }
  };

  // Clear preview
  const handleClearPreview = () => {
    setFileUpload(null);
    setPreviewFileInput("");
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
          accept="image/*, video/*"
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
        <Tippy interactive="true" trigger="click" content={<StickerModal />}>
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
        {previewFileInput && (
          <div className={cx("media-preview")}>
            <div className={cx("media-preview-file-wrap")}>
              {previewFileInput.type === "@image" && (
                <img
                  className={cx("media-preview-file")}
                  src={previewFileInput.data}
                  alt=""
                />
              )}

              {previewFileInput.type === "@video" && (
                <video
                  className={cx("media-preview-file")}
                  src={previewFileInput.data}
                  width="50"
                  height="50"
                ></video>
              )}

              {previewFileInput.type === "@video" && (
                <span className={cx("play-preview-file-btn")}>
                  <FontAwesomeIcon icon={faCirclePlay} />
                </span>
              )}

              <button
                onClick={handleClearPreview}
                className={cx("remove-preview-file-btn")}
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
      </div>

      <div className={cx("button-wrap")}>
        {inputValue.trim() || fileUpload ? (
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
