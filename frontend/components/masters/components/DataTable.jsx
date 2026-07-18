import React, { useMemo, useRef, useState } from 'react';

export default function DataTable({ columns, data, loading, sortBy, onSort, onRowAction, page, pageSize, total }) {
  const [columnWidths, setColumnWidths] = useState(() => ({}));
  const resizeInfo = useRef(null);

  const headers = useMemo(() => columns.filter((col) => !col.hidden), [columns]);

  function startResize(key, event) {
    event.preventDefault();
    resizeInfo.current = {
      key,
      startX: event.clientX,
      startWidth: columnWidths[key] || event.target.parentElement.offsetWidth
    };
    window.addEventListener('mousemove', handleResizing);
    window.addEventListener('mouseup', stopResizing);
  }

  function handleResizing(event) {
    const info = resizeInfo.current;
    if (!info) return;
    const delta = event.clientX - info.startX;
    const nextWidth = Math.max(80, info.startWidth + delta);
    setColumnWidths((prev) => ({ ...prev, [info.key]: nextWidth }));
  }

  function stopResizing() {
    resizeInfo.current = null;
    window.removeEventListener('mousemove', handleResizing);
    window.removeEventListener('mouseup', stopResizing);
  }

  const pageInfo = `Page ${page} of ${Math.max(1, Math.ceil(total / pageSize))}`;

  return (
    <div className="data-table-card">
      <div className="data-table-meta">
        <span>{total} records</span>
        <span>{pageInfo}</span>
      </div>
      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              {headers.map((col) => (
                <th key={col.key} style={{ width: columnWidths[col.key] }}>
                  <button className="header-button" type="button" onClick={() => onSort?.(col.key)}>
                    {col.label}
                    {sortBy?.key === col.key ? (sortBy.order === 'asc' ? ' ▲' : ' ▼') : ''}
                  </button>
                  <div className="col-resizer" onMouseDown={(e) => startResize(col.key, e)} />
                </th>
              ))}
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr className="skeleton-row" key={`skeleton-${idx}`}>
                  {headers.map((col) => (
                    <td key={col.key}><span className="skeleton" /></td>
                  ))}
                  <td><span className="skeleton" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={headers.length + 1} className="empty-row">No records match the selected filters.</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id || row[headers[0]?.key] || JSON.stringify(row)}>
                  {headers.map((col) => (
                    <td key={col.key}>{row[col.key] ?? '—'}</td>
                  ))}
                  <td className="actions-cell">
                    <button type="button" className="action" onClick={() => onRowAction('view', row)}>View</button>
                    <button type="button" className="action" onClick={() => onRowAction('edit', row)}>Edit</button>
                    <button type="button" className="action" onClick={() => onRowAction('duplicate', row)}>Duplicate</button>
                    <button type="button" className="action danger" onClick={() => onRowAction('delete', row)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
