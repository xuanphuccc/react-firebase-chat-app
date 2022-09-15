import classNames from "classnames/bind";
import styles from "./ReactionsModal.module.scss";

import heart from "../../../assets/images/minicon/heart.png";
import haha from "../../../assets/images/minicon/haha.png";
import wow from "../../../assets/images/minicon/wow.png";
import sad from "../../../assets/images/minicon/sad.png";
import angry from "../../../assets/images/minicon/angry.png";
import like from "../../../assets/images/minicon/like.png";

import { AppContext } from "../../../Context/AppProvider";
import { useContext, useMemo } from "react";

import Modal from "../Modal";

const cx = classNames.bind(styles);

function ReactionsModal({ reactions, isVisible, handleVisible }) {
  const { members } = useContext(AppContext);

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

  // Render users thả cảm xúc
  const usersReaction = useMemo(() => {
    let totalReactions = [];

    for (let typeOfReaction in reactions) {
      let renderArray = [];
      if (reactions[typeOfReaction].length >= 1) {
        renderArray = reactions[typeOfReaction].map((userReactionId) => {
          let memberReaction = members.find(
            (member) => member.uid === userReactionId
          );

          return (
            <div key={userReactionId}>
              {memberReaction && (
                <li className={cx("user-item")}>
                  <div className={cx("user-info")}>
                    <img
                      className={cx("user-img")}
                      src={memberReaction.photoURL}
                      alt=""
                    />
                    <h4 className={cx("user-name")}>
                      {memberReaction.displayName}
                    </h4>
                  </div>
                  <img
                    className={cx("user-reaction")}
                    src={icons[typeOfReaction]}
                    alt=""
                  />
                </li>
              )}
            </div>
          );
        });
      }

      totalReactions = [...totalReactions, ...renderArray];
    }

    return totalReactions;
  }, [icons, members, reactions]);

  // Render các icon có người chọn
  const reactionTypeCount = useMemo(() => {
    const typeCount = [];

    for (let typeReaction in reactions) {
      if (reactions[typeReaction].length >= 1) {
        typeCount.push(
          <li key={typeReaction} className={cx("header-item")}>
            <img className={cx("item-img")} src={icons[typeReaction]} alt="" />
            <span className={cx("reaction-count")}>
              {reactions[typeReaction].length}
            </span>
          </li>
        );
      }
    }

    return typeCount;
  }, [reactions, icons]);

  return (
    <Modal
      title="Cảm xúc về tin nhắn"
      visible={isVisible}
      okButton={false}
      onCancel={handleVisible}
    >
      <div className={cx("reactions-modal")}>
        {/*====== Header ======*/}
        <div className={cx("header-wrap")}>
          <ul className={cx("header")}>
            <li className={cx("header-item", "all-reaction-item")}>
              Tất cả {usersReaction.length}
            </li>
            {reactionTypeCount}
          </ul>
          <div className={cx("line-wrap")}>
            <div className={cx("line")}></div>
          </div>
        </div>

        {/*====== Content ======*/}
        <div className={cx("content")}>
          <ul className={cx("users-list")}>{usersReaction}</ul>
        </div>
      </div>
    </Modal>
  );
}

export default ReactionsModal;
