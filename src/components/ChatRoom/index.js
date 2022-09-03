import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

function ChatRoom() {
  return (
    <div className="app">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default ChatRoom;
