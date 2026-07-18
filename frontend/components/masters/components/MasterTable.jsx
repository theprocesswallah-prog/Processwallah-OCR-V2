import React from 'react';

export default function MasterTable({ columns, data, onEdit, onDelete, onSort, sortBy }) {
  return (
    <div className="master-table">
      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              {columns.filter(c => !c.hidden).map((col) => (
                <th key={col.key} onClick={() => onSort && onSort(col.key)}>
                  {col.label}
                  {sortBy?.key === col.key ? (sortBy.order === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id || row[columns[0].key] || JSON.stringify(row)}>
                {columns.filter(c => !c.hidden).map((col) => (
                  <td key={col.key}>{row[col.key] ?? '—'}</td>
                ))}
                <td>
                  <button className="action" onClick={() => onEdit(row)}>Edit</button>
                  <button className="action danger" onClick={() => onDelete(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
