import React from 'react';

export default function Toolbar({ onAdd, onImportClick, onExport, searchValue, onSearchChange, onRefresh }) {
  return (
    <div className="masters-toolbar">
      <div />
      <div className="toolbar-actions">
        <button className="btn" onClick={onAdd}>+ Add New</button>
        <button className="btn" onClick={onImportClick}>📥 Import CSV</button>
        <button className="btn" onClick={onExport}>📤 Export CSV</button>
        <input className="toolbar-search" placeholder="Search" value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
        <button className="btn" onClick={onRefresh}>↻ Refresh</button>
      </div>
    </div>
  );
}
