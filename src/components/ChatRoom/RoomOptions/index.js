import {
  faArrowRightFromBracket,
  faBellSlash,
  faChevronLeft,
  faChevronRight,
  faCommentSlash,
  faEllipsis,
  faMagnifyingGlass,
  faPlus,
  faShield,
  faShieldHalved,
  faTrash,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import classNames from "classnames/bind";
import styles from "./RoomOptions.module.scss";

import userPlaceHolderImg from "../../../assets/images/user.png";

import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import InviteMemberModal from "../../Modals/InviteMemberModal";

import {
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";

import { db } from "../../../firebase/config";
import { deleteFile } from "../../../firebase/service";

const cx = classNames.bind(styles);

function RoomOptions({ messages }) {
  const [admins, setAdmins] = useState([]);
  const [visibleAdmin, setVisibleAdmin] = useState(false);
  const [isOnlyAdmin, setIsOnlyAdmin] = useState(false);
  const [isOpenMembersOptions, setIsOpenMembersOptions] = useState(false);
  const [isOpenMediaOptions, setIsOpenMediaOptions] = useState(false);
  const [isOpenPrivacyOptions, setIsOpenPrivacyOptions] = useState(false);

  const navigate = useNavigate();

  const {
    selectedRoom,
    selectedRoomId,
    members,
    setIsRoomMenuVisible,
    setIsInviteMemberVisible,
    isMobile,
  } = useContext(AppContext);

  const { uid } = useContext(AuthContext);

  // Hàm xử lý mở modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // ------ HANDLE LEAVE ROOM ------
  const handleLeaveRoom = () => {
    // Xóa uid của người dùng hiện tại
    // khỏi trường members của rooms
    if (admins.includes(uid) && admins.length === 1) {
      console.log("You are the only admin!!!");
      setIsOnlyAdmin(true);
    } else {
      // xóa nick name
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== uid
      );

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        members: arrayRemove(uid),
        roomNicknames: newRoomNicknames,
      });

      // Nếu là admin và không là admin duy nhất
      // thì xóa vai trò admin
      handleRemoveAdmin(uid);

      // Đóng modal sau khi rời phòng
      setIsRoomMenuVisible(false);
      console.log("Leave Room!");

      // Chuyển về sidebar (mobile)
      if (isMobile) {
        navigate("/room-list");
      } else navigate("/room/room-id");
    }
  };

  // ------ HANDLE DELETE ROOM ------
  // Xử lý xóa phòng hiện tại
  // và toàn bộ tin nhắn của phòng
  // DONE
  const handleDeleteRoom = () => {
    if (admins.includes(uid) && messages) {
      // Xóa toàn bộ tin nhắn của phòng bị xóa
      messages.forEach((message) => {
        deleteDoc(doc(db, "messages", message.id));
        // Xóa ảnh tin nhắn tham chiếu
        if (message.fullPath !== "") {
          deleteFile(message.fullPath);
        }
      });

      // Xóa phòng hiện tại
      deleteDoc(doc(db, "rooms", selectedRoomId));
      // Xóa avatar
      if (selectedRoom.fullPath !== "") {
        deleteFile(selectedRoom.fullPath);
      }

      // Chuyển về sidebar (mobile)
      if (isMobile) {
        navigate("/room-list");
      } else navigate("/room/room-id");
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
    console.log("is only admin: ", isOnlyAdmin);
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

  // ------ HANDLE REMOVE MEMBER ------
  const handleRemoveMember = (userId) => {
    // Nếu người xóa là admin và không phải xóa chính mình
    if (admins.includes(uid) && userId !== uid) {
      // xóa nick name
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== userId
      );

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        members: arrayRemove(userId),
        roomNicknames: newRoomNicknames,
      });
    }
  };

  return (
    <div className={cx("wrapper", { isMobile: isMobile })}>
      {isMobile && (
        <button
          onClick={() => {
            setIsRoomMenuVisible(false);
          }}
          className={cx("mobile-back-btn")}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <div className={cx("room-info-wrap")}>
        <div className={cx("room-img-wrap")}>
          <img
            className={cx("room-img")}
            src={selectedRoom.photoURL || userPlaceHolderImg}
            alt=""
          />
        </div>
        <h2 className={cx("room-name")}>{selectedRoom.name}</h2>
        <p className={cx("room-desc")}>Đang hoạt động</p>
        <ul className={cx("quick-options")}>
          <li className={cx("quick-item")}>
            <span className={cx("quick-icon")}>
              <FontAwesomeIcon icon={faBellSlash} />
            </span>
            <span className={cx("quick-name")}>Bật lại</span>
          </li>
          <li className={cx("quick-item")}>
            <span className={cx("quick-icon")}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <span className={cx("quick-name")}>Tìm kiếm</span>
          </li>
        </ul>
      </div>

      {/* Room Options */}
      <ul className={cx("options-types")}>
        <li className={cx("type-item")}>
          <h4 className={cx("type-name")}>
            Tùy chỉnh đoạn chat
            <span className={cx("type-icon")}>
              <FontAwesomeIcon icon={faChevronRight} />
            </span>
          </h4>

          <ul className={cx("type-wrap")}></ul>
        </li>

        {/*====== Member Options ======*/}
        <li className={cx("type-item")}>
          <h4
            onClick={() => {
              setIsOpenMembersOptions(!isOpenMembersOptions);
            }}
            className={cx("type-name")}
          >
            Thành viên đoạn chat &#40;{members.length}&#41;
            <span className={cx("type-icon")}>
              <FontAwesomeIcon icon={faChevronRight} />
            </span>
          </h4>

          <ul
            className={cx("type-wrap", {
              open: isOpenMembersOptions,
            })}
          >
            {members.map((member) => (
              <li key={member.uid} className={cx("option-item", "user-option")}>
                <div className={cx("user-info")}>
                  <img
                    className={cx("user-img")}
                    src={member.photoURL}
                    alt=""
                  />
                  <h4 className={cx("user-name")}>
                    {member.displayName}
                    {admins.includes(member.uid) && (
                      <span className={cx("user-desc")}>Quản trị viên</span>
                    )}
                  </h4>
                </div>
                <Tippy
                  interactive="true"
                  trigger="click"
                  content={
                    <ul className={cx("member-menu")}>
                      {admins.includes(member.uid) ? (
                        <li
                          onClick={() => {
                            handleRemoveAdmin(member.uid);
                          }}
                          className={cx("member-menu-item")}
                        >
                          <span className={cx("member-menu-icon")}>
                            <FontAwesomeIcon icon={faShieldHalved} />
                          </span>
                          Xóa tư cách quản trị viên
                        </li>
                      ) : (
                        <li
                          onClick={() => {
                            handleAddAdmin(member.uid);
                          }}
                          className={cx("member-menu-item")}
                        >
                          <span className={cx("member-menu-icon")}>
                            <FontAwesomeIcon icon={faShield} />
                          </span>
                          Chỉ định làm quản trị viên
                        </li>
                      )}
                      <li
                        onClick={() => {
                          handleRemoveMember(member.uid);
                        }}
                        className={cx("member-menu-item")}
                      >
                        <span className={cx("member-menu-icon")}>
                          <FontAwesomeIcon icon={faCommentSlash} />
                        </span>
                        Xóa thành viên
                      </li>
                    </ul>
                  }
                >
                  <span className={cx("user-option-icon")}>
                    <FontAwesomeIcon icon={faEllipsis} />
                  </span>
                </Tippy>
              </li>
            ))}

            {/* Add Members */}
            <li onClick={handleInviteMemberModal} className={cx("option-item")}>
              <span className={cx("option-icon", "add-members-btn")}>
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <h4 className={cx("option-name")}>Thêm người</h4>
            </li>
            <InviteMemberModal />
          </ul>
        </li>

        {/*====== File Options ======*/}
        <li className={cx("type-item")}>
          <h4
            onClick={() => {
              setIsOpenMediaOptions(!isOpenMediaOptions);
            }}
            className={cx("type-name")}
          >
            File phương tiện
            <span className={cx("type-icon")}>
              <FontAwesomeIcon icon={faChevronRight} />
            </span>
          </h4>

          <ul className={cx("type-wrap", { open: isOpenMediaOptions })}>
            <li className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faImages} />
              </span>
              <h5 className={cx("option-name")}>File phương tiện</h5>
            </li>
          </ul>
        </li>

        {/*====== Privacy Options ======*/}
        <li className={cx("type-item")}>
          <h4
            onClick={() => {
              setIsOpenPrivacyOptions(!isOpenPrivacyOptions);
            }}
            className={cx("type-name")}
          >
            Quyền riêng tư và hỗ trợ
            <span className={cx("type-icon")}>
              <FontAwesomeIcon icon={faChevronRight} />
            </span>
          </h4>

          <ul
            className={cx("type-wrap", "privacy-list", {
              open: isOpenPrivacyOptions,
            })}
          >
            <li onClick={handleLeaveRoom} className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </span>
              <h5 className={cx("option-name")}>Rời khỏi nhóm</h5>
            </li>
            <li onClick={handleDeleteRoom} className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <h5 className={cx("option-name")}>Xóa nhóm</h5>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default RoomOptions;
