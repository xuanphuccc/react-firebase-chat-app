import { useContext } from "react";
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

function App() {
  const { rooms } = useContext(AppContext);

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
