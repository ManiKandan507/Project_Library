import "./index.css";

const ConfirmDialog = ({ prompt, onConfirm, onCancel, okayText = "OK", cancelText = "Cancel" }) => {
  return (
    <main className="confirm-dialog-wrapper">
      <div className="confirm-dialog">
        <p style={{ fontSize: "1.1rem" }}>{prompt}</p>
        <hr style={{ marginBlock: "1em" }} />
        <div className="text-right">
          <button onClick={onCancel} style={{ marginRight: "1em" }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className="primary">
            {okayText}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ConfirmDialog;
