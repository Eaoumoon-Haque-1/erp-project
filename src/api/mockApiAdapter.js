/**
 * @file Development-only in-browser API simulator.
 *
 * It preserves the real Axios/endpoints contract so page components do not
 * contain mock-specific branches. Data is kept in sessionStorage and resets
 * when the browser session ends or this schema version changes.
 */
const STORAGE_KEY = 'cloud-erp.mock-api.v1'

const initialState = {
  businessGroups: [
    { id: 1, groupName: 'Health Expert Group', bgLogo: '', status: 1 },
  ],
  businessUnits: [
    {
      id: 1,
      bgId: 1,
      businessUnit: 'Head Office',
      address: 'Dhaka, Bangladesh',
      email: 'headoffice@example.com',
      mobileNo: '01700000000',
      webAddress: 'https://example.com',
      buLogo: '',
      reportHeader: 'Health Expert',
      reportFooter: 'Cloud ERP',
      status: 1,
    },
  ],
  modules: [
    { id: 1, moduleName: 'Super Admin', isActive: 1, status: 1 },
    { id: 2, moduleName: 'HRIS', isActive: 1, status: 1 },
    { id: 3, moduleName: 'Asset', isActive: 1, status: 1 },
    { id: 4, moduleName: 'Sales', isActive: 1, status: 1 },
  ],
  permissions: [
    { id: 1, permissionName: 'View', moduleId: 1, isActive: 1, status: 1 },
    { id: 2, permissionName: 'Create', moduleId: 1, isActive: 1, status: 1 },
    { id: 3, permissionName: 'View', moduleId: 2, isActive: 1, status: 1 },
    { id: 4, permissionName: 'Create', moduleId: 2, isActive: 1, status: 1 },
    { id: 5, permissionName: 'View', moduleId: 3, isActive: 1, status: 1 },
    { id: 6, permissionName: 'Create', moduleId: 3, isActive: 1, status: 1 },
    { id: 7, permissionName: 'View', moduleId: 4, isActive: 1, status: 1 },
    { id: 8, permissionName: 'Create', moduleId: 4, isActive: 1, status: 1 },
  ],
  menus: [
    { id: 1, menuName: 'User Creation', moduleId: 1, isParent: 1, parentMenuId: null, isTopMenu: 1, permissionId: 1, routeName: '/super-admin/user-creation', sortOrder: 1, isActive: 1, status: 1 },
    { id: 2, menuName: 'Employee Information', moduleId: 2, isParent: 0, parentMenuId: null, isTopMenu: 1, permissionId: 3, routeName: '/hris/hris-forms/employee-information', sortOrder: 1, isActive: 1, status: 1 },
    { id: 3, menuName: 'Asset Item Information', moduleId: 3, isParent: 0, parentMenuId: null, isTopMenu: 1, permissionId: 5, routeName: '/asset/asset-item-information', sortOrder: 1, isActive: 1, status: 1 },
    { id: 4, menuName: 'Sales Agreement', moduleId: 4, isParent: 0, parentMenuId: null, isTopMenu: 1, permissionId: 7, routeName: '/sales/sales-agreement', sortOrder: 1, isActive: 1, status: 1 },
  ],
  roles: [
    { id: 1, roleName: 'Super Admin', isActive: 1, status: 1 },
    { id: 2, roleName: 'HR Manager', isActive: 1, status: 1 },
  ],
  roleDetails: [
    { id: 1, roleId: 1, moduleId: 1, menuId: 1, permissionId: 1 },
    { id: 2, roleId: 1, moduleId: 1, menuId: 1, permissionId: 2 },
  ],
  businessUnitRoles: [
    { id: 1, businessUnitId: 1, roleId: 1 },
  ],
  userTypes: [
    { id: 1, userType: 'Business User', isActive: 1 },
    { id: 2, userType: 'Employee User', isActive: 1 },
  ],
  users: [
    {
      id: 1,
      userName: 'superadmin',
      fullName: 'Super Admin',
      email: 'superadmin@example.com',
      mobileNo: '01700000000',
      fromDate: '2026-01-01T00:00:00.000Z',
      toDate: '2026-12-31T00:00:00.000Z',
      roleId: 1,
      userTypeId: 1,
      buId: 1,
      isActive: 1,
      isAndroidFixed: 0,
    },
  ],
  chartOfAccounts: [
    {
      id: 1,
      slNo: 1,
      companyId: 1,
      accountCode: '1000',
      accountHead: 'Assets',
      ledgerHeadType: 'Asset',
      accountType: 'Control',
      parentAccountHeadId: null,
      accountUsage: 'General',
      isCostCenterMandatory: 0,
      isBudgetHead: 0,
      openingDate: '2026-01-01',
      openingBalance: 0,
      balanceDr: 0,
      balanceCr: 0,
      currentDr: 0,
      currentCr: 0,
      status: 1,
    },
  ],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : clone(initialState)
  } catch {
    return clone(initialState)
  }
}

