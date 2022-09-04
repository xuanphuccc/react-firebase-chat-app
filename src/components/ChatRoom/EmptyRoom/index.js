import classNames from "classnames/bind";
import styles from "./EmptyRoom.module.scss";
import placeHolderImg from "../../../assets/images/user.png";

const cx = classNames.bind(styles);

function EmptyRoom() {
  return (
    <div className={cx("empty-room")}>
      <div className={cx("wrapper")}>
        <h4 className={cx("title")}>Bạn chưa chọn phòng</h4>
        <img className={cx("img")} src={placeHolderImg} alt="" />
      </div>
    </div>
  );
}

export default EmptyRoom;
