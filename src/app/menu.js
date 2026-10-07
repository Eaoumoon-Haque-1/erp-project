/**
 * @file Root sidebar composition and recursive role filtering.
 * Sections: module menu imports, role-filter helper, and final current-user menu export.
 * Frontend filtering does not replace backend authorization.
 */
import { currentUser } from './currentUser'
import { accountsMenu } from '../modules/accounts/menu'
import { assetMenu } from '../modules/asset/menu'
import { hrisMenu } from '../modules/hris/menu'
import { salesMenu } from '../modules/sales/menu'
import { superAdminMenu } from '../modules/super-admin/menu'

// Role filtering is recursive so one permission can hide an entire menu branch.
// This is only frontend visibility; the backend must still authorize requests.
function filterMenuByRole(items, role) {
  return items
    .filter((item) => !item.allowedRoles || item.allowedRoles.includes(role))
    .map((item) => ({
      ...item,
      ...(item.children ? { children: filterMenuByRole(item.children, role) } : {}),
    }))
}

// Menu arrays control only the sidebar. Every leaf `path` must also exist in
// the matching module's routes.jsx file.
export const appMenu = filterMenuByRole(
  [...superAdminMenu, ...hrisMenu, ...assetMenu, ...accountsMenu, ...salesMenu],
  currentUser.role,
)
