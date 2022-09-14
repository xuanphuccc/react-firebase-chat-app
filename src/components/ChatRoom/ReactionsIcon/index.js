import classNames from "classnames/bind";
import style from "./ReactionsIcon.module.scss";

import heart from "../../../assets/images/heart.png";
import haha from "../../../assets/images/haha.png";
import wow from "../../../assets/images/wow.png";
import sad from "../../../assets/images/sad.png";
import angry from "../../../assets/images/angry.png";
import like from "../../../assets/images/like.png";
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
    for (let type in reactions) {
      //   console.log("REACTION TYPE: ", type, reactions[type]);
      switch (type) {
        case "heart":
          if (reactions[type].length >= 1) {
            console.log("heart", reactions[type].length);
            setIsHeart(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;
        case "haha":
          if (reactions[type].length >= 1) {
            console.log("haha", reactions[type].length);
            setIsHaha(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;

        case "wow":
          if (reactions[type].length >= 1) {
            setIsWow(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;

        case "sad":
          if (reactions[type].length >= 1) {
            setIsSad(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;

        case "angry":
          if (reactions[type].length >= 1) {
            setIsAngry(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;

        case "like":
          if (reactions[type].length >= 1) {
            setIsLike(true);
            setReactionsCount((prev) => prev + reactions[type].length);
          }
          break;

        default:
      }
    }
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
