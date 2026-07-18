import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { getSupabaseClient } from '../../../assets/js/services/supabaseClient.js';

export default function CSVImportAdvanced({ fields, table, onClose, onImported, initialSearch = '' }) {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  const visibleFields = useMemo(() => fields.filter((f) => !f.hidden), [fields]);

  function resetPreview() {
    setPreviewRows([]);
    setHeaders([]);
    setStats({ total: 0, valid: 0, invalid: 0 });
    setErrors([]);
    setReportUrl('');
  }

  function handleFile(event) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    if (!nextFile.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Invalid file format. Please upload a .csv file.']);
      return;
    }
    setFileName(nextFile.name);
    Papa.parse(nextFile, {
      header: true,
      skipEmptyLines: true,
      preview: 20,
      complete: (result) => {
        const rows = result.data || [];
        const hdrs = result.meta.fields || [];
        setHeaders(hdrs);
        setPreviewRows(rows.slice(0, 10));
        const map = {};
        fields.forEach((f) => {
          if (hdrs.includes(f.key)) map[f.key] = f.key;
        });
        setMapping(map);
        validateRows(rows, map);
      },
      error: (err) => setErrors([err.message || 'Unable to parse CSV file'])
    });
  }

  function validateRows(rows, fieldMap) {
    const invalidRows = [];
    rows.forEach((row, index) => {
      const rowErrors = [];
      fields.forEach((field) => {
        if (field.required) {
          const csvCol = fieldMap[field.key];
          const value = csvCol ? (row[csvCol] ?? '').toString().trim() : '';
          if (!value) rowErrors.push(`${field.label} is required`);
        }
      });
      if (rowErrors.length) {
        invalidRows.push({ index: index + 1, errors: rowErrors, row });
      }
    });
    setStats({ total: rows.length, valid: rows.length - invalidRows.length, invalid: invalidRows.length });
    setErrors(invalidRows.map((item) => `Row ${item.index}: ${item.errors.join('; ')}`));
    if (invalidRows.length > 0) {
      const reportCsv = Papa.unparse(invalidRows.map((item) => ({ row: item.index, errors: item.errors.join('; ') })));
      const blob = new Blob([reportCsv], { type: 'text/csv;charset=utf-8;' });
      setReportUrl(URL.createObjectURL(blob));
    } else {
      setReportUrl('');
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setErrors([]);
    try {
      const result = await new Promise((resolve, reject) => {
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: resolve, error: reject });
      });
      const rows = result.data || [];
      const payload = rows.map((row) => {
        const record = {};
        Object.keys(mapping).forEach((fieldKey) => {
          const csvCol = mapping[fieldKey];
          record[fieldKey] = csvCol ? row[csvCol] ?? null : null;
        });
        return record;
      });
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase client unavailable');
      const res = await client.from(table).insert(payload).select();
      if (res.error) throw res.error;
      onImported(res.data.length);
      onClose();
    } catch (err) {
      setErrors([err.message || 'Import failed']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content modal-large">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">CSV Import</p>
            <h3>Import {fields[0]?.key}</h3>
          </div>
          <button className="btn" type="button" onClick={onClose}>×</button>
        </div>

        <div className="import-panel">
          <div className="import-row">
            <label className="form-field">
              <span>CSV File</span>
              <input type="file" accept=".csv" onChange={handleFile} />
            </label>
            <div className="import-stats">
              <div><strong>File:</strong> {fileName || 'No file selected'}</div>
              <div><strong>Total rows:</strong> {stats.total}</div>
              <div><strong>Valid rows:</strong> {stats.valid}</div>
              <div><strong>Invalid rows:</strong> {stats.invalid}</div>
            </div>
          </div>

          {headers.length > 0 && (
            <div className="mapping-grid">
              {fields.map((field) => (
                <label key={field.key} className="form-field">
                  <span>{field.label}</span>
                  <select value={mapping[field.key] || ''} onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value }))}>
                    <option value="">Skip</option>
                    {headers.map((col) => (<option key={col} value={col}>{col}</option>))}
                  </select>
                </label>
              ))}
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="preview-panel">
              <p className="eyebrow">Preview</p>
              <div className="table-wrap">
                <table className="responsive-table">
                  <thead>
                    <tr>{headers.map((col) => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((col) => <td key={col}>{row[col]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="status-panel status-panel--error">
              <ul>{errors.map((err, idx) => <li key={idx}>{err}</li>)}</ul>
              {reportUrl && <a className="btn" href={reportUrl} download="csv-import-errors.csv">Download Error Report</a>}
            </div>
          )}
        </div>

        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn primary" type="button" onClick={handleImport} disabled={!file || loading}>{loading ? 'Importing…' : 'Import'}</button>
        </div>
      </div>
    </div>
  );
}
