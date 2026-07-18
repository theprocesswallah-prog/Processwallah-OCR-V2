import React, { useEffect, useState } from 'react';

export default function MasterForm({ fields, initial = {}, onCancel, onSave, saving }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const base = {};
    fields.forEach(f => { base[f.key] = initial[f.key] ?? ''; });
    setValues(base);
  }, [initial, fields]);

  function handleChange(key, val) {
    setValues((s) => ({ ...s, [key]: val }));
  }

  function validate() {
    const errs = {};
    fields.forEach(f => {
      if (f.required && !values[f.key]) {
        errs[f.key] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(values);
  }

  return (
    <form className="master-form" onSubmit={submit}>
      {fields.map((f) => (
        f.hidden ? null : (
          <div className="form-row" key={f.key}>
            <label>{f.label}{f.required ? ' *' : ''}</label>
            <input
              value={values[f.key] ?? ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
            {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
          </div>
        )
      ))}

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}
