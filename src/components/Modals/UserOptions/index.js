import classNames from "classnames/bind";
import styles from "./UserOption.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCheck,
  faCircle,
  faMoon,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useEffect, useRef, useState } from "react";

import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "../../../firebase/service";
import { auth, db } from "../../../firebase/config";

import { AppContext } from "../../../Context/AppProvider";
import Modal from "../Modal";

const cx = classNames.bind(styles);

function UserOptions() {
  const [isShowInput, setIsShowInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const {
    currentUser,
    setAlertVisible,
    setAlertContent,
    userOptionsVisible,
    setUserOptionsVisible,
    theme,
    setTheme,
    setAppConfig,
  } = useContext(AppContext);

  const inputImageRef = useRef();
  const nameInputRef = useRef();

  // Sign Out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
        setUserOptionsVisible(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleChangeUserAvatar = (e) => {
    const uploadPhoto = e.target.files[0];

    if (uploadPhoto) {
      // if (currentUser.fullPath !== "") {
      //   deleteFile(currentUser.fullPath);
      // }

      if (uploadPhoto.size <= 3000000) {
        uploadFile(
          uploadPhoto,
          `images/users-avatar/${currentUser.uid}`,
          (url, fullPath) => {
            // Update current user image
            const userRef = doc(db, "users", currentUser.id);
            updateDoc(userRef, {
              photoURL: url,
              fullPath: fullPath,
            });
          }
        );
      } else {
        setAlertVisible(true);
        setAlertContent({
          title: "Kh??ng t???i t???p l??n ???????c",
          description:
            "File b???n ???? ch???n qu?? l???n. K??ch th?????c ???nh ?????i di???n t???i ??a l?? 3MB.",
        });
      }
    }

    // Close modal and clear input
    inputImageRef.current.value = "";
  };

  const handleChangeUserName = () => {
    if (nameInputValue.trim() && nameInputValue !== currentUser.displayName) {
      const userRef = doc(db, "users", currentUser.id);
      updateDoc(userRef, {
        displayName: nameInputValue.trim(),
      });

      setNameInputValue("");
      setIsShowInput(false);
    }
    setIsShowInput(false);
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      handleChangeUserName();
    }
  };

  useEffect(() => {
    // Before change user name
    if (currentUser) {
      setNameInputValue(currentUser.displayName);
    }

    // Focus when click
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isShowInput, currentUser]);

  // Handle change theme
  const handleChangeTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      setAppConfig("appTheme", "dark");
    } else {
      setTheme("light");
      setAppConfig("appTheme", "light");
    }
  };

  return (
    <Modal
      onCancel={() => {
        setUserOptionsVisible(false);
        setIsShowInput(false);
        setNameInputValue("");
      }}
      title="T??y ch???n"
      okButton={false}
      visible={userOptionsVisible}
    >
      <div className={cx("wrapper")}>
        <div className={cx("section", "no-boder")}>
          <h2 className={cx("section-name")}>T??i kho???n</h2>
          <ul className={cx("option-list")}>
            <li className={cx("option-item")}>
              <input
                ref={inputImageRef}
                onChange={handleChangeUserAvatar}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                name=""
                id=""
              />
              {currentUser && (
                <>
                  <img
                    onClick={(e) => {
                      e.stopPropagation();
                      inputImageRef.current.click();
                    }}
                    className={cx("user-img")}
                    src={currentUser.photoURL}
                    title="Ch???n ???nh ?????i di???n"
                    alt=""
                  />
                  {isShowInput ? (
                    <div
                      onClick={() => {
                        nameInputRef.current.focus();
                      }}
                      className={cx("user-name-input-wrap")}
                    >
                      <div className={cx("user-name-input-container")}>
                        <p className={cx("user-name-input-tile")}>
                          Nh???p t??n m???i
                        </p>
                        <input
                          ref={nameInputRef}
                          onChange={(e) => {
                            setNameInputValue(e.target.value);
                          }}
                          onKeyDown={handleOnKeyDown}
                          value={
                            nameInputValue.length <= 100 ? nameInputValue : ""
                          }
                          className={cx("user-name-input")}
                          type="text"
                        />
                      </div>
                      <span className={cx("name-input-count")}>
                        {nameInputValue.length}/100
                      </span>
                    </div>
                  ) : (
                    <h3
                      onClick={() => {
                        setIsShowInput(true);
                      }}
                      className={cx("user-name")}
                    >
                      {currentUser.displayName}
                      <span className={cx("user-name-label")}>
                        S???a t??n v?? ???nh ?????i di???n
                      </span>
                    </h3>
                  )}
                </>
              )}

              {isShowInput ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeUserName();
                  }}
                  className={cx("submit-btn", "option-icon")}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsShowInput(true);
                  }}
                  className={cx("submit-btn", "option-icon")}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              )}
            </li>
          </ul>
        </div>

        <div className={cx("section")}>
          <ul className={cx("option-list")}>
            <li onClick={handleChangeTheme} className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faMoon} />
              </span>
              <h4 className={cx("option-name")}>
                Ch??? ????? t???i: {theme === "light" ? "??ang t???t" : "??ang b???t"}
              </h4>
            </li>

            <li className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faCircle} />
              </span>
              <h4 className={cx("option-name")}>
                Tr???ng th??i ho???t ?????ng: ??ang b???t
              </h4>
            </li>
          </ul>
        </div>

        <div className={cx("section")}>
          <ul className={cx("option-list")}>
            <li
              onClick={() => {
                handleSignOut();
              }}
              className={cx("option-item")}
            >
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </span>
              <h4 className={cx("option-name")}>????ng xu???t</h4>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default UserOptions;
