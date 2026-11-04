/** @file Sidebar configuration for backend accounting resources. */
export const accountsMenu = [{
  label: 'Accounts',
  key: 'accounts',
  children: [
    { label: 'Account Voucher', key: 'afm-voucher', path: '/accounts/voucher' },
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
        {
          label: 'Bank Cheque Mapping',
          key: 'afm-bank-cheque-mapping',
          path: '/accounts/voucher-setup/bank-cheque-mapping',
        },
        {
          label: 'Accounting Calendar',
          key: 'afm-calendar',
          path: '/accounts/voucher-setup/calendar',
        },
        {
          label: 'Acc. Period Open/Close',
          key: 'afm-period-open',
          path: '/accounts/voucher-setup/period',
        },
        {
          label: 'User Location',
          key: 'afm-user-location',
          path: '/accounts/voucher-setup/user-location',
        },
        {
          label: 'User Setup',
          key: 'afm-user-setup',
          path: '/accounts/voucher-setup/user-setup',
        },
      ],
    },
  ],
}]
