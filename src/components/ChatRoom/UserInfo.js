import { useContext } from "react";

import { signOut } from "firebase/auth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import { auth } from "../../firebase/config";
import { AuthContext } from "../../Context/AuthProvider";
import userPlacehoderImg from "../../assets/images/user.png";

function UserInfo() {
  // Lấy dữ liệu từ context
  const user = useContext(AuthContext);
  const { displayName, photoURL, uid } = user;

  return (
    <div className="user-info">
      <div className="user-info_container">
        <img
          className="user-info_img"
          src={photoURL || userPlacehoderImg}
          alt="User photo"
        />
        <div className="user-info_wrap">
          <h4 className="user-info_name">{displayName}</h4>
          <p className="user-info_invite-code">Mã mời: {uid}</p>
        </div>
      </div>
      <button
        className="user-info_signout-btn btn"
        onClick={() => {
          signOut(auth)
            .then(() => {
              console.log("Sign out successful");
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </button>
    </div>
  );
}

export default UserInfo;
