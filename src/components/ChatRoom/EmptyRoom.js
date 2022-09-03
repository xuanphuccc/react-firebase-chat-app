import placeHolderImg from "../../assets/images/user.png";

function EmptyRoom() {
  return (
    <div className="empty-room">
      <div className="empty-room_wrap">
        <h4 className="empty-room_title">Bạn chưa chọn phòng</h4>
        <img className="empty-room_img" src={placeHolderImg} alt="" />
      </div>
    </div>
  );
}

export default EmptyRoom;
