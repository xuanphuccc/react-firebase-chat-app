import { Route, Routes, BrowserRouter } from "react-router-dom";
import AuthProvider from "./Context/AuthProvider";
import AppProvider from "./Context/AppProvider";
import Login from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import Sidebar from "./components/ChatRoom/Sidebar";
import ChatWindow from "./components/ChatRoom/ChatWindow";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ChatRoom />}>
              <Route path="room-list" element={<Sidebar />} />
              <Route path="chat-window" element={<ChatWindow />} />
              <Route path="*" element={<Sidebar />} />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
