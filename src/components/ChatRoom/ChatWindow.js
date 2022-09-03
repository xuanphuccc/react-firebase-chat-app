import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react/headless";

import { useContext, useState, useMemo, useRef } from "react";
import { AppContext } from "../../Context/AppProvider";
import { AuthContext } from "../../Context/AuthProvider";

import placeHolderImg from "../../assets/images/user.png";
import Message from "./Message";
import InviteMemberModal from "../Modals/InviteMemberModal";
import EmptyRoom from "./EmptyRoom";
import { addDocument } from "../../firebase/service";
import useFirestore from "../../hooks/useFirestore";

function ChatWindow() {
  const { selectedRoom, members, setIsInviteMemberVisible, selectedRoomId } =
    useContext(AppContext);

  const [inputValue, setInputValue] = useState("");

  const { uid, displayName, photoURL } = useContext(AuthContext);

  const inputRef = useRef();
  const mesListRef = useRef();

  // Hàm xử lý mở modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleOnSubmit = () => {
    if (inputValue) {
      addDocument("messages", {
        text: inputValue,
        uid,
        photoURL,
        displayName,
        roomId: selectedRoomId,
      });
    }

    // Clear input and focus
    setInputValue("");
    inputRef.current.focus();
    // mesListRef.current.scrollBy(0, 300);
    // window.scrollBy(0, 300);
  };

  // Lấy message của phòng được selected
  const messagesCondition = useMemo(() => {
    // Kiểm tra xem tin nhắn có roomId
    // trùng với selectedRoomId không
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: selectedRoomId,
    };
  }, [selectedRoomId]);

  const messages = useFirestore("messages", messagesCondition);

  return (
    <>
      {selectedRoom ? (
        <div className="chat-window">
          <div className="chat-window_header">
            <div className="chat-window_header-info">
              <img
                src={selectedRoom.photoURL || placeHolderImg}
                alt=""
                className="chat-window_header-img"
              />
              <h4 className="chat-window_header-name">{selectedRoom.name}</h4>
            </div>
            <div className="chat-window_header-users">
              <i onClick={handleInviteMemberModal} className="header-user_icon">
                <FontAwesomeIcon icon={faCirclePlus} />
              </i>

              <InviteMemberModal />

              <Tippy
                interactive
                placement="bottom-start"
                render={(attrs) => (
                  <div className="box" tabIndex="-1" {...attrs}>
                    <div className="tippy-box-wrapper">
                      {/* {members.map((member) => (
                    <Tippy
                      key={member.uid}
                      placement="bottom"
                      render={(attrs) => (
                        <div className="box" tabIndex="-1" {...attrs}>
                          <p className="participants_name">
                            {member.displayName}
                          </p>
                        </div>
                      )}
                    >
                      {console.log(member)}
                      <img
                        className="participants_img"
                        src={member.photoURL}
                        alt=""
                      />
                    </Tippy>
                  ))} */}

                      {members.map((member) => (
                        <img
                          key={member.uid}
                          className="participants_img"
                          src={member.photoURL}
                          title={member.displayName}
                          alt=""
                        />
                      ))}
                    </div>
                  </div>
                )}
              >
                <i className="header-user_icon">
                  <FontAwesomeIcon icon={faUser} />
                </i>
              </Tippy>
            </div>
          </div>

          <div ref={mesListRef} className="message-list">
            {messages.map((message, index) => (
              <Message
                key={index}
                content={message.text}
                displayName={message.displayName}
                createAt={message.createAt}
                photoURL={message.photoURL}
              />
            ))}
          </div>
          <div className="message-form">
            <input
              className="message-form_input"
              type="text"
              placeholder="Aa"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              // onPressEnter={handleOnSubmit}
            />
            <button
              onClick={handleOnSubmit}
              className="message-form_btn btn rounded primary"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      ) : (
        <EmptyRoom />
      )}
    </>
  );
}

export default ChatWindow;
