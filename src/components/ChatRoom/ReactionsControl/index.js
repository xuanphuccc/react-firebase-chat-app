import classNames from "classnames/bind";
import styles from "./ReactionsControl.module.scss";

import heart from "../../../assets/images/heart.png";
import haha from "../../../assets/images/haha.png";
import wow from "../../../assets/images/wow.png";
import sad from "../../../assets/images/sad.png";
import angry from "../../../assets/images/angry.png";
import like from "../../../assets/images/like.png";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

import { useContext } from "react";

import { AuthContext } from "../../../Context/AuthProvider";

const cx = classNames.bind(styles);

function ReactionsControl({ id }) {
  const { uid } = useContext(AuthContext);

  function handleReaction(type) {
    const messageRef = doc(db, "messages", id);
    updateDoc(messageRef, {
      reactions: {
        [type]: arrayUnion(uid),
      },
    });
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("reactions")}>
        <img
          onClick={() => {
            handleReaction("heart");
          }}
          className={cx("item")}
          src={heart}
          alt=""
        />
        <img
          onClick={() => {
            handleReaction("haha");
          }}
          className={cx("item")}
          src={haha}
          alt=""
        />
        <img
          onClick={() => {
            handleReaction("wow");
          }}
          className={cx("item")}
          src={wow}
          alt=""
        />
        <img
          onClick={() => {
            handleReaction("sad");
          }}
          className={cx("item")}
          src={sad}
          alt=""
        />
        <img
          onClick={() => {
            handleReaction("angry");
          }}
          className={cx("item")}
          src={angry}
          alt=""
        />
        <img
          onClick={() => {
            handleReaction("like");
          }}
          className={cx("item")}
          src={like}
          alt=""
        />
      </div>
    </div>
  );
}

export default ReactionsControl;
