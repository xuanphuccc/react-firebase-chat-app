import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import background from "../../assets/images/background.jpg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/config";

import { addDocument } from "../../firebase/service";

const cx = classNames.bind(styles);

const fbProvider = new FacebookAuthProvider(); //OK
const googleProvider = new GoogleAuthProvider();

function Login() {
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

          // Custom method để ghi dữ liệu vào database
          addDocument("users", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
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
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = FacebookAuthProvider.credentialFromError(error);
        // ...
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
      <div className={cx("overlay")}>
        {/* <img className={cx('overlay-')} src={background} alt="" /> */}
      </div>
      <div className={cx("login")}>
        <div className={cx("content")}>
          <h2 className={cx("title")}>Đăng nhập</h2>
          <div className={cx("controls")}>
            <button
              className={cx("login-btn", "btn", "primary")}
              onClick={handleGoogleLogin}
            >
              <i className={cx("btn-icon")}>
                <FontAwesomeIcon icon={faGoogle} />
              </i>
              <span className={cx("btn-content")}>Đăng nhập với Google</span>
            </button>
            <button
              className={cx("login-btn", "btn", "primary")}
              onClick={handleFblogin}
            >
              <i className={cx("btn-icon")}>
                <FontAwesomeIcon icon={faFacebook} />
              </i>
              <span className={cx("btn-content")}>Đăng nhập với Facebook</span>
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
