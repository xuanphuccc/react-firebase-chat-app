import {
  faArrowRightFromBracket,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import { signOut } from "firebase/auth";
import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { auth } from "../../../firebase/config";
import Modal from "../Modal";
import styles from "./UserOption.module.scss";

const cx = classNames.bind(styles);

function UserOption({ visible = false, setVisible }) {
  const { currentUser } = useContext(AppContext);

  // Xử lý Sign Out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Modal
      onCancel={() => {
        setVisible(false);
      }}
      title="Tùy chọn"
      okButton={false}
      visible={visible}
    >
      <div className={cx("wrapper")}>
        <div className={cx("section", "no-boder")}>
          <h2 className={cx("section-name")}>Tài khoản</h2>
          <ul className={cx("option-list")}>
            <li className={cx("option-item")}>
              {currentUser && (
                <>
                  <img
                    className={cx("user-img")}
                    src={currentUser.photoURL}
                    alt=""
                  />
                  <h3 className={cx("user-name")}>
                    {currentUser.displayName}
                    <span className={cx("user-name-label")}>
                      Sửa thông tin của bạn
                    </span>
                  </h3>
                </>
              )}
            </li>
          </ul>
        </div>

        <div className={cx("section")}>
          <ul className={cx("option-list")}>
            <li className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faCircle} />
              </span>
              <h4 className={cx("option-name")}>
                Trạng thái hoạt động: ĐANG BẬT
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
              <h4 className={cx("option-name")}>Đăng xuất</h4>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default UserOption;
