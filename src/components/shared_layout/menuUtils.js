/**
 * @file Helper utilities for matching active navigation routes and menu items.
 */

export function isPathMatching(item, pathname) {
  if (!item || !pathname) return false

  const target = item.path
  if (target) {
    if (pathname === target || pathname.startsWith(`${target}/`)) {
      return true
    }
  }

  // Support explicitly configured aliases on menu item objects
  if (Array.isArray(item.aliases)) {
    for (const alias of item.aliases) {
      if (pathname === alias || pathname.startsWith(`${alias}/`)) {
        return true
      }
    }
  }

  // Accounts module: Customer Information shortcuts & aliases
  if (target === '/accounts/voucher-setup/customer') {
    if (
      pathname === '/accounts/customer' ||
      pathname.startsWith('/accounts/customer/') ||
      pathname === '/accounts/customer-info' ||
      pathname.startsWith('/accounts/customer-info/')
    ) {
      return true
    }
  }

  // Accounts module: Supplier Information shortcuts & aliases
  if (target === '/accounts/voucher-setup/supplier') {
    if (
      pathname === '/accounts/supplier' ||
      pathname.startsWith('/accounts/supplier/') ||
      pathname === '/accounts/supplier-info' ||
      pathname.startsWith('/accounts/supplier-info/')
    ) {
      return true
    }
  }

  // Accounts module: Chart of Accounts shortcut
  if (target === '/accounts/voucher-setup/chart-of-accounts') {
    if (
      pathname === '/accounts/chart-of-accounts' ||
      pathname.startsWith('/accounts/chart-of-accounts/')
    ) {
      return true
    }
  }

  // Accounts module: Lookup Type shortcut
  if (target === '/accounts/voucher-setup/lookup') {
    if (
      pathname === '/accounts/voucher-setup/lookup-type' ||
      pathname.startsWith('/accounts/voucher-setup/lookup-type/')
    ) {
      return true
    }
  }

  return false
}

