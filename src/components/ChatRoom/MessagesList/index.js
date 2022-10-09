import { useState } from "react";

import Message from "../Message";
import NotifiMessage from "../NotifiMessage";

function MessagesList({ sideBySideMessages }) {
  const [nowPlaying, setNowPlaying] = useState();
  return (
    <>
      {sideBySideMessages.map((message, index) => {
        if (message.type === "@roomnotify") {
          return <NotifiMessage key={message.id} message={message} />;
        }

        return (
          <Message
            key={message.id}
            message={message}
            messageIndex={index}
            messagesLength={sideBySideMessages.length}
            nowPlaying={nowPlaying}
            setNowPlaying={setNowPlaying}
          />
        );
      })}
    </>
  );
}

export default MessagesList;
