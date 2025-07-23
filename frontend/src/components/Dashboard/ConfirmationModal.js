import React from 'react';
import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-button cancel-button">Cancel</button>
          <button onClick={onConfirm} className="modal-button confirm-button-danger">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
