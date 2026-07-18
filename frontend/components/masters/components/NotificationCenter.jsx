import React from 'react';

export default function NotificationCenter({ notifications, onDismiss }) {
  return (
    <div className="notification-center">
      {notifications.map((note) => (
        <div key={note.id} className={`notification ${note.type}`}>
          <div>{note.message}</div>
          <button className="notification-close" type="button" onClick={() => onDismiss(note.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
