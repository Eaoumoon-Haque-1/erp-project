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
      ],
    },
  ],
}]
