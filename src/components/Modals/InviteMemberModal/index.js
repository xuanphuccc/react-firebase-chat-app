import classNames from "classnames/bind";
import styles from "./InviteMemberModal.module.scss";

import { useState, useContext, useEffect, useMemo, useRef } from "react";

import { AppContext } from "../../../Context/AppProvider";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";
import { AuthContext } from "../../../Context/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
const cx = classNames.bind(styles);

function InviteMemberModal() {
  const [inputValue, setInputValue] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const inputRef = useRef();

  const {
    isInviteMemberVisible,
    setIsInviteMemberVisible,
    selectedRoomId,
    users,
    members,
  } = useContext(AppContext);

  const { uid } = useContext(AuthContext);

  const originMemberId = useMemo(() => {
    return members.map((member) => member.uid);
  }, [members]);

  // Handle submit
  const handleOk = () => {
    if (selectedUsers.length >= 1) {
      // Set nick name cho những users được thêm
      const usersNickname = selectedUsers.map((id) => {
        let validUser = users.find((user) => user.uid === id);
        if (validUser) {
          return {
            uid: validUser.uid,
            nickname: validUser.displayName,
          };
        } else
          return {
            uid: "",
            nickname: "",
          };
      });

      const roomRef = doc(db, "rooms", selectedRoomId);
      updateDoc(roomRef, {
        // members: [...originMemberId, ...selectedUsers],
        members: arrayUnion(...selectedUsers),
        roomNicknames: arrayUnion(...usersNickname),
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

        <ul className={cx("users-list")}>
          {searchUsers.length > 0 ? (
            searchUsers.map((searchUser) => (
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
            ))
          ) : (
            <p className={cx("empty-user")}>Chưa chọn người dùng nào</p>
          )}
        </ul>
      </div>
    </Modal>
  );
}

export default InviteMemberModal;
