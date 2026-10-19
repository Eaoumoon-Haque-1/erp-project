/** @file Sidebar menu configuration for the top-level Asset module. */
export const assetMenu = [
  {
    label: 'Asset',
    key: 'asset',
    children: [
      {
        label: 'Asset Settings',
        key: 'asset-settings',
        children: [
          {
            label: 'Asset Lookup Type',
            key: 'asset-lookup-type',
            path: '/asset/asset-lookup-type',
          },
          {
            label: 'Asset Lookup Value',
            key: 'asset-lookup-value',
            path: '/asset/asset-lookup-value',
          },
          {
            label: 'Asset Group',
            key: 'asset-group',
            path: '/asset/asset-group',
          },
          {
            label: 'Depreciation Category',
            key: 'depreciation-category',
            path: '/asset/depreciation-category',
          },
          {
            label: 'Asset Item Information',
            key: 'asset-item-information',
            path: '/asset/asset-item-information',
          },
          {
            label: 'Asset Specification Mapping',
            key: 'asset-specification-map',
            path: '/asset/asset-specification-map',
          },
          {
            label: 'Custodian',
            key: 'custodian',
            path: '/asset/custodian',
          },
          {
            label: 'Location Master',
            key: 'location-master',
            path: '/asset/location-master',
          },
          {
            label: 'Asset Receive Register',
            key: 'asset-receive-register',
            path: '/asset/asset-receive-register',
          },
        ],
      },
      {
        label: 'Asset Register',
        key: 'asset-register',
        children: [
          {
            label: 'Bulk Asset Receive for Split',
            key: 'bulk-asset-receive-for-split',
            path: '/asset/bulk-asset-receive-for-split',
          },
          {
            label: 'Asset Assign to Employee',
            key: 'asset-assign-to-employee',
            path: '/asset/asset-assign-to-employee',
          },
          {
            label: 'Asset Return from Employee',
            key: 'asset-return-from-employee',
            path: '/asset/asset-return-from-employee',
          },
          {
            label: 'Asset Transfer',
            key: 'asset-transfer',
            path: '/asset/asset-transfer',
          },
          {
            label: 'Maintenance / AMC',
            key: 'maintenance-amc',
            path: '/asset/maintenance-amc',
          },
          {
            label: 'Asset Disposal / Retirement',
            key: 'asset-disposal-retirement',
            path: '/asset/asset-disposal-retirement',
          },
          {
            label: 'Asset Audit',
            key: 'asset-audit',
            path: '/asset/asset-audit',
          },
          {
            label: 'Asset Repair',
            key: 'asset-repair',
            path: '/asset/asset-repair',
          },
          {
            label: 'Gate Pass',
            key: 'gate-pass',
            path: '/asset/gate-pass',
          },
        ],
      },
    ],
  },
]

