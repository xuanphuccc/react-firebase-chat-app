import classNames from "classnames/bind";
import styles from "./InviteMemberModal.module.scss";

import { useState, useContext, useEffect, useMemo, useRef } from "react";

import { AppContext } from "../../../Context/AppProvider";
// import { AuthContext } from "../../Context/AuthProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import Modal from "../Modal";
import { AuthContext } from "../../../Context/AuthProvider";
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

  // Khi click OK
  const handleOk = () => {
    const roomRef = doc(db, "rooms", selectedRoomId);

    if (selectedUsers.length >= 1) {
      updateDoc(roomRef, {
        members: [...originMemberId, ...selectedUsers],
      });
    }

    // Xóa selected users cũ
    setSelectedUsers([]);

    // Đóng modal và xóa input
    setIsInviteMemberVisible(false);
    setInputValue("");
  };

  // Khi click Cancel
  const handleCancel = () => {
    setInputValue("");
    setIsInviteMemberVisible(false);
  };

  // Tìm users khi nhập tên tìm kiếm
  useEffect(() => {
    if (users.length >= 1 && inputValue !== "") {
      let usersSearch = users.filter((member) => {
        let memberDisplayName = member.displayName.toLowerCase();
        let input = inputValue.toLowerCase();
        return (
          memberDisplayName.includes(input) &&
          member.uid !== uid &&
          !originMemberId.includes(member.uid)
        );
      });

      // Sắp xếp tăng dần theo ASCII
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

  // handle checked users
  const handleCheckedUsers = (id) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Focus input on open
  useEffect(() => {
    inputRef.current.focus();
  }, [isInviteMemberVisible]);

  return (
    <Modal
      title="Mời thêm thành viên"
      visible={isInviteMemberVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className={cx("wrapper")}>
        <div className={cx("input-wrap")}>
          <label className={cx("input-label")} htmlFor="">
            Tên
          </label>
          <input
            ref={inputRef}
            className={cx("input-box")}
            type="text"
            placeholder="Nhập tên bạn bè"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
          />
        </div>

        <ul className={cx("users-list")}>
          {searchUsers.map((searchUser) => (
            <li key={searchUser.uid} className={cx("user-item")}>
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
                onChange={() => {
                  handleCheckedUsers(searchUser.uid);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default InviteMemberModal;
