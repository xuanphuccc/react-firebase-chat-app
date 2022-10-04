import classNames from "classnames/bind";
import styles from "./SearchUsers.module.scss";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function SearchUsers({ inputValue, setInputValue }) {
  const { uid } = useContext(AuthContext);
  const { isMobile, users } = useContext(AppContext);
  const [searchingUsers, setSearchingUsers] = useState([]);

  useEffect(() => {
    if (users.length > 1 && inputValue.trim() !== "") {
      const searching = users.filter((user) => {
        const input = inputValue.toLowerCase();
        const userName = user.displayName.toLowerCase();
        return userName.includes(input) && user.uid !== uid;
      });

      // Sort ascending by ASCII
      for (let i = 0; i < searching.length - 1; i++) {
        for (let j = i + 1; j < searching.length; j++) {
          if (searching[i].displayName > searching[j].displayName) {
            let tmp = searching[i];
            searching[i] = searching[j];
            searching[j] = tmp;
          }
        }
      }
      setSearchingUsers(searching);
    } else {
      setSearchingUsers([]);
    }
  }, [inputValue, users, uid]);

  return (
    <div className={cx("wrapper", { isMobile })}>
      <ul className={cx("users-list")}>
        <li className={cx("users-list_item")}>
          <span className={cx("users-list_item-icon")}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <h6 className={cx("users-list_item-name")}>
            Tìm tin nhắn chứa '{inputValue}'
          </h6>
        </li>
        {searchingUsers.map((user) => (
          <li key={user.uid} className={cx("users-list_item")}>
            <div className={cx("users-list_item-infor")}>
              <img
                className={cx("users-list_item-img")}
                src={user.photoURL}
                alt=""
              />
              <h4 className={cx("users-list_item-name")}>{user.displayName}</h4>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchUsers;
