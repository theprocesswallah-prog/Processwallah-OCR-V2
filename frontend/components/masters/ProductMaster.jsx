import React, { useState } from 'react';
import MasterTable from './components/MasterTable.jsx';
import MasterForm from './components/MasterForm.jsx';
import { useMaster } from './hooks/useMaster.js';
import { mastersConfig } from './MasterConfig.js';
import Breadcrumb from './components/Breadcrumb.jsx';
import Toolbar from './components/Toolbar.jsx';
import CSVImport from './components/CSVImport.jsx';
import CSVExport from './components/CSVExport.jsx';
import { useNavigate } from 'react-router-dom';

export default function ProductMaster() {
  const cfg = mastersConfig.product;
  const { items, loading, error, page, pageSize, total, search, setSearch, setPage, setPageSize, sortBy, setSortBy, create, update, remove } = useMaster(cfg.table, cfg.pk);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  async function handleSave(values) {
    if (editing) {
      await update(editing[cfg.pk], values);
    } else {
      await create(values);
    }
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(row) {
    if (!confirm(`Delete ${cfg.label} ${row.name || row[cfg.pk]}? This action cannot be undone.`)) return;
    await remove(row[cfg.pk]);
  }

  return (
    <section>
      <Breadcrumb masterLabel={`${cfg.label} Master`} mastersLink="/product-master" />
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0.4rem 0 0.8rem' }}>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="panel-card__header">
        <div>
          <p className="eyebrow">Masters</p>
          <h3>{cfg.label} Master</h3>
        </div>
        <Toolbar
          onAdd={() => { setEditing(null); setShowForm(true); }}
          onImportClick={() => setShowImport(true)}
          onExport={() => {}}
          searchValue={search}
          onSearchChange={setSearch}
          onRefresh={() => load()}
        />
      </div>

      <div className="panel-card">
        <div style={{ marginBottom: 12 }}>
          <input placeholder={`Search ${cfg.label}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {error && <div className="status-panel status-panel--error">{error}</div>}

        <MasterTable
          columns={cfg.fields}
          data={items}
          onEdit={(r) => { setEditing(r); setShowForm(true); }}
          onDelete={handleDelete}
          onSort={(k) => setSortBy({ key: k, order: sortBy?.key === k && sortBy.order === 'asc' ? 'desc' : 'asc' })}
          sortBy={sortBy}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <div>Showing {items.length} of {total}</div>
          <div>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <button className="btn" disabled={(page * pageSize) >= total} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>

        {showForm && (
          <div className="modal">
            <div className="modal-content">
              <MasterForm fields={cfg.fields} initial={editing || {}} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} />
            </div>
          </div>
        )}

        {showImport && (
          <CSVImport fields={cfg.fields} table={cfg.table} onClose={() => setShowImport(false)} />
        )}
      </div>
    </section>
  );
}
