import classNames from "classnames/bind";
import style from "./ReactionsIcon.module.scss";

import heart from "../../../../assets/images/minicon/heart.png";
import haha from "../../../../assets/images/minicon/haha.png";
import wow from "../../../../assets/images/minicon/wow.png";
import sad from "../../../../assets/images/minicon/sad.png";
import angry from "../../../../assets/images/minicon/angry.png";
import like from "../../../../assets/images/minicon/like.png";
import { useMemo, useState } from "react";

const cx = classNames.bind(style);

function ReactionsIcon({ reactions }) {
  const [reactionsCount, setReactionsCount] = useState(0);

  const icons = useMemo(() => {
    return {
      heart,
      haha,
      wow,
      sad,
      angry,
      like,
    };
  }, []);

  const reactionIcons = useMemo(() => {
    let totalReactionsCount = 0;
    let renderArray = [];
    for (let type in reactions) {
      totalReactionsCount += reactions[type].length;
      if (reactions[type].length >= 1) {
        renderArray.push(
          <img key={type} className={cx("icon")} src={icons[type]} alt="" />
        );
      }
    }

    setReactionsCount(totalReactionsCount);
    return renderArray;
  }, [reactions, icons]);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("reaction-icons")}>
        {reactionIcons}
        {reactionsCount > 1 && (
          <p className={cx("icons-count")}>{reactionsCount}</p>
        )}
      </div>
    </div>
  );
}

export default ReactionsIcon;
