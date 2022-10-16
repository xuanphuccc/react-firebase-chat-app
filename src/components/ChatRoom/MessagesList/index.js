// import classNames from "classnames/bind";
// import styles from "./MessagesList.module.scss";

import { useState, useEffect, useMemo } from "react";

import Message from "../Message";
import NotifiMessage from "../NotifiMessage";
import InfiniteScroll from "react-infinite-scroll-component";

// const cx = classNames.bind(styles);

function MessagesList({
  sideBySideMessages,
  roomId,
  ref1,
  setIsScrollToBottom,
}) {
  const [nowPlaying, setNowPlaying] = useState();
  const [totalCount, setTotalCount] = useState(20);

  let countIndex = sideBySideMessages.length + 1;

  // --------- Handle Scroll Infinite ----------
  useEffect(() => {
    setTotalCount(20);
  }, [roomId]);

  // console.log("TotalCount: ", totalCount);

  const fetchMoreData = () => {
    setTotalCount((prev) => prev + 20);
  };

  const newRenderMessages = useMemo(() => {
    return sideBySideMessages.slice(0, totalCount);
  }, [totalCount, sideBySideMessages]);

  // --------- Handle Scroll To Bottom ----------
  // Handle toggle show scroll to bottom button
  useEffect(() => {
    if (ref1.current) {
      const mesListRefNew = ref1.current;

      const handleToggleScrollBottom = () => {
        const scrollTop = ref1.current.scrollTop;

        if (scrollTop < -60) {
          setIsScrollToBottom(true);
        } else {
          setIsScrollToBottom(false);
        }
      };

      mesListRefNew.addEventListener("scroll", handleToggleScrollBottom);

      return () => {
        mesListRefNew.removeEventListener("scroll", handleToggleScrollBottom);
      };
    }
  }, [ref1, setIsScrollToBottom]);

  return (
    <div
      ref={ref1}
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
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflowX: "hidden",
        }} //To put endMessage and loader to the top.
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

            countIndex--;

            return (
              <Message
                zIndex={countIndex}
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
