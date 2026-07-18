export const dashboardRoutes = [
  { path: '/', label: 'Dashboard', icon: '◈', section: null },
  { path: '/sales-upload', label: 'Sales OCR Upload', icon: '◐', section: 'SALES' },
  { path: '/sales-register', label: 'Sales Register', icon: '◐', section: 'SALES' },
  { path: '/purchase-upload', label: 'Purchase OCR Upload', icon: '◑', section: 'PURCHASE' },
  { path: '/purchase-register', label: 'Purchase Register', icon: '◑', section: 'PURCHASE' },
  { path: '/customer-master', label: 'Customer Master', icon: '◫', section: 'MASTERS' },
  { path: '/vendor-master', label: 'Vendor Master', icon: '◍', section: 'MASTERS' },
  { path: '/product-master', label: 'Product Master', icon: '⬢', section: 'MASTERS' },
  { path: '/item-master', label: 'Item Master', icon: '⬡', section: 'MASTERS' },
  { path: '/settings', label: 'Settings', icon: '⚙', section: 'SYSTEM' }
];
