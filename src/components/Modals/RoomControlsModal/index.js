import classNames from "classnames/bind";
import styles from "./RoomControlsModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faCrown,
  faPersonWalkingArrowRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import {
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

import BasicModal from "../BasicModal";

const cx = classNames.bind(styles);

function RoomControlsModal({ children }) {
  const [admins, setAdmins] = useState([]);
  const [visibleAdmin, setVisibleAdmin] = useState(false);
  const [isOnlyAdmin, setIsOnlyAdmin] = useState(false);

  const navigate = useNavigate();

  const {
    selectedRoom,
    selectedRoomId,
    members,
    messages,
    isRoomMenuVisible,
    setIsRoomMenuVisible,
    handleRoomMenuVisible,
  } = useContext(AppContext);

  const { uid } = useContext(AuthContext);

  // ------ HANDLE LEAVE ROOM ------
  const handleLeaveRoom = () => {
    // Xóa uid của người dùng hiện tại
    // khỏi trường members của rooms
    if (admins.includes(uid) && admins.length === 1) {
      console.log("You are the only admin!!!");
      setIsOnlyAdmin(true);
    } else {
      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        members: arrayRemove(uid),
      });

      // Nếu là admin và không là admin duy nhất
      // thì xóa vai trò admin
      handleRemoveAdmin(uid);

      // Đóng modal sau khi rời phòng
      setIsRoomMenuVisible(false);
      console.log("Leave Room!");

      // Chuyển về sidebar (mobile)
      navigate("/room-list");
    }
  };

  // ------ HANDLE ADMINS CONTROLS ------
  // Check selectedRoom có tồn tại hay không
  useEffect(() => {
    let roomAdmin = selectedRoom;
    if (!roomAdmin) {
      roomAdmin = {
        admins: [],
      };
    }

    setAdmins(roomAdmin.admins);
  }, [selectedRoom, visibleAdmin]);

  // Xử lý xóa phòng hiện tại
  // và toàn bộ tin nhắn của phòng
  const handleDeleteRoom = () => {
    if (admins.includes(uid)) {
      // Xóa toàn bộ tin nhắn của phòng bị xóa
      messages.forEach((message) => {
        deleteDoc(doc(db, "messages", message.id));
      });

      // Xóa phòng hiện tại
      deleteDoc(doc(db, "rooms", selectedRoomId));

      // Chuyển về sidebar (mobile)
      navigate("/room-list");
    }
  };

  // Xử lý thêm admin
  const handleAddAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      updateDoc(roomRef, {
        admins: arrayUnion(userId),
      });

      // Có tác dụng cập nhật hiển thị lên admin
      setVisibleAdmin(!visibleAdmin);

      // Sau khi thêm admin thì chuyển trạng thái
      // only admin thành false
      setIsOnlyAdmin(false);
    }
  };

  // Xử lý Xóa admin
  const handleRemoveAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      // Nếu người dùng là admin duy nhất thì không được xóa
      // vai trò của mình
      if (userId === uid && admins.length === 1) {
        console.log("You are the only admin!!!");
        setIsOnlyAdmin(true);
      } else {
        updateDoc(roomRef, {
          admins: arrayRemove(userId),
        });
      }

      // Có tác dụng cập nhật hiển thị lên admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  return (
    <div>
      <BasicModal
        isVisible={isRoomMenuVisible}
        handleVisible={handleRoomMenuVisible}
        title="Thông tin phòng"
        modal={
          <div className={cx("wrapper")}>
            <div className={cx("room-code-wrap")}>
              <h4 className={cx("room-code-title")}>Mã phòng</h4>
              <p className={cx("room-code")}>{selectedRoomId}</p>
            </div>
            <p className={cx("q-and-a")}>
              <span className={cx("q-and-a-title")}>Admin</span>
              <FontAwesomeIcon icon={faCrown} />
            </p>

            {/* Controls participants */}
            <div className={cx("participants-wrapper")}>
              {members.map((member) => (
                <div key={member.id}>
                  <Tippy
                    placement="bottom"
                    content={
                      <div className={cx("participant_name")}>
                        {member.displayName}
                      </div>
                    }
                  >
                    <div
                      className={cx("participant_wrap", {
                        admin: admins.includes(member.uid),
                      })}
                    >
                      <img
                        key={member.uid}
                        className={cx("participant_img")}
                        src={member.photoURL}
                        alt=""
                      />
                      <i
                        className={cx("admin-icon", {
                          disable: isOnlyAdmin,
                        })}
                      >
                        <i
                          onClick={() => {
                            handleRemoveAdmin(member.uid);
                          }}
                        >
                          <FontAwesomeIcon
                            className={cx("inner-icon-true")}
                            icon={faCrown}
                          />
                        </i>

                        {/* Hiện icon nếu là admin */}
                        {admins.includes(uid) ? (
                          <i
                            onClick={() => {
                              handleAddAdmin(member.uid);
                            }}
                          >
                            <FontAwesomeIcon
                              className={cx("inner-icon-false")}
                              icon={faCirclePlus}
                            />
                          </i>
                        ) : (
                          ""
                        )}
                      </i>
                    </div>
                  </Tippy>
                </div>
              ))}
            </div>

            {/* Room Control Buttons */}
            <div className={cx("room-control")}>
              <button
                onClick={handleLeaveRoom}
                className={cx("room-control-btn", "leave-room-btn", {
                  disable: isOnlyAdmin,
                })}
              >
                <div className={cx("btn-content")}>
                  <span>Rời phòng</span>
                  <i className={cx("room-control-icon")}>
                    <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                  </i>
                </div>
                <div className={cx("disable-message")}>
                  <p className={cx("title")}>Bạn là admin duy nhất!</p>
                  <p className={cx("content")}>
                    Vui lòng chuyển vị trí admin cho những người khác trước khi
                    rời phòng
                  </p>
                </div>
              </button>
            </div>
            {admins.includes(uid) ? (
              <div className={cx("room-control")}>
                <button
                  onClick={handleDeleteRoom}
                  className={cx("room-control-btn")}
                >
                  <span>Xóa phòng</span>
                  <i className={cx("room-control-icon")}>
                    <FontAwesomeIcon icon={faTrash} />
                  </i>
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        }
      >
        {children}
      </BasicModal>{" "}
    </div>
  );
}

export default RoomControlsModal;
