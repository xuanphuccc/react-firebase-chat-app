import "./Skeleton.scss";

// Skeleton loading
function Skeleton({ style, className = "" }) {
  return <div style={{ ...style }} className={`skeleton ${className}`}></div>;
}

export default Skeleton;
