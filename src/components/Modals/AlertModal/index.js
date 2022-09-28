import Modal from "../Modal";

function AlertModal() {
  return (
    <Modal visible={true} isHeader={false} okButton={false}>
      <h2>Không tải tệp lên được</h2>
    </Modal>
  );
}

export default AlertModal;
