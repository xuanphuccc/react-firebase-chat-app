import classNames from "classnames/bind";
import styles from "./AlertModal.module.scss";

import Modal from "../Modal";
import { useContext } from "react";
import { AppContext } from "../../../Context/AppProvider";

const cx = classNames.bind(styles);

function AlertModal() {
  const { alertVisible, alertContent, setAlertVisible, setAlertContent } =
    useContext(AppContext);

  const handleCancel = () => {
    setAlertVisible(false);
    setAlertContent("");
  };

  return (
    <Modal
      visible={alertVisible}
      isHeader={false}
      okButton={false}
      onCancel={handleCancel}
    >
      {alertContent && (
        <div className={cx("wrapper")}>
          <div className={cx("alert-content")}>
            <h2 className={cx("alert-content_header")}>{alertContent.title}</h2>
            <p className={cx("alert-content_description")}>
              {alertContent.description}
            </p>
          </div>
          <div className={cx("alert-controls")}>
            <button
              onClick={handleCancel}
              className={cx("alert-controls_btn", "btn", "primary")}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AlertModal;
