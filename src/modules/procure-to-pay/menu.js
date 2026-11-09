/** @file Sidebar menu configuration for the top-level Procure to Pay module. */
export const procureToPayMenu = [
  {
    label: 'Procure to Pay (P2P)',
    key: 'procure-to-pay',
    children: [
      {
        label: 'Procurement Settings',
        key: 'procurement-settings',
        children: [
          {
            label: 'Supplier Information',
            key: 'supplier-information',
            path: '/procure-to-pay/procurement-settings/supplier-information',
          },
          {
            label: 'Unit of Measure (UOM)',
            key: 'asset-unit-of-measure',
            path: '/procure-to-pay/procurement-settings/asset-unit-of-measure',
          },
          {
            label: 'Item Category',
            key: 'item-category',
            path: '/procure-to-pay/procurement-settings/item-category',
            aliases: ['/inventory/item-category'],
          },
          {
            label: 'Item Brand',
            key: 'item-brand',
            path: '/procure-to-pay/procurement-settings/item-brand',
            aliases: ['/inventory/item-brand'],
          },
          {
            label: 'Item Store',
            key: 'item-store',
            path: '/procure-to-pay/procurement-settings/item-store',
            aliases: ['/inventory/item-store'],
          },
        ],
      },
    ],
  },
]
