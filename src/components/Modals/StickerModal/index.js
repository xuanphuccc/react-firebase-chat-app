import classNames from "classnames/bind";
import styles from "./StickerModal.module.scss";
import { faFaceSmile, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import plaholderImg from "../../../assets/images/user.png";
import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { useState } from "react";
import { useRef } from "react";
import { uploadFile } from "../../../firebase/service";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

const cx = classNames.bind(styles);

function StickerModal() {
  const { currentUser } = useContext(AppContext);

  const [stickerUpload, setStickerUpload] = useState(null);

  const inputStickerRef = useRef();

  const handleUploadSticker = (e) => {
    // setStickerUpload(e.target.files[0]);
    uploadFile(
      e.target.files[0],
      `images/users_stickers/${currentUser.uid}`,
      (url, fullPath) => {
        const userRef = doc(db, "users", currentUser.id);
        updateDoc(userRef, {
          stickers: arrayUnion({ url, fullPath }),
        });
      }
    );
  };

  return (
    <div className={cx("wrapper")}>
      <input
        ref={inputStickerRef}
        onChange={handleUploadSticker}
        style={{ display: "none" }}
        type="file"
        accept="image/*"
        name=""
        id=""
      />
      <button
        onClick={() => {
          inputStickerRef.current.click();
        }}
        className={cx("add-stickers-btn")}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <ul className={cx("stickers-header")}>
        <li className={cx("stickers-header_item")}>
          <FontAwesomeIcon icon={faFaceSmile} />
        </li>
      </ul>
      <ul className={cx("stickers-content")}>
        {currentUser.stickers.length > 0
          ? currentUser.stickers.map((sticker, index) => (
              <li key={index} className={cx("stickers-content_item")}>
                <div className={cx("stickers-content_item-bg")}>
                  <img
                    className={cx("stickers-content_item-img")}
                    src={sticker.url}
                    alt=""
                  />
                </div>
              </li>
            ))
          : false}
      </ul>
    </div>
  );
}

export default StickerModal;
