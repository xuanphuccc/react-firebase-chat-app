import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faAngleLeft,
  faEllipsisH,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState, useRef, useEffect, useMemo, memo } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { addDocument, uploadFile } from "../../../firebase/service";
import useFirestore from "../../../hooks/useFirestore";
import { getDownloadURL } from "firebase/storage";

import Message from "../Message";
import RoomOptions from "../RoomOptions";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";
import hahaIcon from "../../../assets/images/minicon/haha.png";
import StickerIcon from "../../../assets/images/icons/StickerIcon.js";
import GifIcon from "../../../assets/images/icons/GifIcon.js";
import CustomNickname from "../../Modals/CustomNickname";
import ChangeRoomName from "../../Modals/ChangeRoomName";
// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "../../../firebase/config";

const cx = classNames.bind(styles);

function ChatWindow({ roomId }) {
  const {
    rooms,
    setSelectedRoomId,
    isMobile,
    handleRoomMenuVisible,
    isRoomMenuVisible,
    setSelectedRoomMessages,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  const [previewImageInput, setPreviewImageInput] = useState();
  const [currentMessage, setCurrentMessage] = useState("");

  const { uid, displayName, photoURL } = useContext(AuthContext);

  const inputRef = useRef();
  const imageInputRef = useRef();
  const mesListRef = useRef();
  const LastMesListRef = useRef();

  // Set selected room ID khi vào hoặc load lại phòng
  useEffect(() => {
    setSelectedRoomId(roomId);
  }, [roomId, setSelectedRoomId]);

  // HANDLE GET MESSAGES
  // Lấy message của phòng được selected
  const messagesCondition = useMemo(() => {
    // Lấy các tin nhắn có roomId
    // trùng với current roomId
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: roomId,
    };
  }, [roomId]);

  const messages = useFirestore("messages", messagesCondition);

  //
  useEffect(() => {
    setSelectedRoomMessages(messages);
  }, [messages, setSelectedRoomMessages]);

  // Lấy ra phòng được selected
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId),
    [rooms, roomId]
  );

  // Phát âm báo mỗi lần có tin nhắn mới
  useEffect(() => {
    if (messages.length) {
      const messagesLength = messages.length;
      setCurrentMessage(messages[messagesLength - 1]);
    }
  }, [messages]);

  useEffect(() => {
    const audio = new Audio(messageSound);
    audio.volume = 0.5;
    audio.play();
  }, [currentMessage.id]);

  // Xử lý scroll tin nhắn lên mỗi khi có tin nhắn mới
  useEffect(() => {
    if (mesListRef.current) {
      mesListRef.current.scrollTo({
        top: mesListRef.current.scrollHeight,
        left: 0,
        behavior: "instant",
      });
    }
  }, [currentMessage.id, roomId]);

  // useEffect(() => {
  //   if (LastMesListRef.current) {
  //     LastMesListRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //       inline: "nearest",
  //     });
  //   }
  // }, [currentMessage.id]);

  // ------ HANDLE SEND MESSAGE ------
  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleImageInput = (e) => {
    setImageUpload(e.target.files[0]);
    setPreviewImageInput(URL.createObjectURL(e.target.files[0]));
    inputRef.current.focus();
  };

  const sendMessage = (messText, messPhoto, fullPath = "") => {
    addDocument("messages", {
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
      const downloadUrl = uploadFile(imageUpload, `images/chat_room/${roomId}`);
      downloadUrl.then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          // Nếu có input value thì gửi cả ảnh và tin nhắn
          const trimInput = inputValue;
          if (trimInput.trim()) {
            // Gửi tin nhắn
            sendMessage(inputValue, "");
          }

          const fullPath = snapshot.metadata.fullPath;
          //Gửi ảnh
          sendMessage("Photo", url, fullPath);
        });
      });
    } else if (inputValue) {
      // Nếu chưa chọn ảnh thì gửi inputValue
      sendMessage(inputValue, "");
    }

    // Clear input and focus
    handleClearPreview();
    setInputValue("");
  };

  // Gửi riêng icon
  const handleSendIcon = (value) => {
    if (value) {
      sendMessage(value, "");
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

  // Xử lý các tin nhắn liền kề cùng 1 người gửi
  const sideBySideMessages = useMemo(() => {
    let newMessages = [...messages];
    if (newMessages.length >= 3) {
      for (let i = 0; i < newMessages.length; i++) {
        if (i === 0) {
          if (newMessages[i].uid === newMessages[i + 1].uid) {
            newMessages[i].type = "first-message";
          } else newMessages[i].type = "default";
        } else if (i === newMessages.length - 1) {
          if (newMessages[i].uid === newMessages[i - 1].uid) {
            newMessages[i].type = "last-message";
          } else newMessages[i].type = "default";
        } else {
          if (
            newMessages[i].uid === newMessages[i + 1].uid &&
            newMessages[i].uid === newMessages[i - 1].uid
          ) {
            newMessages[i].type = "middle-message";
          } else if (newMessages[i].uid === newMessages[i + 1].uid) {
            newMessages[i].type = "first-message";
          } else if (newMessages[i].uid === newMessages[i - 1].uid) {
            newMessages[i].type = "last-message";
          } else {
            newMessages[i].type = "default";
          }
        }
      }
    } else if (newMessages.length === 2) {
      if (newMessages[0].uid === newMessages[1].uid) {
        newMessages[0].type = "first-message";
        newMessages[1].type = "last-message";
      } else {
        newMessages[0].type = "default";
        newMessages[1].type = "default";
      }
    } else if (newMessages.length === 1) {
      newMessages[0].type = "default";
    }
    return newMessages;
  }, [messages]);

  // Cập nhật định dạng
  // useEffect(() => {
  //   messages.forEach((message) => {
  //     let messageRef = doc(db, "messages", message.id);
  //     updateDoc(messageRef, {
  //       fullPath: "",
  //     });
  //   });
  // }, [messages]);

  return (
    <>
      {selectedRoom && (
        <div className={cx("chat-window-wrapper")}>
          <div className={cx("chat-window", { fixed: isMobile })}>
            {/*=========== Header ===========*/}
            <div className={cx("chat-window_header")}>
              {/* Room Name And Image */}
              <div className={cx("chat-window_header-info")}>
                {isMobile ? (
                  <Link to={"/room-list"}>
                    <button
                      onClick={() => {
                        // Bỏ active room
                        setSelectedRoomId("");
                      }}
                      className={cx("back-btn")}
                    >
                      <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                  </Link>
                ) : (
                  false
                )}

                <img
                  src={selectedRoom.photoURL || placeHolderImg}
                  alt=""
                  className={cx("chat-window_header-img")}
                />
                <div className={cx("chat-window_header-name-wrap")}>
                  <h4 className={cx("chat-window_header-name")}>
                    {selectedRoom.name}
                  </h4>
                  <p className={cx("chat-desc")}>Đang hoạt động</p>
                </div>
              </div>

              {/* Invite Members And Room Controls */}
              <div className={cx("chat-window_header-users")}>
                <i
                  onClick={handleRoomMenuVisible}
                  className={cx("header-menu_icon")}
                >
                  <FontAwesomeIcon icon={faEllipsisH} />
                </i>
              </div>
            </div>

            {/*=========== Message List ===========*/}

            <div ref={mesListRef} className={cx("message-list")}>
              {sideBySideMessages.map((message) => (
                <Message
                  key={message.id}
                  id={message.id}
                  content={message.text}
                  displayName={message.displayName}
                  createAt={message.createAt}
                  photoURL={message.photoURL}
                  userId={message.uid}
                  type={message.type}
                  reactions={message.reactions}
                  messagePhotoURL={message.messagePhotoURL}
                />
              ))}

              <span ref={LastMesListRef}></span>
            </div>

            {/*=========== Message Form ===========*/}
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
                <button
                  onClick={() => {
                    imageInputRef.current.click();
                  }}
                  className={cx("media-btn")}
                >
                  <StickerIcon />
                </button>
                <button
                  onClick={() => {
                    imageInputRef.current.click();
                  }}
                  className={cx("media-btn")}
                >
                  <GifIcon />
                </button>
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
                  className={cx("message-form_input")}
                  type="text"
                  placeholder="Aa"
                  spellCheck="false"
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyUp={handleKeyUp}
                />
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
                    <img
                      className={cx("form-btn-image")}
                      src={hahaIcon}
                      alt=""
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
          {isRoomMenuVisible && (
            <div className={cx("room-option")}>
              <RoomOptions messages={messages} />
            </div>
          )}

          <CustomNickname />
          <ChangeRoomName />
        </div>
      )}
    </>
  );
}

export default memo(ChatWindow);
