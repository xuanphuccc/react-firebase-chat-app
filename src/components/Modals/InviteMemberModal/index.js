import classNames from "classnames/bind";
import styles from "./InviteMemberModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useState, useContext, useEffect, useMemo, useRef } from "react";

import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";

const cx = classNames.bind(styles);

function InviteMemberModal() {
  const { uid } = useContext(AuthContext);
  const {
    isInviteMemberVisible,
    setIsInviteMemberVisible,
    selectedRoomId,
    users,
    members,
    sendMessage,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const inputRef = useRef();

  const originMemberId = useMemo(() => {
    return members.map((member) => member.uid);
  }, [members]);

  // Handle submit
  const handleOk = () => {
    if (selectedUsers.length >= 1) {
      // Set nick name cho những users được thêm
      let usersNickname = users.map((user) => {
        return (
          selectedUsers.includes(user.uid) && {
            uid: user.uid,
            nickname: "",
          }
        );
      });
      usersNickname = usersNickname.filter((user) => user !== false);

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        // members: [...originMemberId, ...selectedUsers],
        members: arrayUnion(...selectedUsers),
        roomNicknames: arrayUnion(...usersNickname),
        role: "group",
      }).then(() => {
        users.forEach((user) => {
          if (selectedUsers.includes(user.uid)) {
            const notifitext = `đã thêm ${user.displayName} vào nhóm`;
            sendMessage(notifitext, null, null, "@roomnotify");
          }
        });
      });
    }

    // Clear selected users
    setSelectedUsers([]);

    // Close modal and clear input
    setIsInviteMemberVisible(false);
    setInputValue("");
  };

  // Handle cancel
  const handleCancel = () => {
    setInputValue("");
    setIsInviteMemberVisible(false);
    setSelectedUsers([]);
  };

  // Find user when typing
  useEffect(() => {
    if (users.length > 1 && inputValue !== "" && originMemberId) {
      let usersSearch = users.filter((member) => {
        let memberDisplayName = member.displayName.toLowerCase();
        let input = inputValue.toLowerCase();
        return (
          memberDisplayName.includes(input) &&
          member.uid !== uid &&
          !originMemberId.includes(member.uid)
        );
      });

      // Sort ascending by ASCII
      for (let i = 0; i < usersSearch.length - 1; i++) {
        for (let j = i + 1; j < usersSearch.length; j++) {
          if (usersSearch[i].displayName > usersSearch[j].displayName) {
            let tmp = usersSearch[i];
            usersSearch[i] = usersSearch[j];
            usersSearch[j] = tmp;
          }
        }
      }
      setSearchUsers(usersSearch);
    } else {
      setSearchUsers([]);
    }
  }, [inputValue, users, originMemberId, uid]);

  // Handle select users
  const handleCheckedUsers = (id) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Render selected users
  const renderSelectedUsers = useMemo(() => {
    let validUsers;
    if (users && selectedUsers) {
      validUsers = users.map((user) => {
        return selectedUsers.includes(user.uid) && user;
      });
    }
    return validUsers.filter((user) => user !== false);
  }, [selectedUsers, users]);

  // Focus input when open
  useEffect(() => {
    inputRef.current.focus();
  }, [isInviteMemberVisible]);

  return (
    <Modal
      title="Thêm người"
      visible={isInviteMemberVisible}
      onOk={handleOk}
      OkTitle="Thêm người"
      onCancel={handleCancel}
    >
      <div className={cx("wrapper")}>
        {/* Input */}
        <div className={cx("input-wrap")}>
          <span className={cx("input-search-icon")}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            ref={inputRef}
            className={cx("input-box")}
            type="text"
            placeholder="Tìm kiếm"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
          />
        </div>

        {/* Choosing users */}
        <ul className={cx("users-choosing")}>
          {renderSelectedUsers.length > 0 ? (
            renderSelectedUsers.map((user) => (
              <li key={user.uid} className={cx("users-choosing_item")}>
                <div className={cx("user-img-wrap")}>
                  <img
                    className={cx("users-choosing_img")}
                    src={user.photoURL}
                    alt=""
                  />
                  <span
                    onClick={() => {
                      handleCheckedUsers(user.uid);
                    }}
                    className={cx("users-choosing_remove")}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </span>
                </div>
                <h4 className={cx("users-choosing_name")}>
                  {user.displayName}
                </h4>
              </li>
            ))
          ) : (
            <p className={cx("empty-user")}>Chưa chọn người dùng nào</p>
          )}
        </ul>

        {/* Search users */}
        <ul className={cx("users-list")}>
          {searchUsers.map((searchUser) => (
            <li
              key={searchUser.uid}
              onClick={() => {
                handleCheckedUsers(searchUser.uid);
              }}
              className={cx("user-item")}
            >
              <div className={cx("user-info")}>
                <img
                  className={cx("user-img")}
                  src={searchUser.photoURL}
                  alt=""
                />
                <h4 className={cx("user-name")}>{searchUser.displayName}</h4>
              </div>
              <input
                className={cx("choose-user")}
                type="checkbox"
                name=""
                id=""
                checked={selectedUsers.includes(searchUser.uid)}
                onChange={() => {}}
              />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default InviteMemberModal;
