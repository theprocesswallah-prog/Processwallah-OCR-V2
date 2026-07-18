import React from 'react';
import Papa from 'papaparse';

export default function CSVExport({ columns, data, fileName = 'export.csv' }) {
  function handleExport() {
    const hdrs = columns.filter(c => !c.hidden).map(c => c.key);
    const rows = data.map(d => {
      const obj = {};
      hdrs.forEach(h => { obj[h] = d[h] ?? ''; });
      return obj;
    });
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <button className="btn" onClick={handleExport}>Export CSV</button>
  );
}
