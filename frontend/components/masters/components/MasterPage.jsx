import React, { useMemo, useState } from 'react';
import DataTable from './DataTable.jsx';
import ModalDrawer from './ModalDrawer.jsx';
import MasterDrawerForm from './MasterDrawerForm.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import EmptyState from './EmptyState.jsx';
import CSVImportAdvanced from './CSVImportAdvanced.jsx';
import CSVExport from './CSVExport.jsx';
import Toolbar from './Toolbar.jsx';
import Breadcrumb from './Breadcrumb.jsx';

export default function MasterPage({ config, hook }) {
  const {
    items,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setSearch,
    setPage,
    setPageSize,
    sortBy,
    setSortBy,
    load,
    create,
    update,
    remove
  } = hook;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [activeRow, setActiveRow] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({});

  const filteredItems = useMemo(() => {
    const filterKeys = Object.keys(filters).filter((key) => filters[key]);
    if (!filterKeys.length) return items;
    return items.filter((row) => filterKeys.every((key) => row[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())));
  }, [items, filters]);

  function pushNotification(message, type = 'success') {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setNotifications((current) => [...current, { id, message, type }]);
  }

  function dismissNotification(id) {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  function openCreate() {
    setDrawerMode('create');
    setActiveRow(null);
    setDrawerOpen(true);
  }

  function openEdit(row) {
    setDrawerMode('edit');
    setActiveRow(row);
    setDrawerOpen(true);
  }

  function openDuplicate(row) {
    setDrawerMode('create');
    setActiveRow({ ...row, [config.pk]: null });
    setDrawerOpen(true);
  }

  function handleSave(values) {
    if (drawerMode === 'edit' && activeRow) {
      update(activeRow[config.pk], values).then((res) => {
        if (!res.error) pushNotification(`${config.label} updated successfully`);
        else pushNotification(res.error.message || 'Update failed', 'error');
      });
    } else {
      create(values).then((res) => {
        if (!res.error) pushNotification(`${config.label} created successfully`);
        else pushNotification(res.error.message || 'Create failed', 'error');
      });
    }
    setDrawerOpen(false);
  }

  function handleView(row) {
    setDrawerMode('view');
    setActiveRow(row);
    setDrawerOpen(true);
  }

  function handleDelete(row) {
    setConfirmTarget(row);
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (!confirmTarget) return;
    remove(confirmTarget[config.pk]).then((res) => {
      if (!res.error) pushNotification(`${config.label} deleted successfully`);
      else pushNotification(res.error.message || 'Delete failed', 'error');
    });
    setConfirmOpen(false);
    setConfirmTarget(null);
  }

  function handleImportSuccess(count) {
    pushNotification(`Imported ${count} rows successfully`);
    load();
  }

  function clearFilters() {
    setFilters({});
  }

  const sampleCsv = config.fields.filter((f) => !f.hidden).map((f) => f.key);

  return (
    <section className="master-page">
      <Breadcrumb masterLabel={`${config.label} Master`} mastersLink="/customer-master" />
      <div className="master-page-top">
        <button className="btn" type="button" onClick={() => window.history.back()}>← Back</button>
      </div>
      <div className="panel-card__header">
        <div>
          <p className="eyebrow">Masters</p>
          <h3>{config.label} Master</h3>
        </div>
        <Toolbar
          onAdd={openCreate}
          onImportClick={() => setImportOpen(true)}
          onExport={() => null}
          searchValue={search}
          onSearchChange={setSearch}
          onRefresh={() => load()}
        />
      </div>
      <div className="panel-card">
        <div className="filters-row">
          <input className="toolbar-search" placeholder="Global search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="advanced-filters">
            {config.filterFields?.map((key) => {
              const field = config.fields.find((f) => f.key === key);
              if (!field) return null;
              return (
                <label className="form-field" key={key}>
                  <span>{field.label}</span>
                  <input value={filters[key] || ''} onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))} />
                </label>
              );
            })}
            <button className="btn" type="button" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>

        {error && <div className="status-panel status-panel--error">{error}</div>}

        <DataTable
          columns={config.fields}
          data={filteredItems}
          loading={loading}
          sortBy={sortBy}
          onSort={(key) => setSortBy({ key, order: sortBy?.key === key && sortBy.order === 'asc' ? 'desc' : 'asc' })}
          onRowAction={(action, row) => {
            if (action === 'view') handleView(row);
            if (action === 'edit') openEdit(row);
            if (action === 'duplicate') openDuplicate(row);
            if (action === 'delete') handleDelete(row);
          }}
          page={page}
          pageSize={pageSize}
          total={total}
        />

        {!loading && filteredItems.length === 0 && (
          <EmptyState
            title={`No ${config.label.toLowerCase()} records`}
            description={`Start by adding a new ${config.label.toLowerCase()} record.`}
            actionLabel={`Add First ${config.label}`}
            onAction={openCreate}
          />
        )}
      </div>

      <ModalDrawer title={drawerMode === 'view' ? `View ${config.label}` : drawerMode === 'edit' ? `Edit ${config.label}` : `Create ${config.label}`} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MasterDrawerForm
          fields={config.fields}
          initial={drawerMode === 'create' ? activeRow || {} : activeRow || {}}
          onCancel={() => setDrawerOpen(false)}
          onSave={handleSave}
          saving={loading}
          title={config.label}
        />
      </ModalDrawer>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${config.label}`}
        description={`Are you sure you want to delete this ${config.label.toLowerCase()}? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      {importOpen && (
        <CSVImportAdvanced
          fields={config.fields}
          table={config.table}
          onClose={() => setImportOpen(false)}
          onImported={handleImportSuccess}
        />
      )}

      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
    </section>
  );
}
