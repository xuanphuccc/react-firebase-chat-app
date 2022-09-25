import classNames from "classnames/bind";
import styles from "./Login.module.scss";

import googleIcon from "../../assets/images/brands/google.png";
import facebookIcon from "../../assets/images/brands/facebook.png";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { addDocument } from "../../firebase/service";

import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

const cx = classNames.bind(styles);

const fbProvider = new FacebookAuthProvider(); //OK
const googleProvider = new GoogleAuthProvider();

function Login() {
  const { isDesktop } = useContext(AppContext);

  // Login với Facebook
  // Đồng thời ghi dữ liệu người dùng vào database
  const handleFblogin = () => {
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const { user, _tokenResponse } = result;

        // Nếu là người dùng mới thì ghi dữ liệu vào database
        if (_tokenResponse.isNewUser) {
          console.log("New User!");

          addDocument("users", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            fullPath: "",
            uid: user.uid,
            providerId: _tokenResponse.providerId,
          });
        }

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // const credential = FacebookAuthProvider.credentialFromResult(result);
        // const accessToken = credential.accessToken;
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
        // ...
        console.error({ errorCode, errorMessage, email, credential });

        signOut(auth)
          .then(() => {
            console.log("Sign out successful");
          })
          .catch((error) => {
            console.error(error);
          });
      });
  };

  // Login với Google
  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const { user, _tokenResponse } = result;

        // Nếu là người dùng mới thì ghi dữ liệu vào database
        if (_tokenResponse.isNewUser) {
          console.log("New User!");

          // Custom method để ghi dữ liệu vào database
          addDocument("users", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            fullPath: "",
            uid: user.uid,
            providerId: _tokenResponse.providerId,
          });
        }

        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.error({ errorCode, errorMessage, email, credential });
      });
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("overlay")}></div>
      <div className={cx("login", { isDesktop })}>
        <div className={cx("content")}>
          <h1 className={cx("title")}>Đăng nhập</h1>
          <div className={cx("controls")}>
            <button className={cx("login-btn")}>
              <span className={cx("btn-icon")}>
                <FontAwesomeIcon icon={faUser} />
              </span>
              <span className={cx("btn-content")}>
                Sử dụng email / số điện thoại
              </span>
              <span></span>
            </button>
            <button className={cx("login-btn")} onClick={handleGoogleLogin}>
              <img className={cx("btn-icon")} src={googleIcon} alt="" />
              <span className={cx("btn-content")}>Đăng nhập với Google</span>
              <span></span>
            </button>
            <button className={cx("login-btn")} onClick={handleFblogin}>
              <img className={cx("btn-icon")} src={facebookIcon} alt="" />
              <span className={cx("btn-content")}>Đăng nhập với Facebook</span>
              <span></span>
            </button>
          </div>
        </div>
        <div className={cx("cool-background")}>
          <div className={cx("cool-img")}></div>
        </div>
      </div>
    </div>
  );
}

export default Login;
