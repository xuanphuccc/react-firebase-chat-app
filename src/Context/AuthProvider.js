import { useEffect, useState, createContext } from "react";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  // const location = useLocation();

  useEffect(() => {
    // Lấy người dùng hiện tại khi đăng nhập xong
    const unsubcribed = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { displayName, email, uid, photoURL } = user;
        setUser({
          displayName,
          email,
          uid,
          photoURL,
        });

        // Chuyển về trang chủ khi đăng nhập thành công
        // ngăn không cho về trang login

        if (window.location.pathname === "/login") {
          navigate("/room-list");
        }
      } else {
        // Chuyển về trang login khi đăng nhập không thành công
        // hoặc chưa đăng nhập
        navigate("/login");
      }
    });

    return () => {
      unsubcribed();
    };
  }, [navigate]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthProvider;
