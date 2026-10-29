/**
 * @file Interactive hierarchical tree component for AFM Chart of Accounts.
 * Features connecting lines, expand/collapse toggles, bullet indicators, and selection.
 */
import { useMemo, useState, useEffect } from 'react'

export function buildAccountTree(accounts = []) {
  const map = new Map()
  const roots = []

  // Pass 1: create node clones with empty children
  accounts.forEach((acc) => {
    const id = String(acc.id ?? acc.ID ?? '')
    if (id) {
      map.set(id, {
        ...acc,
        _id: id,
        children: [],
      })
    }
  })

  // Pass 2: connect children to parents
  accounts.forEach((acc) => {
    const id = String(acc.id ?? acc.ID ?? '')
    const node = map.get(id)
    if (!node) return

    const parentId = String(acc.parentAccountHead ?? acc.PARENT_ACCOUNT_HEAD ?? '')
    if (parentId && map.has(parentId) && parentId !== id) {
      map.get(parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort helper: by sortOrder then accountCode
  const sortTreeNodes = (nodes) => {
    nodes.sort((a, b) => {
      const sortA = Number(a.sortOrder ?? a.SORT_ORDER ?? 0)
      const sortB = Number(b.sortOrder ?? b.SORT_ORDER ?? 0)
      if (sortA !== sortB) return sortA - sortB
      const codeA = String(a.accountCode ?? a.ACCOUNT_CODE ?? '')
      const codeB = String(b.accountCode ?? b.ACCOUNT_CODE ?? '')
      return codeA.localeCompare(codeB, undefined, { numeric: true })
    })
    nodes.forEach((n) => sortTreeNodes(n.children))
  }

  sortTreeNodes(roots)
  return roots
}

function TreeNode({
  node,
  selectedId,
  onSelectNode,
  collapsedMap,
  toggleCollapse,
  level = 1,
}) {
  const nodeId = node._id
  const hasChildren = node.children && node.children.length > 0
  const isCollapsed = Boolean(collapsedMap[nodeId])
  const isSelected = String(selectedId) === String(nodeId)

  const accountCode = node.accountCode ?? node.ACCOUNT_CODE ?? ''
  const accountHeadName = node.accountHeadName ?? node.ACCOUNT_HEAD_NAME ?? ''
  const nodeLevel = node.level ?? node.LEVEL ?? level

  return (
    <div className="relative font-sans text-sm select-none">
      <div
        className={[
          'group flex items-center py-1 px-1.5 rounded cursor-pointer transition-colors duration-150',
          isSelected
            ? 'bg-sky-100 text-sky-900 font-semibold ring-1 ring-sky-400'
            : 'text-gray-800 hover:bg-gray-100',
        ].join(' ')}
        onClick={() => onSelectNode(node)}
      >
        {/* Expand / Collapse Button - Big & Visible */}
        {hasChildren ? (
          <button
            type="button"
            className="w-5 h-5 mr-1 flex items-center justify-center text-gray-600 hover:text-teal-700 hover:bg-gray-200/70 rounded focus:outline-none shrink-0 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              toggleCollapse(nodeId)
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <svg className="w-4 h-4 fill-current text-gray-700 hover:text-teal-700" viewBox="0 0 20 20">
                <path d="M6 4l8 6-8 6V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current text-gray-700 hover:text-teal-700" viewBox="0 0 20 20">
                <path d="M4 6l6 8 6-8H4z" />
              </svg>
            )}
          </button>
        ) : (
          <span className="w-5 mr-1 shrink-0" />
        )}

        {/* Node Bullet Dot - Big & Prominently Visible */}
        <svg className="w-4 h-4 text-gray-800 fill-current mr-1.5 shrink-0" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="4.5" />
        </svg>

        {/* Node Label: AccountCode-AccountHeadName (Level) */}
        <span className="truncate text-sm" title={`${accountCode}-${accountHeadName} (${nodeLevel})`}>
          <span className="font-semibold text-gray-900">{accountCode}</span>
          <span className="text-gray-800">-{accountHeadName}</span>
          <span className="text-gray-500 text-xs ml-1.5 font-normal">({nodeLevel})</span>
        </span>
      </div>

      {/* Children Container with Visual Tree Branch Lines */}
      {hasChildren && !isCollapsed && (
        <div className="relative pl-6 ml-2.5 mt-0.5 space-y-0.5">
          {/* Vertical connecting line */}
          <div className="absolute left-2.5 top-0 bottom-2.5 w-px bg-gray-300" />
          {node.children.map((child) => (
            <div key={child._id} className="relative">
              {/* Horizontal connecting line */}
              <div className="absolute -left-3.5 top-3.5 w-3.5 h-px bg-gray-300" />
              <TreeNode
                node={child}
                selectedId={selectedId}
                onSelectNode={onSelectNode}
                collapsedMap={collapsedMap}
                toggleCollapse={toggleCollapse}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AfmChartOfAccountsTree({
  accounts = [],
  selectedId = null,
  onSelectNode = () => {},
  businessUnitName = '',
  loading = false,
}) {
  const [collapsedMap, setCollapsedMap] = useState({})

  const treeData = useMemo(() => buildAccountTree(accounts), [accounts])

  // When selectedId changes, ensure all its parent nodes are un-collapsed
  useEffect(() => {
    if (!selectedId || accounts.length === 0) return
    const idToParentMap = new Map()
    accounts.forEach((acc) => {
      const id = String(acc.id ?? acc.ID ?? '')
      const parentId = String(acc.parentAccountHead ?? acc.PARENT_ACCOUNT_HEAD ?? '')
      if (id && parentId) idToParentMap.set(id, parentId)
    })

    const ancestorsToExpand = []
    let curr = String(selectedId)
    while (idToParentMap.has(curr)) {
      const parent = idToParentMap.get(curr)
      ancestorsToExpand.push(parent)
      curr = parent
    }

    if (ancestorsToExpand.length > 0) {
      setCollapsedMap((prev) => {
        const next = { ...prev }
        let changed = false
        ancestorsToExpand.forEach((ancId) => {
          if (next[ancId]) {
            delete next[ancId]
            changed = true
          }
        })
        return changed ? next : prev
      })
    }
  }, [selectedId, accounts])

  const toggleCollapse = (nodeId) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  const handleExpandAll = () => {
    setCollapsedMap({})
  }

  const handleCollapseAll = () => {
    const nextMap = {}
    const markCollapsed = (nodes) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          nextMap[n._id] = true
          markCollapsed(n.children)
        }
      })
    }
    markCollapsed(treeData)
    setCollapsedMap(nextMap)
  }

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm p-3 min-h-[620px] flex flex-col">
      {/* Tree Header Controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 text-xs text-gray-600">
        <div className="font-medium truncate text-gray-700">
          {businessUnitName ? (
            <span>Hierarchy: <strong className="text-gray-900">{businessUnitName}</strong></span>
          ) : (
            <span>Chart of Accounts Hierarchy</span>
          )}
          <span className="ml-2 text-gray-500 font-normal">({accounts.length} heads)</span>
        </div>
        <div className="flex space-x-1.5 shrink-0">
          <button
            type="button"
            className="px-2 py-0.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-200"
            onClick={handleExpandAll}
          >
            Expand All
          </button>
          <button
            type="button"
            className="px-2 py-0.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-200"
            onClick={handleCollapseAll}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 overflow-y-auto max-h-[750px] pr-2">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full mb-2"></div>
            <div>Loading accounts hierarchy...</div>
          </div>
        ) : treeData.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No chart of accounts found for this business unit.
          </div>
        ) : (
          <div className="space-y-0.5">
            {treeData.map((rootNode) => (
              <TreeNode
                key={rootNode._id}
                node={rootNode}
                selectedId={selectedId}
                onSelectNode={onSelectNode}
                collapsedMap={collapsedMap}
                toggleCollapse={toggleCollapse}
                level={1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AfmChartOfAccountsTree
