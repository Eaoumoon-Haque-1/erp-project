/** @file Sidebar configuration for backend accounting resources. */
export const accountsMenu = [{
  label: 'Accounts',
  key: 'accounts',
  children: [
    { label: 'Chart of Accounts Bk', key: 'chart-of-accounts', path: '/accounts/chart-of-accounts' },
    {
      label: 'Voucher Setup',
      key: 'voucher-setup',
      children: [
        {
          label: 'Chart of accounts',
          key: 'afm-chart-of-accounts',
          path: '/accounts/voucher-setup/chart-of-accounts',
        },
        {
          label: 'Bank Information',
          key: 'afm-bank-information',
          path: '/accounts/voucher-setup/bank',
        },
        {
          label: 'Lookup Type',
          key: 'afm-lookup-type',
          path: '/accounts/voucher-setup/lookup',
        },
        {
          label: 'Payment Type Mapping',
          key: 'afm-payment-type-mapping',
          path: '/accounts/voucher-setup/payment-type-mapping',
        },
        {
          label: 'Voucher Type Mapping',
          key: 'afm-voucher-type-mapping',
          path: '/accounts/voucher-setup/voucher-type-mapping',
        },
      ],
    },
  ],
}]
