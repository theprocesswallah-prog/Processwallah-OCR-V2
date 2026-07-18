import React, { useEffect, useMemo, useState } from 'react';

export default function MasterDrawerForm({ fields, initial = {}, onCancel, onSave, saving, title }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const base = {};
    fields.forEach((f) => { base[f.key] = initial[f.key] ?? ''; });
    setValues(base);
    setDirty(false);
    setErrors({});
  }, [initial, fields]);

  const requiredFields = useMemo(() => fields.filter((f) => f.required), [fields]);

  function handleChange(key, val) {
    setValues((s) => ({ ...s, [key]: val }));
    setDirty(true);
  }

  function validate() {
    const errs = {};
    requiredFields.forEach((f) => {
      if (!values[f.key]?.toString().trim()) {
        errs[f.key] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSave(values);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        handleSubmit(event);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [values]);

  return (
    <form className="drawer-form" onSubmit={handleSubmit}>
      <div className="drawer-form-header">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{initial[fields[0]?.key] ? `Edit ${title}` : `Add ${title}`}</h3>
        </div>
      </div>
      <div className="drawer-form-grid">
        {fields.map((field) => (
          field.hidden ? null : (
            <label key={field.key} className="form-field">
              <span>{field.label}{field.required ? ' *' : ''}</span>
              <input value={values[field.key] ?? ''} onChange={(e) => handleChange(field.key, e.target.value)} />
              {errors[field.key] && <div className="field-error">{errors[field.key]}</div>}
            </label>
          )
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}
