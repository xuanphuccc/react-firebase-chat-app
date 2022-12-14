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
  faSignature,
  faImage,
  faPen,
  faLink,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import classNames from "classnames/bind";
import styles from "./RoomOptions.module.scss";

import userPlaceHolderImg from "../../../assets/images/user.png";

import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
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
import { deleteFile, uploadFile } from "../../../firebase/service";

const cx = classNames.bind(styles);

function RoomOptions({ messages, activeTime }) {
  const {
    selectedRoom,
    selectedRoomId,
    members,
    setIsRoomMenuVisible,
    setIsInviteMemberVisible,
    isMobile,
    setIsOpenCustomNickname,
    setIsOpenChangeRoomName,
    setAlertVisible,
    setAlertContent,
    sendMessage,
    handleGenerateRoomName,
  } = useContext(AppContext);
  const [admins, setAdmins] = useState([]);
  const [visibleAdmin, setVisibleAdmin] = useState(false);
  const [isOpenMembersOptions, setIsOpenMembersOptions] = useState(false);
  const [isOpenMediaOptions, setIsOpenMediaOptions] = useState(false);
  const [isOpenPrivacyOptions, setIsOpenPrivacyOptions] = useState(false);
  const [isOpenCustomRoom, setIsOpenCustomRoom] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAcceptRoomLink, setIsAcceptRoomLink] = useState(false);

  const inputImageRef = useRef();
  const roomCodeInputRef = useRef();

  const navigate = useNavigate();

  const { uid } = useContext(AuthContext);

  // H??m x??? l?? m??? modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // ------ HANDLE LEAVE ROOM ------
  const handleLeaveRoom = () => {
    // X??a uid c???a ng?????i d??ng hi???n t???i
    // kh???i tr?????ng members c???a rooms
    if (admins.includes(uid) && admins.length === 1) {
      console.log("You are the only admin!!!");
    } else {
      // x??a nick name
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== uid
      );

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        members: arrayRemove(uid),
        roomNicknames: newRoomNicknames,
      }).then(() => {
        // N???u l?? admin v?? kh??ng l?? admin duy nh???t
        // th?? x??a vai tr?? admin
        handleRemoveAdmin(uid);

        // ????ng modal sau khi r???i ph??ng
        setIsRoomMenuVisible(false);

        // Chuy???n v??? sidebar (mobile)
        if (isMobile) {
          navigate("/room-list");
        } else navigate("/room/room-id");

        sendMessage("???? r???i kh???i nh??m", null, null, "@roomnotify");
      });
    }
  };

  // ------ HANDLE DELETE ROOM ------
  // X??? l?? x??a ph??ng hi???n t???i
  // v?? to??n b??? tin nh???n c???a ph??ng
  const handleDeleteRoom = () => {
    if (admins.includes(uid) && members.length === 1 && messages) {
      // X??a to??n b??? tin nh???n c???a ph??ng b??? x??a
      messages.forEach((message) => {
        deleteDoc(doc(db, "messages", message.id));
        // X??a ???nh tin nh???n tham chi???u
        if (message.fullPath !== "") {
          deleteFile(message.fullPath);
        }
      });

      // X??a ph??ng hi???n t???i
      deleteDoc(doc(db, "rooms", selectedRoomId));
      // X??a avatar
      if (selectedRoom.fullPath !== "") {
        deleteFile(selectedRoom.fullPath);
      }

      // Chuy???n v??? sidebar (mobile)
      if (isMobile) {
        navigate("/room-list");
      } else navigate("/room/room-id");
    }
  };

  // ------ HANDLE ADMINS CONTROLS ------
  // Check selectedRoom c?? t???n t???i hay kh??ng
  useEffect(() => {
    let roomAdmin = selectedRoom;
    if (!roomAdmin) {
      roomAdmin = {
        admins: [],
      };
    }

    setAdmins(roomAdmin.admins);
  }, [selectedRoom, visibleAdmin]);

  // X??? l?? th??m admin
  const handleAddAdmin = (userId, userName) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        admins: arrayUnion(userId),
      }).then(() => {
        sendMessage(
          `???? ch??? ?????nh ${userName} l??m qu???n tr??? vi??n`,
          null,
          null,
          "@roomnotify"
        );
      });

      // C?? t??c d???ng c???p nh???t hi???n th??? l??n admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  // X??? l?? X??a admin
  const handleRemoveAdmin = (userId) => {
    if (admins.includes(uid)) {
      const roomRef = doc(db, "rooms", selectedRoomId);

      // N???u ng?????i d??ng l?? admin duy nh???t th?? kh??ng ???????c x??a
      // vai tr?? c???a m??nh
      if (userId === uid && admins.length === 1) {
        console.log("You are the only admin!!!");
      } else {
        updateDoc(roomRef, {
          admins: arrayRemove(userId),
        });
      }

      // C?? t??c d???ng c???p nh???t hi???n th??? l??n admin
      setVisibleAdmin(!visibleAdmin);
    }
  };

  // ------ HANDLE REMOVE MEMBER ------
  const handleRemoveMember = (member) => {
    const { uid: userId, displayName } = member;

    // N???u ng?????i x??a l?? admin v?? kh??ng ph???i x??a ch??nh m??nh
    if (admins.includes(uid) && userId !== uid) {
      // x??a nick name
      const newRoomNicknames = selectedRoom.roomNicknames.filter(
        (nickname) => nickname.uid !== userId
      );

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        members: arrayRemove(userId),
        roomNicknames: newRoomNicknames,
      }).then(() => {
        // Send notifi message
        const notifitext = `???? x??a ${displayName} kh???i nh??m`;
        sendMessage(notifitext, null, null, "@roomnotify");
      });
    }
  };

  // Handle update room image
  const handleChangeRoomImage = (e) => {
    const uploadPhoto = e.target.files[0];

    if (uploadPhoto) {
      if (uploadPhoto.size <= 3000000) {
        // Delete old file from storage
        if (selectedRoom.fullPath !== "") {
          deleteFile(selectedRoom.fullPath);
        }

        // Upload new file
        uploadFile(
          uploadPhoto,
          `images/rooms_avatar/${selectedRoomId}`,
          (url, fullPath) => {
            const roomRef = doc(db, "rooms", selectedRoomId);
            updateDoc(roomRef, {
              photoURL: url,
              fullPath: fullPath,
            }).then(() => {
              sendMessage("???? thay ?????i ???nh nh??m", null, null, "@roomnotify");
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

    // ????ng modal v?? x??a input
    inputImageRef.current.value = "";
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    roomCodeInputRef.current.select();
    roomCodeInputRef.current.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(roomCodeInputRef.current.value);

    roomCodeInputRef.current.focus();
    setIsCopied(true);
  };

  // Handle accept room link or not
  useEffect(() => {
    if (selectedRoom) {
      setIsAcceptRoomLink(selectedRoom.isAcceptLink);
    }
  }, [selectedRoom]);

  const handleToggleAcceptLink = () => {
    setIsAcceptRoomLink(!isAcceptRoomLink);

    const roomRef = doc(db, "rooms", selectedRoomId);
    updateDoc(roomRef, {
      isAcceptLink: !isAcceptRoomLink,
    });
  };

  return (
    <>
      {selectedRoom && (
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
                src={
                  handleGenerateRoomName(selectedRoom).photoURL ||
                  userPlaceHolderImg
                }
                alt=""
              />
            </div>
            <h2 className={cx("room-name")}>
              {handleGenerateRoomName(selectedRoom).name}
            </h2>
            <p className={cx("room-desc")}>{activeTime}</p>
            <ul className={cx("quick-options")}>
              <li className={cx("quick-item")}>
                <span className={cx("quick-icon")}>
                  <FontAwesomeIcon icon={faBellSlash} />
                </span>
                <span className={cx("quick-name")}>B???t l???i</span>
              </li>
              <li className={cx("quick-item")}>
                <span className={cx("quick-icon")}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <span className={cx("quick-name")}>T??m ki???m</span>
              </li>
            </ul>
          </div>

          {/* Room Options */}
          <ul className={cx("options-types")}>
            {/*====== Custom Room Options ======*/}
            <li className={cx("type-item", { open: isOpenCustomRoom })}>
              <h4
                onClick={() => {
                  setIsOpenCustomRoom(!isOpenCustomRoom);
                }}
                className={cx("type-name")}
              >
                T??y ch???nh ??o???n chat
                <span className={cx("type-icon")}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </h4>

              <ul className={cx("type-wrap", { open: isOpenCustomRoom })}>
                {/* Change Room name */}
                <li
                  onClick={() => {
                    setIsOpenChangeRoomName(true);
                  }}
                  className={cx("option-item")}
                >
                  <span className={cx("option-icon")}>
                    <FontAwesomeIcon icon={faPen} />
                  </span>
                  <h5 className={cx("option-name")}>?????i t??n ??o???n chat</h5>
                </li>

                {/* Change Room Image */}
                <li
                  onClick={() => {
                    inputImageRef.current.click();
                  }}
                  className={cx("option-item")}
                >
                  <input
                    ref={inputImageRef}
                    style={{ display: "none" }}
                    type="file"
                    onChange={handleChangeRoomImage}
                    accept="image/*"
                    name=""
                    id=""
                  />
                  <span className={cx("option-icon")}>
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                  <h5 className={cx("option-name")}>Thay ?????i ???nh</h5>
                </li>

                {/* Custom Nickname */}
                <li
                  onClick={() => {
                    setIsOpenCustomNickname(true);
                  }}
                  className={cx("option-item")}
                >
                  <span className={cx("option-icon")}>
                    <FontAwesomeIcon icon={faSignature} />
                  </span>
                  <h5 className={cx("option-name")}>Ch???nh s???a bi???t danh</h5>
                </li>
              </ul>
            </li>

            {/*====== Member Options ======*/}
            <li className={cx("type-item", { open: isOpenMembersOptions })}>
              <h4
                onClick={() => {
                  setIsOpenMembersOptions(!isOpenMembersOptions);
                }}
                className={cx("type-name")}
              >
                Th??nh vi??n ??o???n chat &#40;{members.length}&#41;
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
                  <li
                    key={member.uid}
                    className={cx("option-item", "user-option")}
                  >
                    <div className={cx("user-info")}>
                      <img
                        className={cx("user-img")}
                        src={member.photoURL}
                        alt=""
                      />
                      <h4 className={cx("user-name")}>
                        {member.displayName}
                        {admins.includes(member.uid) && (
                          <span className={cx("user-desc")}>Qu???n tr??? vi??n</span>
                        )}
                      </h4>
                    </div>
                    <Tippy
                      interactive="true"
                      trigger="click"
                      content={
                        <ul className={cx("tooltips-menu")}>
                          {admins.includes(member.uid) ? (
                            <li
                              onClick={() => {
                                handleRemoveAdmin(member.uid);
                              }}
                              className={cx("tooltips-menu-item")}
                            >
                              <span className={cx("tooltips-menu-icon")}>
                                <FontAwesomeIcon icon={faShieldHalved} />
                              </span>
                              X??a t?? c??ch qu???n tr??? vi??n
                            </li>
                          ) : (
                            <li
                              onClick={() => {
                                handleAddAdmin(member.uid, member.displayName);
                              }}
                              className={cx("tooltips-menu-item")}
                            >
                              <span className={cx("tooltips-menu-icon")}>
                                <FontAwesomeIcon icon={faShield} />
                              </span>
                              Ch??? ?????nh l??m qu???n tr??? vi??n
                            </li>
                          )}
                          <li
                            onClick={() => {
                              handleRemoveMember(member);
                            }}
                            className={cx("tooltips-menu-item")}
                          >
                            <span className={cx("tooltips-menu-icon")}>
                              <FontAwesomeIcon icon={faCommentSlash} />
                            </span>
                            X??a th??nh vi??n
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
                <li
                  onClick={handleInviteMemberModal}
                  className={cx("option-item")}
                >
                  <span className={cx("option-icon", "add-members-btn")}>
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                  <h4 className={cx("option-name")}>Th??m ng?????i</h4>
                </li>
                <InviteMemberModal />
              </ul>
            </li>

            {/*====== File Options ======*/}
            <li className={cx("type-item", { open: isOpenMediaOptions })}>
              <h4
                onClick={() => {
                  setIsOpenMediaOptions(!isOpenMediaOptions);
                }}
                className={cx("type-name")}
              >
                File ph????ng ti???n
                <span className={cx("type-icon")}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </h4>

              <ul className={cx("type-wrap", { open: isOpenMediaOptions })}>
                <li
                  onClick={() => {
                    navigate("/chat-media");
                  }}
                  className={cx("option-item")}
                >
                  <span className={cx("option-icon")}>
                    <FontAwesomeIcon icon={faImages} />
                  </span>
                  <h5 className={cx("option-name")}>File ph????ng ti???n</h5>
                </li>
              </ul>
            </li>

            {/*====== Privacy Options ======*/}
            <li className={cx("type-item", { open: isOpenPrivacyOptions })}>
              <h4
                onClick={() => {
                  setIsOpenPrivacyOptions(!isOpenPrivacyOptions);
                }}
                className={cx("type-name")}
              >
                Quy???n ri??ng t?? v?? h??? tr???
                <span className={cx("type-icon")}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </h4>

              <ul
                className={cx("type-wrap", "privacy-list", {
                  open: isOpenPrivacyOptions,
                })}
              >
                <Tippy
                  interactive="true"
                  trigger="click"
                  content={
                    <ul className={cx("tooltips-menu")}>
                      <div
                        onMouseDown={handleCopy}
                        onMouseOut={() => {
                          setIsCopied(false);
                        }}
                        className={cx("room-code_input-wrap")}
                        title="copy"
                      >
                        <input
                          ref={roomCodeInputRef}
                          className={cx("room-code_input")}
                          type="text"
                          value={`${window.location.protocol}//${window.location.hostname}/p/${selectedRoomId}`}
                          disabled
                          name=""
                          id=""
                          title="copy"
                        />
                        <span className={cx("room-code_copy-icon")}>
                          {isCopied ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </span>
                      </div>

                      <div className={cx("room-code_checkbox-wrap")}>
                        <input
                          className={cx("room-code_checkbox")}
                          onChange={handleToggleAcceptLink}
                          checked={isAcceptRoomLink === true}
                          type="checkbox"
                          name=""
                          id="room-code-checkbox"
                        />
                        <label
                          className={cx("room-code_checkbox-label")}
                          htmlFor="room-code-checkbox"
                        >
                          Cho ph??p tham gia nh??m b???ng li??n k???t
                        </label>
                      </div>
                    </ul>
                  }
                >
                  <li className={cx("option-item")}>
                    <span className={cx("option-icon")}>
                      <FontAwesomeIcon icon={faLink} />
                    </span>
                    <h5 className={cx("option-name")}>
                      Li??n k???t tham gia nh??m
                    </h5>
                  </li>
                </Tippy>

                {members.length > 1 && (
                  <li onClick={handleLeaveRoom} className={cx("option-item")}>
                    <span className={cx("option-icon")}>
                      <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    </span>
                    <h5 className={cx("option-name")}>R???i kh???i nh??m</h5>
                  </li>
                )}

                {members.length === 1 && (
                  <li onClick={handleDeleteRoom} className={cx("option-item")}>
                    <span className={cx("option-icon")}>
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                    <h5 className={cx("option-name")}>X??a ??o???n chat</h5>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default RoomOptions;
