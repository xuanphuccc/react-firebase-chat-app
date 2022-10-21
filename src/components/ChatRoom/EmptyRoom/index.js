import classNames from "classnames/bind";
import styles from "./EmptyRoom.module.scss";
import placeHolderImg from "../../../assets/images/user.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function EmptyRoom() {
  const { isMobile, setIsOpenSearchUsers } = useContext(AppContext);

  return (
    <div
      onClick={() => {
        setIsOpenSearchUsers(false);
      }}
      className={cx("empty-room")}
    >
      {isMobile && (
        <div className={cx("header")}>
          <Link className={cx("back-wrap")} to={"/room-list"}>
            <button className={cx("back-btn")}>
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
            <h6 className={cx("back-title")}>Quay lại</h6>
          </Link>
        </div>
      )}
      <div className={cx("wrapper")}>
        <img className={cx("img")} src={placeHolderImg} alt="" />
      </div>
    </div>
  );
}

export default EmptyRoom;
