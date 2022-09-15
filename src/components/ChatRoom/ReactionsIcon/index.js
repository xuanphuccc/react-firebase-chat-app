import classNames from "classnames/bind";
import style from "./ReactionsIcon.module.scss";

import heart from "../../../assets/images/minicon/heart.png";
import haha from "../../../assets/images/minicon/haha.png";
import wow from "../../../assets/images/minicon/wow.png";
import sad from "../../../assets/images/minicon/sad.png";
import angry from "../../../assets/images/minicon/angry.png";
import like from "../../../assets/images/minicon/like.png";
import { useEffect, useState } from "react";

// import { useState } from "react";

const cx = classNames.bind(style);

function ReactionsIcon({ reactions }) {
  const [isHeart, setIsHeart] = useState(false);
  const [isHaha, setIsHaha] = useState(false);
  const [isWow, setIsWow] = useState(false);
  const [isSad, setIsSad] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(0);

  useEffect(() => {
    let totalReactionsCount = 0;
    for (let type in reactions) {
      //   console.log("REACTION TYPE: ", type, reactions[type]);
      totalReactionsCount += reactions[type].length;

      switch (type) {
        case "heart":
          if (reactions[type].length >= 1) {
            setIsHeart(true);
          } else {
            setIsHeart(false);
          }
          break;
        case "haha":
          if (reactions[type].length >= 1) {
            setIsHaha(true);
          } else {
            setIsHaha(false);
          }
          break;

        case "wow":
          if (reactions[type].length >= 1) {
            setIsWow(true);
          } else {
            setIsWow(false);
          }
          break;

        case "sad":
          if (reactions[type].length >= 1) {
            setIsSad(true);
          } else {
            setIsSad(false);
          }
          break;

        case "angry":
          if (reactions[type].length >= 1) {
            setIsAngry(true);
          } else {
            setIsAngry(false);
          }
          break;

        case "like":
          if (reactions[type].length >= 1) {
            setIsLike(true);
          } else {
            setIsLike(false);
          }
          break;

        default:
      }
    }

    setReactionsCount(totalReactionsCount);
  }, [reactions]);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("reaction-icons")}>
        {isHeart && <img className={cx("icon", "heart")} src={heart} alt="" />}
        {isHaha && <img className={cx("icon", "haha")} src={haha} alt="" />}
        {isWow && <img className={cx("icon", "wow")} src={wow} alt="" />}
        {isSad && <img className={cx("icon", "sad")} src={sad} alt="" />}
        {isAngry && <img className={cx("icon", "angry")} src={angry} alt="" />}
        {isLike && <img className={cx("icon", "like")} src={like} alt="" />}
        <p className={cx("icons-count")}>{reactionsCount}</p>
      </div>
    </div>
  );
}

export default ReactionsIcon;
