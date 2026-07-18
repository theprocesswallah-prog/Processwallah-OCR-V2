import React from 'react';

export default function ConfirmDialog({ title, description, confirmText = 'Confirm', cancelText = 'Cancel', open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content modal-small">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" type="button" onClick={onCancel}>{cancelText}</button>
          <button className="btn danger" type="button" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
