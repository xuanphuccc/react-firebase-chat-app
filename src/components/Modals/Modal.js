import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

function Modal({
  title = "This is modal",
  visible = false,
  onOk,
  onCancel,
  children,
}) {
  return (
    <div className={`modal ${visible ? "modal--show" : "modal--hide"}`}>
      <div className="modal_header">
        <h4 className="modal_title">{title}</h4>
      </div>
      <div className="modal_children">{children}</div>
      <div className="modal_controls">
        <button onClick={onOk} className="modal_ok btn primary max">
          OK
        </button>
        <i onClick={onCancel} className="modal_cancel">
          <FontAwesomeIcon icon={faCircleXmark} />
        </i>
      </div>
    </div>
  );
}

export default Modal;
