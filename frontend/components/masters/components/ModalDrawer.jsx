import React, { useEffect } from 'react';

export default function ModalDrawer({ title, open, onClose, children }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="drawer-panel">
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="btn" type="button" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}
