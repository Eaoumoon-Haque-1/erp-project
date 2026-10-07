/**
 * @file Shared application-layout component: DrawerSidebar.
 * Sections: layout-specific helpers/state and rendered navigation or shell markup.
 * Preserve responsive desktop/mobile behavior and keep feature logic out of layout components.
 */
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { appMenu } from '../../app/menu'
import DrawerMenuGroup from './DrawerMenuGroup'

const baseClass =
  'health-sidebar fixed inset-y-0 left-0 z-30 mt-14 lg:static lg:mt-0 lg:translate-x-0'

// Return the ancestor keys for the current URL. Those keys make the correct
// parent/submenu branch open automatically after navigation or refresh.
function findActiveMenuPath(items, pathname, parentPath = []) {
  for (const item of items) {
    const itemKey = item.key || item.path

    if (item.children?.length) {
      const activePath = findActiveMenuPath(item.children, pathname, [
        ...parentPath,
        itemKey,
      ])

      if (activePath) return activePath
      continue
    }

    if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      return parentPath
    }
  }

  return null
}

function DrawerSidebar({ open, collapsed, onNavigate }) {
  const location = useLocation()
  const activeMenuPath = findActiveMenuPath(appMenu, location.pathname) ?? []
  const [menuState, setMenuState] = useState(() => ({
    pathname: location.pathname,
    openMenuPath: activeMenuPath,
  }))
  // Route-derived state wins when the URL changes; manual state controls only
  // toggles performed while staying on the same page.
  const openMenuPath =
    menuState.pathname === location.pathname
      ? menuState.openMenuPath
      : activeMenuPath
  const drawerClass = open ? 'translate-x-0' : '-translate-x-full'
  const desktopClass = collapsed
    ? 'health-sidebar-desktop-collapsed'
    : ''

  const handleMenuToggle = (depth, itemKey) => {
    setMenuState((current) => {
      const currentPath =
        current.pathname === location.pathname
          ? current.openMenuPath
          : activeMenuPath

      if (currentPath[depth] === itemKey) {
        // Closing a branch also removes every open descendant below it.
        return {
          pathname: location.pathname,
          openMenuPath: currentPath.slice(0, depth),
        }
      }

      return {
        pathname: location.pathname,
        // Keeping only ancestors guarantees one open sibling at each level.
        openMenuPath: [...currentPath.slice(0, depth), itemKey],
      }
    })
  }

  return (
    <aside
      className={[baseClass, drawerClass, desktopClass].join(' ')}
      aria-label={'Primary navigation'}
    >
      <div className={'health-sidebar-profile'}>
        <h5>Super Admin</h5>
        <span>Super Admin</span>
      </div>
      <nav>
        {appMenu.map((item) => (
          <DrawerMenuGroup
            key={item.key}
            item={item}
            openMenuPath={openMenuPath}
            onMenuToggle={handleMenuToggle}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  )
}

export default DrawerSidebar
