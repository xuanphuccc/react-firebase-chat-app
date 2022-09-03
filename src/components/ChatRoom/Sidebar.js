import UserInfo from "./UserInfo";
import RoomList from "./RoomList";

function Sidebar() {
  return (
    <div className="side-bar">
      <UserInfo />
      <RoomList />
    </div>
  );
}

export default Sidebar;
