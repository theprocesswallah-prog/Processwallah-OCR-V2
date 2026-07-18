import React from 'react';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state enhanced">
      <div className="empty-illustration">📦</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction && <button className="btn primary" type="button" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
