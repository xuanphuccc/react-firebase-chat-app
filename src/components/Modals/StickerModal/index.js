import classNames from "classnames/bind";
import styles from "./StickerModal.module.scss";
import {
  faFaceSmile,
  faPlus,
  faSplotch,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { listAllFile, uploadFile } from "../../../firebase/service";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

const cx = classNames.bind(styles);

function StickerModal() {
  const { currentUser, setAlertVisible, setAlertContent, sendMessage } =
    useContext(AppContext);

  const [editStickers, setEditSticker] = useState(false);
  const [stickersType, setStickersType] = useState("default");
  const [listAllStickers, setListAllStickers] = useState({});

  const inputStickerRef = useRef();

  useEffect(() => {
    listAllFile("images/stickers_store/default", (listURL) => {
      setListAllStickers({
        default: [...listURL],
        custom: [...currentUser.stickers],
      });
    });
  }, [currentUser]);

  // useEffect(() => {
  //   const stickersGroupsName = ["default"];
  //   const stickersGroups = {};
  //   stickersGroupsName.forEach((item) => {
  //     listAllFile(`images/stickers_store/${item}`, (listURL) => {
  //       stickersGroups[item] = listURL;
  //       console.log("list URL: ", listURL);
  //     });
  //     console.log("hêllo");
  //   });

  //   stickersGroups["custom"] = currentUser.stickers;

  //   console.log("stickers Groups: ", stickersGroups);
  //   setListAllStickers(stickersGroups);
  // }, [currentUser]);

  // console.log("stickers Groups: ", listAllStickers);
  // console.log("stickers Groups: ", listAllStickers["default"]);

  const handleUploadSticker = (e) => {
    if (e.target.files[0].size <= 3000000) {
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
    } else {
      setAlertVisible(true);
      setAlertContent({
        title: "Không tải tệp lên được",
        description:
          "File bạn đã chọn quá lớn. Kích thước sticker tối đa là 3MB.",
      });
    }

    inputStickerRef.current.value = "";
  };

  const handleRemoveSticker = (fullPath) => {
    const newStickers = currentUser.stickers.filter(
      (sticker) => sticker.fullPath !== fullPath
    );

    const userRef = doc(db, "users", currentUser.id);
    updateDoc(userRef, {
      stickers: newStickers,
    });

    // Remove file from Storage
    // deleteFile(fullPath);
  };

  const handleSendMessage = (photoURL) => {
    if (!editStickers) {
      sendMessage("sticker", photoURL, null, "@sticker");
    }
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
        title="Add custom sticker"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <ul className={cx("stickers-header")}>
        <li
          onClick={() => {
            setStickersType("default");
          }}
          className={cx("stickers-header_item", {
            active: stickersType === "default",
          })}
        >
          <FontAwesomeIcon icon={faFaceSmile} />
        </li>
        <li
          onClick={() => {
            setStickersType("custom");
          }}
          className={cx("stickers-header_item", {
            active: stickersType === "custom",
          })}
        >
          {/* {Object.keys(listAllStickers).length > 0 &&
          listAllStickers["custom"][0] ? (
            <img
              className={cx("stickers-header_thumb")}
              src={listAllStickers["custom"][0].url}
              alt=""
            />
          ) : ( */}
          <FontAwesomeIcon icon={faSplotch} />
          {/* )} */}
        </li>
      </ul>
      <div className={cx("stickers-content-wrap")}>
        <ul className={cx("stickers-content")}>
          {Object.keys(listAllStickers).length > 0 &&
            listAllStickers[stickersType].map((sticker, index) => (
              <li key={index} className={cx("stickers-content_item")}>
                <div className={cx("stickers-content_item-bg")}>
                  {editStickers && stickersType === "custom" && (
                    <span
                      onClick={() => {
                        handleRemoveSticker(sticker.fullPath);
                      }}
                      className={cx("stickers-content_item-cancel")}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </span>
                  )}
                  <img
                    onClick={() => {
                      handleSendMessage(sticker.url);
                    }}
                    className={cx("stickers-content_item-img")}
                    src={sticker.url}
                    alt=""
                  />
                </div>
              </li>
            ))}
        </ul>

        {Object.keys(listAllStickers).length > 0 &&
        listAllStickers["custom"].length > 0 &&
        stickersType === "custom" ? (
          <div className={cx("controls")}>
            {!editStickers ? (
              <button
                onClick={() => {
                  setEditSticker(true);
                }}
                className={cx("control-btn")}
              >
                Sửa
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditSticker(false);
                }}
                className={cx("control-btn")}
              >
                Xong
              </button>
            )}
          </div>
        ) : (
          <p className={cx("empty-sticker")}>
            {stickersType === "custom" && "Nhấn vào + để thêm Sticker của bạn."}
          </p>
        )}
      </div>
    </div>
  );
}

export default StickerModal;
