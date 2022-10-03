import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { AppContext } from "./Context/AppProvider";

import Login from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import Sidebar from "./components/ChatRoom/Sidebar";
import ChatWindow from "./components/ChatRoom/ChatWindow";
import EmptyRoom from "./components/ChatRoom/EmptyRoom";
import ChatMedia from "./components/ChatRoom/ChatMedia";
import InviteByLink from "./components/InviteByLink";
import "./App.css";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase/config";

function App() {
  const { rooms, currentUser } = useContext(AppContext);

  useEffect(() => {
    const updateActiveTime = () => {
      if (currentUser) {
        const currentTime = Date.parse(new Date()) / 1000;
        const activeTime = currentUser.active.seconds;

        if (currentTime - activeTime > 60) {
          console.log("UPDATE ACTIVE TIME");
          const currentUserRef = doc(db, "users", currentUser.id);
          updateDoc(currentUserRef, {
            active: serverTimestamp(),
          });
        }
      }
    };
    document.addEventListener("click", updateActiveTime);

    return () => {
      console.log("Clear function APP");
      document.removeEventListener("click", updateActiveTime);
    };
  }, [currentUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/room" element={<ChatRoom />}>
        {rooms.map((room) => (
          <Route
            path={room.id}
            element={<ChatWindow roomId={room.id} />}
            key={room.id}
          />
        ))}
        <Route path="*" element={<EmptyRoom />} />
      </Route>
      <Route path="/room-list" element={<Sidebar />} />
      <Route path="/chat-media" element={<ChatMedia />} />
      <Route path="/p/:roomid" element={<InviteByLink />} />
      <Route path="*" element={<EmptyRoom />} />
    </Routes>
  );
}

export default App;
