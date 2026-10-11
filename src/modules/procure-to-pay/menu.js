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
        ],
      },
    ],
  },
]
