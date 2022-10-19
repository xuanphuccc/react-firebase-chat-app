import { useEffect, useState, createContext, useMemo } from "react";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import useViewport from "../hooks/useViewport";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const viewport = useViewport();
  const [isMobile, setIsMobile] = useState(false);

  useMemo(() => {
    if (viewport.width < 768) {
      setIsMobile(true);
    } else setIsMobile(false);
  }, [viewport.width]);

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

        // Chuyển về chat room khi đăng nhập thành công
        // ngăn không cho về trang login
        if (isMobile) {
          if (
            window.location.pathname === "/login" ||
            window.location.pathname === "/signup" ||
            window.location.pathname === "/room/room-id" ||
            window.location.pathname === "/"
          ) {
            navigate("/room-list");
          }
        } else {
          if (
            window.location.pathname === "/login" ||
            window.location.pathname === "/signup" ||
            window.location.pathname === "/room-list" ||
            window.location.pathname === "/"
          ) {
            navigate("/room/room-id");
          }
        }
      } else {
        // Chuyển về trang login khi đăng nhập không thành công
        // hoặc chưa đăng nhập
        if (
          !(
            window.location.pathname.includes("signup") ||
            window.location.pathname.includes("forgot-password")
          )
        ) {
          navigate("/login");
        }
      }
    });

    return () => {
      unsubcribed();
    };
  }, [navigate, isMobile]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthProvider;
