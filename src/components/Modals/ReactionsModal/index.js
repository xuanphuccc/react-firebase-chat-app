import classNames from "classnames/bind";
import styles from "./ReactionsModal.module.scss";

import heart from "../../../assets/images/minicon/heart.png";
import haha from "../../../assets/images/minicon/haha.png";
import wow from "../../../assets/images/minicon/wow.png";
import sad from "../../../assets/images/minicon/sad.png";
import angry from "../../../assets/images/minicon/angry.png";
import like from "../../../assets/images/minicon/like.png";

import { AppContext } from "../../../Context/AppProvider";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import Modal from "../Modal";

const cx = classNames.bind(styles);

function ReactionsModal({ reactions, isVisible, handleVisible }) {
  const { members, isMobile } = useContext(AppContext);
  const [itemIcon, setItemIcon] = useState("allReactions");
  const [lineStyle, setLineStyle] = useState();
  const allReactionRef = useRef();

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
  const usersReactions = useMemo(() => {
    let totalReactions = {};
    let allReactions = [];

    if (Object.keys(reactions).length) {
      for (let typeOfReaction in reactions) {
        // Lấy tất cả user có id trong mảng các reactions
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

          // Lấy user của từng reaction
          totalReactions[typeOfReaction] = renderArray;
        }

        allReactions = [...allReactions, ...renderArray];
        totalReactions["allReactions"] = allReactions;
      }
    }

    return totalReactions;
  }, [icons, members, reactions]);

  // Xử lý sự kiện click vào các icons
  const handleOnClickIconsType = (e, typeReaction) => {
    setItemIcon(typeReaction);
    if (e.target.tagName === "LI") {
      setLineStyle({
        width: e.target.clientWidth,
        left: e.target.offsetLeft,
      });
    } else {
      setLineStyle({
        width: e.target.parentElement.clientWidth,
        left: e.target.parentElement.offsetLeft,
      });
    }
  };

  // Render các icon có người chọn
  const reactionTypeCount = useMemo(() => {
    const typeCount = [];

    if (Object.keys(reactions).length) {
      for (let typeReaction in reactions) {
        if (reactions[typeReaction].length >= 1) {
          typeCount.push(
            <li
              onClick={(e) => {
                handleOnClickIconsType(e, typeReaction);
              }}
              key={typeReaction}
              className={cx("header-item")}
            >
              <img
                className={cx("item-img")}
                src={icons[typeReaction]}
                alt=""
              />
              <span className={cx("reaction-count")}>
                {reactions[typeReaction].length}
              </span>
            </li>
          );
        }
      }
    }
    return typeCount;
  }, [reactions, icons]);

  useEffect(() => {
    if (allReactionRef.current) {
      setLineStyle({
        width: allReactionRef.current.clientWidth,
        left: allReactionRef.current.offsetLeft,
      });
    }
  }, [isVisible]);

  return (
    <Modal
      title="Cảm xúc về tin nhắn"
      visible={isVisible}
      okButton={false}
      onCancel={handleVisible}
    >
      {Object.keys(reactions).length && (
        <div className={cx("reactions-modal", { isMobile: isMobile })}>
          {/*====== Header ======*/}
          <div className={cx("header-wrap")}>
            <ul className={cx("header")}>
              <li
                ref={allReactionRef}
                onClick={(e) => {
                  setItemIcon("allReactions");
                  if (e.target.tagName === "LI") {
                    setLineStyle({
                      width: e.target.clientWidth,
                      left: e.target.offsetLeft,
                    });
                  }
                }}
                className={cx("header-item", "all-reaction-item")}
              >
                Tất cả {usersReactions["allReactions"].length}
              </li>
              {reactionTypeCount}
            </ul>

            <div style={lineStyle} className={cx("line")}></div>
          </div>

          {/*====== Content ======*/}
          <div className={cx("content")}>
            <ul className={cx("users-list")}>{usersReactions[itemIcon]}</ul>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ReactionsModal;
