import React, { useState } from 'react';
import Papa from 'papaparse';
import { getSupabaseClient } from '../../../assets/js/services/supabaseClient.js';

export default function CSVImport({ fields, table, onClose }) {
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(false);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setErrors(['Invalid file format — please upload a CSV file.']);
      return;
    }
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data || [];
        const hdrs = results.meta.fields || (data[0] ? Object.keys(data[0]) : []);
        setHeaders(hdrs);
        setPreviewRows(data.slice(0, 10));
        // initialize mapping to same-named fields when possible
        const map = {};
        fields.forEach(f => { if (hdrs.includes(f.key)) map[f.key] = f.key; });
        setMapping(map);
        validateAll(data, map);
      },
      error: (err) => setErrors([err.message || 'Failed to parse CSV'])
    });
  }

  function validateAll(data, map) {
    const invalid = [];
    data.forEach((row, idx) => {
      const rowErrors = [];
      fields.forEach(f => {
        if (f.required) {
          const csvKey = map[f.key];
          const val = csvKey ? (row[csvKey] ?? '').toString().trim() : '';
          if (!val) rowErrors.push(`${f.label} is required`);
        }
      });
      if (rowErrors.length) invalid.push({ idx: idx + 1, errors: rowErrors });
    });
    setStats({ total: data.length, valid: data.length - invalid.length, invalid: invalid.length });
    setErrors(invalid.map(i => `Row ${i.idx}: ${i.errors.join('; ')}`));
  }

  async function handleImportConfirm() {
    setLoading(true);
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase client unavailable');
      // fetch full parsed data again from file input using header mapping
      // For simplicity expect previewRows contains sample; instead reparse via FileReader? We'll prompt user to re-select file if missing.
      // To keep implementation straightforward, reparse from previously selected file by reading from input element.
      const input = document.querySelector('#csv-import-input');
      if (!input || !input.files || !input.files[0]) throw new Error('No file selected for import');
      const file = input.files[0];
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: (r) => resolve(r), error: (e) => reject(e) });
      });
      const data = results.data || [];
      const payload = data.map((row) => {
        const obj = {};
        Object.keys(mapping).forEach((fieldKey) => {
          const csvColumn = mapping[fieldKey];
          obj[fieldKey] = csvColumn ? (row[csvColumn] ?? null) : null;
        });
        return obj;
      });
      const res = await client.from(table).insert(payload).select();
      if (res.error) throw res.error;
      alert(`Imported ${res.data.length} rows successfully.`);
      onClose && onClose({ success: true, rows: res.data.length });
    } catch (err) {
      setErrors([err.message || 'Import failed']);
    } finally { setLoading(false); }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>Import CSV</h3>
        <input id="csv-import-input" type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0])} />
        {fileName && <div>Selected: {fileName}</div>}

        {headers.length > 0 && (
          <div>
            <h4>Column mapping</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {fields.map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{f.label}{f.required ? ' *' : ''}</span>
                  <select value={mapping[f.key] || ''} onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}>
                    <option value="">-- skip --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}

        {previewRows.length > 0 && (
          <div>
            <h4>Preview (first {previewRows.length} rows)</h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="responsive-table">
                <thead>
                  <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {previewRows.map((r, idx) => (
                    <tr key={idx}>{headers.map(h => <td key={h}>{r[h]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div>Rows: {stats.total} • Valid: {stats.valid} • Invalid: {stats.invalid}</div>
          {errors.length > 0 && <div className="status-panel status-panel--error"><ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn" onClick={() => onClose && onClose()}>Cancel</button>
          <button className="btn primary" onClick={handleImportConfirm} disabled={loading}>{loading ? 'Importing…' : 'Confirm Import'}</button>
        </div>
      </div>
    </div>
  );
}
