/**
 * @file Shared application-layout component: DrawerMenuGroup.
 * Sections: layout-specific helpers/state and rendered navigation or shell markup.
 * Preserve responsive desktop/mobile behavior and keep feature logic out of layout components.
 */
import { NavLink } from 'react-router-dom'

function ModuleIcon() {
  return (
    <svg viewBox={'0 0 24 24'} width={'16'} height={'16'} fill={'none'} aria-hidden={'true'}>
      <path
        d={'M6 3h8l4 4v14H6zM14 3v5h5'}
        stroke={'currentColor'}
        strokeWidth={'1.75'}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
      />
    </svg>
  )
}

function ChevronIcon({ expanded }) {
  return (
    <svg viewBox={'0 0 24 24'} width={'14'} height={'14'} fill={'none'} aria-hidden={'true'}>
      <path
        d={expanded ? 'm6 9 6 6 6-6' : 'm9 18 6-6-6-6'}
        stroke={'currentColor'}
        strokeWidth={'2'}
        strokeLinecap={'round'}
        strokeLinejoin={'round'}
      />
    </svg>
  )
}

function DrawerMenuItem({
  item,
  depth,
  openMenuPath,
  onMenuToggle,
  onNavigate,
}) {
  const hasChildren = Boolean(item.children)
  const itemKey = item.key || item.path
  const expanded = hasChildren && openMenuPath[depth] === itemKey

  if (!hasChildren) {
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          ['health-sidebar-link', isActive ? 'active' : ''].join(' ')
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type={'button'}
        className={'health-sidebar-parent'}
        aria-expanded={expanded}
        onClick={() => onMenuToggle(depth, itemKey)}
      >
        <span className={'health-sidebar-parent-label'}>
          <ModuleIcon />
          <span>{item.label}</span>
        </span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && (
        <div className={'health-sidebar-submenu'}>
          {item.children.map((child) => (
            <DrawerMenuItem
              key={child.key || child.path}
              item={child}
              depth={depth + 1}
              openMenuPath={openMenuPath}
              onMenuToggle={onMenuToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DrawerMenuGroup({
  item,
  openMenuPath,
  onMenuToggle,
  onNavigate,
}) {
  return (
    <DrawerMenuItem
      item={item}
      depth={0}
      openMenuPath={openMenuPath}
      onMenuToggle={onMenuToggle}
      onNavigate={onNavigate}
    />
  )
}

export default DrawerMenuGroup
