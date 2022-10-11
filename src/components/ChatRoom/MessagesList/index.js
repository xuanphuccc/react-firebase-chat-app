import { useState, useEffect, useMemo } from "react";

import Message from "../Message";
import NotifiMessage from "../NotifiMessage";
import InfiniteScroll from "react-infinite-scroll-component";

function MessagesList({ sideBySideMessages, roomId }) {
  const [nowPlaying, setNowPlaying] = useState();

  // return (
  //   <>
  //     {sideBySideMessages.map((message, index) => {
  //       if (message.type === "@roomnotify") {
  //         return <NotifiMessage key={message.id} message={message} />;
  //       }

  //       return (
  //         <Message
  //           key={message.id}
  //           message={message}
  //           messageIndex={index}
  //           messagesLength={sideBySideMessages.length}
  //           nowPlaying={nowPlaying}
  //           setNowPlaying={setNowPlaying}
  //         />
  //       );
  //     })}
  //   </>
  // );

  const [totalCount, setTotalCount] = useState(20);

  useEffect(() => {
    setTotalCount(20);
  }, [roomId]);

  console.log("TotalCount: ", totalCount);

  const fetchMoreData = () => {
    setTotalCount((prev) => prev + 20);
  };

  const newRenderMessages = useMemo(() => {
    return sideBySideMessages.slice(0, totalCount);
  }, [totalCount, sideBySideMessages]);

  return (
    <div
      id="scrollableDiv"
      style={{
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        paddingTop: 36,
        paddingBottom: 24,
      }}
    >
      <InfiniteScroll
        dataLength={newRenderMessages.length}
        next={fetchMoreData}
        style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
        inverse={true}
        hasMore={true}
        loader={
          <h4 style={{ textAlign: "center" }}>Cuộn để tải thêm tin nhắn...</h4>
        }
        scrollableTarget="scrollableDiv"
      >
        {newRenderMessages.length > 0 &&
          newRenderMessages.map((message, index) => {
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
      </InfiniteScroll>
    </div>
  );
}

export default MessagesList;
