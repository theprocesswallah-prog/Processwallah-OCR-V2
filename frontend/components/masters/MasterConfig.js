export const mastersConfig = {
  customer: {
    route: '/customer-master',
    table: 'customer_master',
    pk: 'customer_id',
    label: 'Customer',
    searchFields: ['name', 'gstin', 'phone', 'email', 'address'],
    filterFields: ['name', 'gstin', 'phone', 'email'],
    duplicateCheck: ['name', 'gstin'],
    fields: [
      { key: 'customer_id', label: 'ID', hidden: true },
      { key: 'name', label: 'Name', required: true, filterable: true },
      { key: 'gstin', label: 'GSTIN', filterable: true },
      { key: 'phone', label: 'Phone', filterable: true },
      { key: 'email', label: 'Email', filterable: true },
      { key: 'address', label: 'Address' }
    ]
  },
  vendor: {
    route: '/vendor-master',
    table: 'vendor_master',
    pk: 'vendor_id',
    label: 'Vendor',
    searchFields: ['name', 'gstin', 'phone', 'email', 'address'],
    filterFields: ['name', 'gstin', 'phone', 'email'],
    duplicateCheck: ['name', 'gstin'],
    fields: [
      { key: 'vendor_id', label: 'ID', hidden: true },
      { key: 'name', label: 'Name', required: true, filterable: true },
      { key: 'gstin', label: 'GSTIN', filterable: true },
      { key: 'phone', label: 'Phone', filterable: true },
      { key: 'email', label: 'Email', filterable: true },
      { key: 'address', label: 'Address' }
    ]
  },
  product: {
    route: '/product-master',
    table: 'product_master',
    pk: 'product_id',
    label: 'Product',
    searchFields: ['name', 'hsn', 'uom'],
    filterFields: ['name', 'hsn', 'uom'],
    duplicateCheck: ['name', 'hsn'],
    fields: [
      { key: 'product_id', label: 'ID', hidden: true },
      { key: 'name', label: 'Name', required: true, filterable: true },
      { key: 'hsn', label: 'HSN', filterable: true },
      { key: 'uom', label: 'UOM', filterable: true },
      { key: 'sgst', label: 'SGST' },
      { key: 'cgst', label: 'CGST' }
    ]
  },
  item: {
    route: '/item-master',
    table: 'item_master',
    pk: 'item_id',
    label: 'Item',
    searchFields: ['code', 'description', 'product_id'],
    filterFields: ['code', 'product_id'],
    duplicateCheck: ['code'],
    fields: [
      { key: 'item_id', label: 'ID', hidden: true },
      { key: 'code', label: 'Code', required: true, filterable: true },
      { key: 'description', label: 'Description' },
      { key: 'product_id', label: 'Product ID', filterable: true },
      { key: 'rate', label: 'Rate' }
    ]
  }
};

export default mastersConfig;
