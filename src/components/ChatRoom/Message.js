import Tippy from "@tippyjs/react/headless";

function Message({ content, displayName, createAt, photoURL }) {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "America/Los_Angeles",
  };
  const time = new Intl.DateTimeFormat("en-US", options).format(createAt);

  return (
    <div className="message-wrap">
      <img className="message-img" src={photoURL} alt="" />
      <Tippy
        placement="left"
        render={(attrs) => (
          <div className="box" tabIndex="-1" {...attrs}>
            <p className="message-time">{time}</p>
          </div>
        )}
      >
        <div className="message-content">
          <h4 className="message-user-name">{displayName}</h4>
          <p className="message-text">{content}</p>
        </div>
      </Tippy>
    </div>
  );
}

export default Message;
