import classNames from "classnames/bind";
import styles from "./ReactionsControl.module.scss";

import heart from "../../../assets/images/minicon/heart.png";
import haha from "../../../assets/images/minicon/haha.png";
import wow from "../../../assets/images/minicon/wow.png";
import sad from "../../../assets/images/minicon/sad.png";
import angry from "../../../assets/images/minicon/angry.png";
import like from "../../../assets/images/minicon/like.png";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import { useContext } from "react";

import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function ReactionsControl({
  id,
  reactions,
  activeIcon,
  setActiveIcon,
  setIsHasIcon,
}) {
  const { uid } = useContext(AuthContext);

  const listIcon = [
    { iconType: "heart", iconSrc: heart },
    { iconType: "haha", iconSrc: haha },
    { iconType: "wow", iconSrc: wow },
    { iconType: "sad", iconSrc: sad },
    { iconType: "angry", iconSrc: angry },
    { iconType: "like", iconSrc: like },
  ];

  function handleReaction(type) {
    const messageRef = doc(db, "messages", id);

    // Xóa icon người dùng hiện tại đã thả trước đó
    for (let reactionType in reactions) {
      if (reactions[reactionType].includes(uid)) {
        // Tìm vị trí UID trong mảng của reaction chứa UID
        // rồi thực hiện xóa UID đó
        let indexOfUid = reactions[reactionType].indexOf(uid);
        if (indexOfUid !== -1) {
          reactions[reactionType].splice(indexOfUid);
        }

        updateDoc(messageRef, {
          reactions: {
            ...reactions,
            [reactionType]: reactions[reactionType],
          },
        });
      }
    }

    // Thêm UID vào 1 reaction mới
    // Nếu trùng với icon đã active thì
    // không thực hiện thêm
    if (activeIcon !== type) {
      reactions[type].push(uid);
      updateDoc(messageRef, {
        reactions: {
          ...reactions,
          [type]: reactions[type],
        },
      });
    } else {
      setIsHasIcon(false);
      setActiveIcon("");
    }
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("reactions")}>
        {listIcon.map((icon, index) => (
          <img
            key={index}
            onClick={() => {
              handleReaction(icon.iconType);
            }}
            className={cx("item", {
              active: icon.iconType === activeIcon,
            })}
            src={icon.iconSrc}
            alt=""
          />
        ))}
      </div>
    </div>
  );
}

export default ReactionsControl;