let state = loadState()

function persist() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function parsePayload(data) {
  if (!data) return {}
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function nextId(records) {
  return Math.max(0, ...records.map((record) => Number(record.id) || 0)) + 1
}

function response(config, data, status = 200) {
  return Promise.resolve({
    data: clone(data),
    status,
    statusText: status === 201 ? 'Created' : status === 204 ? 'No Content' : 'OK',
    headers: { 'x-cloud-erp-mock': 'true' },
    config,
    request: { mock: true },
  })
}

function pathFrom(config) {
  const url = new URL(config.url || '/', 'http://cloud-erp.mock')
  return url.pathname.replace(/^\/api\/v1/, '') || '/'
}

function roleDetailsFor(roleId) {
  const matching = state.roleDetails.filter(
    (detail) => String(detail.roleId) === String(roleId),
  )
  const grouped = new Map()

  matching.forEach((detail) => {
    const key = `${detail.moduleId}:${detail.menuId}`
    if (!grouped.has(key)) {
      const module = state.modules.find((item) => item.id === detail.moduleId)
      const menu = state.menus.find((item) => item.id === detail.menuId)
      grouped.set(key, {
        id: detail.id,
        moduleId: detail.moduleId,
        moduleName: module?.moduleName || '',
        menuId: detail.menuId,
        menuName: menu?.menuName || '',
        permissions: [],
      })
    }
    const permission = state.permissions.find((item) => item.id === detail.permissionId)
    if (permission) {
      grouped.get(key).permissions.push({
        id: permission.id,
        permissionName: permission.permissionName,
      })
    }
  })

  return { assignedPermissions: [...grouped.values()] }
}

const crudResources = {
  '/business-groups': 'businessGroups',
  '/business-units': 'businessUnits',
  '/modules': 'modules',
  '/permissions': 'permissions',
  '/menus': 'menus',
  '/roles': 'roles',
  '/role-details': 'roleDetails',
  '/user-types': 'userTypes',
  '/users': 'users',
  '/coa': 'chartOfAccounts',
}

function handleCrud(config, path, method) {
  for (const [basePath, stateKey] of Object.entries(crudResources)) {
    if (path !== basePath && !path.startsWith(`${basePath}/`)) continue

    const records = state[stateKey]
    const id = path === basePath ? null : path.slice(basePath.length + 1)

    if (method === 'get' && id === null) return response(config, records)
    if (method === 'get') {
      return response(config, records.find((record) => String(record.id) === id) || {})
    }
    if (method === 'post' && id === null) {
      const record = { id: nextId(records), ...parsePayload(config.data) }
      records.push(record)
      persist()
      return response(config, record, 201)
    }
    if (method === 'put' && id !== null) {
      const index = records.findIndex((record) => String(record.id) === id)
      const record = { ...(records[index] || {}), ...parsePayload(config.data), id: Number(id) }
      if (index >= 0) records[index] = record
      else records.push(record)
      persist()
      return response(config, record)
    }
    if (method === 'delete' && id !== null) {
      state[stateKey] = records.filter((record) => String(record.id) !== id)
      persist()
      return response(config, null, 204)
    }
  }

  return null
}

export default async function mockApiAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, 120))
  const path = pathFrom(config)
  const method = String(config.method || 'get').toLowerCase()
  const payload = parsePayload(config.data)

  if (path === '/auth/login' && method === 'post') {
    return response(config, {
      accessToken: 'development-mock-access-token',
      tokenType: 'Bearer',
      expiresIn: 86400,
      username: payload.username || 'frontend-designer',
      role: 'SUPER_ADMIN',
    })
  }
  if (path === '/auth/logout' && method === 'post') return response(config, { success: true })
  if (path === '/auth/refresh' && method === 'post') {
    return response(config, { accessToken: 'development-mock-access-token', expiresIn: 86400 })
  }

  const unitsByGroup = path.match(/^\/business-units\/group\/(\d+)$/)
  if (unitsByGroup && method === 'get') {
    return response(
      config,
      state.businessUnits.filter((unit) => String(unit.bgId) === unitsByGroup[1]),
    )
  }

  const unitRoles = path.match(/^\/business-units\/(\d+)\/roles(?:\/(\d+))?$/)
  if (unitRoles) {
    const businessUnitId = Number(unitRoles[1])
    if (method === 'get') {
      const assignedRoles = state.businessUnitRoles
        .filter((mapping) => mapping.businessUnitId === businessUnitId)
        .map((mapping) => ({
          id: mapping.id,
          roleId: mapping.roleId,
          roleName: state.roles.find((role) => role.id === mapping.roleId)?.roleName || '',
        }))
      return response(config, { assignedRoles })
    }
    if (method === 'post') {
      const mapping = {
        id: nextId(state.businessUnitRoles),
        businessUnitId,
        roleId: Number(payload.roleId),
      }
      state.businessUnitRoles.push(mapping)
      persist()
      return response(config, mapping, 201)
    }
    if (method === 'delete' && unitRoles[2]) {
      state.businessUnitRoles = state.businessUnitRoles.filter(
        (mapping) => String(mapping.id) !== unitRoles[2],
      )
      persist()
      return response(config, null, 204)
    }
  }

  const menusByModule = path.match(/^\/menus\/module\/(\d+)$/)
  if (menusByModule && method === 'get') {
    return response(config, state.menus.filter(
      (menu) => String(menu.moduleId) === menusByModule[1],
    ))
  }

  const permissionsByModule = path.match(/^\/permissions\/module\/(\d+)$/)
  if (permissionsByModule && method === 'get') {
    return response(config, state.permissions.filter(
      (permission) => String(permission.moduleId) === permissionsByModule[1],
    ))
  }

  const roleDetails = path.match(/^\/roles\/(\d+)\/details$/)
  if (roleDetails && method === 'get') {
    return response(config, roleDetailsFor(roleDetails[1]))
  }

  const availablePermissions = path.match(/^\/roles\/(\d+)\/available-permissions$/)
  if (availablePermissions && method === 'get') {
    const moduleId = Number(config.params?.moduleId)
    const menuId = Number(config.params?.menuId)
    const assignedIds = new Set(
      state.roleDetails
        .filter((detail) => (
          String(detail.roleId) === availablePermissions[1]
          && detail.menuId === menuId
        ))
        .map((detail) => detail.permissionId),
    )
    return response(config, state.permissions.filter(
      (permission) => permission.moduleId === moduleId && !assignedIds.has(permission.id),
    ))
  }

  const assignRolePermissions = path.match(/^\/roles\/(\d+)\/permissions$/)
  if (assignRolePermissions && method === 'post') {
    const created = (payload.permissionIds || []).map((permissionId) => {
      const detail = {
        id: nextId(state.roleDetails),
        roleId: Number(assignRolePermissions[1]),
        moduleId: Number(payload.moduleId),
        menuId: Number(payload.menuId),
        permissionId: Number(permissionId),
      }
      state.roleDetails.push(detail)
      return detail
    })
    persist()
    return response(config, created, 201)
  }

  const detailsByRole = path.match(/^\/role-details\/role\/(\d+)$/)
  if (detailsByRole && method === 'get') {
    return response(config, state.roleDetails.filter(
      (detail) => String(detail.roleId) === detailsByRole[1],
    ))
  }

  const removePermission = path.match(/^\/role-details\/(\d+)\/permissions\/(\d+)$/)
  if (removePermission && method === 'delete') {
    const group = state.roleDetails.find((detail) => String(detail.id) === removePermission[1])
    if (group) {
      state.roleDetails = state.roleDetails.filter((detail) => !(
        detail.roleId === group.roleId
        && detail.moduleId === group.moduleId
        && detail.menuId === group.menuId
        && String(detail.permissionId) === removePermission[2]
      ))
      persist()
    }
    return response(config, null, 204)
  }

  const crudResponse = handleCrud(config, path, method)
  if (crudResponse) return crudResponse

  return response(config, { message: `No development mock is configured for ${method.toUpperCase()} ${path}.` }, 404)
}
