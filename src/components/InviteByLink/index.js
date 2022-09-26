import classNames from "classnames/bind";
import styles from "./InviteByLink.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthProvider";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useEffect } from "react";
import { useState } from "react";

import placeholderImg from "../../assets/images/thumb_up.png";
import sadImg from "../../assets/images/sad.png";
import img1 from "../../assets/images/foods/hatchia.webp";
import img2 from "../../assets/images/foods/suplo.webp";
import img3 from "../../assets/images/foods/tao.webp";
import img4 from "../../assets/images/foods/occho.jpg";
import { useMemo } from "react";
import { AppContext } from "../../Context/AppProvider";

const cx = classNames.bind(styles);

function InviteByLink() {
  const [status, setStatus] = useState(null);
  const [room, setRoom] = useState(null);
  const [isClickAccept, setIsClickAccept] = useState(false);
  const navigate = useNavigate();
  const { roomid } = useParams();

  const { uid } = useContext(AuthContext);
  const { currentUser } = useContext(AppContext);

  const roomRef = useMemo(() => {
    return doc(db, "rooms", roomid);
  }, [roomid]);
  const handleParticipate = () => {
    if (uid && roomid) {
      updateDoc(roomRef, {
        members: arrayUnion(uid),
        roomNicknames: arrayUnion({ nickname: currentUser.displayName, uid }),
      })
        .then(() => {
          setStatus("successful");
          navigate(`/room/${roomid}`);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  };

  useEffect(() => {
    getDoc(roomRef)
      .then((data) => {
        const roomData = data.data();
        setRoom(roomData);

        if (roomData) {
          if (roomData.members.includes(uid)) {
            setStatus("alreadyExist");
          } else if (roomData.isAcceptLink) {
            setStatus("pendingParticipate");
          } else {
            setStatus("notAccept");
          }
        } else {
          setStatus("notFound");
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }, [uid, navigate, roomRef]);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("card-wrap")}>
        <div className={cx("header")}>
          <div className={cx("header_img-wrap")}>
            {status === "notFound" || status === "notAccept" ? (
              <img
                className={cx("header_img")}
                src={sadImg}
                style={{ opacity: 0.8 }}
                alt=""
              />
            ) : (
              <img
                className={cx("header_img")}
                src={room ? room.photoURL : placeholderImg}
                alt=""
              />
            )}
          </div>
        </div>
        {status === "pendingParticipate" && (
          <div className={cx("content")}>
            <div className={cx("content-wrap")}>
              <h5 className={cx("content_title")}>
                {isClickAccept
                  ? "Đang tham gia phòng chat..."
                  : "Bạn được mời tham gia phòng chat"}
              </h5>
              <h4 className={cx("content_room-name")}>
                {room ? room.name : ""}
              </h4>
            </div>
            <div className={cx("controls")}>
              <button
                onClick={() => {
                  handleParticipate();
                  setIsClickAccept(true);
                }}
                className={cx("accept-btn", "btn", "primary", "rounded")}
              >
                Tham gia
              </button>
              <button
                onClick={() => {
                  navigate(-1);
                }}
                className={cx("cancel-btn")}
              >
                Không tham gia
              </button>
            </div>
          </div>
        )}

        {status === "alreadyExist" && (
          <div className={cx("content")}>
            <div className={cx("content-wrap")}>
              <h5 className={cx("content_title")}>
                Bạn đã tham gia phòng chat này
              </h5>
              <div className={cx("content_suggest")}>
                <p className={cx("content_suggest-title")}>
                  Một số thực phẩm giúp tăng cường trí nhớ
                </p>
                <div className={cx("content_suggest-container")}>
                  <div className={cx("content_suggest-img-wrap")}>
                    <img
                      className={cx("content_suggest-img")}
                      src={img1}
                      alt=""
                    />
                    <p className={cx("content_suggest-name")}>Hạt chia</p>
                  </div>
                  <div className={cx("content_suggest-img-wrap")}>
                    <img
                      className={cx("content_suggest-img")}
                      src={img2}
                      alt=""
                    />
                    <p className={cx("content_suggest-name")}>Súp lơ</p>
                  </div>
                  <div className={cx("content_suggest-img-wrap")}>
                    <img
                      className={cx("content_suggest-img")}
                      src={img3}
                      alt=""
                    />
                    <p className={cx("content_suggest-name")}>Táo</p>
                  </div>
                  <div className={cx("content_suggest-img-wrap")}>
                    <img
                      className={cx("content_suggest-img")}
                      src={img4}
                      alt=""
                    />
                    <p className={cx("content_suggest-name")}>Quả óc chó</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={cx("controls")}>
              <button
                onClick={() => {
                  navigate(`/room/${roomid}`);
                }}
                className={cx("cancel-btn")}
              >
                Vào phòng chat
              </button>
            </div>
          </div>
        )}

        {status === "notAccept" && (
          <div className={cx("content")}>
            <div className={cx("content-wrap")}>
              <h5 className={cx("content_title")}>
                😵‍💫 Oops! Bạn không được cấp quyền tham gia phòng chat này
              </h5>
              <p className={cx("content-desc")}>
                Liên hệ với quản trị viên phòng chat để bật chức năng này: Phòng
                chat - Tùy chọn - Liên kết tham gia - Cho phép tham gia bằng
                liên kết đến phòng chat
              </p>
            </div>
            <div className={cx("controls")}>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className={cx("accept-btn", "btn", "primary")}
              >
                Thử lại
              </button>
              <button
                onClick={() => {
                  navigate(-1);
                }}
                className={cx("cancel-btn")}
              >
                Quay lại
              </button>
            </div>
          </div>
        )}

        {status === "notFound" && (
          <div className={cx("content")}>
            <div className={cx("content-wrap")}>
              <h5 className={cx("content_title")}>
                😵‍💫 Oops! Phòng chat này không tồn tại
              </h5>
              <p className={cx("content-desc")}>
                Liên kết đến phòng chat không hợp lệ. Vui lòng kiểm tra lại liên
                kết và thử thực hiện truy cập lại.
              </p>
            </div>
            <div className={cx("controls")}>
              <button
                onClick={() => {
                  navigate(-1);
                }}
                className={cx("cancel-btn")}
              >
                Quay lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InviteByLink;