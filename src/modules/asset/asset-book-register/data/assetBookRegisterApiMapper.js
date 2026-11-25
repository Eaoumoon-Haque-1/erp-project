/** @file Mapper between backend asset_book_register entity DTO and frontend form models. */

export function mapAssetBookRegisterFromApi(
  apiData = {},
  references = {},
  userMap = new Map(),
  empMap = new Map(),
  groupMap = new Map(),
  unitMap = new Map(),
) {
  const itemOpt = references.itemOptions?.find(
    (o) => String(o.value) === String(apiData.assetItemId),
  )
  const catOpt = references.categoryOptions?.find(
    (o) => String(o.value) === String(apiData.assetMajorCategoryId),
  )
  const deptOpt = references.departmentOptions?.find(
    (o) => String(o.value) === String(apiData.assetOwnerId),
  )
  const empOpt = references.employeeOptions?.find(
    (o) => String(o.value) === String(apiData.allocationRefId),
  )

  const createdUserId = String(apiData.createdUserId ?? '')
  const createdEmpId = String(apiData.createdEmpId ?? '')
  const updatedUserId = String(apiData.updatedUserId ?? '')
  const updatedEmpId = String(apiData.updatedEmpId ?? '')

  return {
    ID: apiData.id ? String(apiData.id) : '',
    BG_ID: apiData.bgId ? String(apiData.bgId) : '',
    BU_ID: apiData.buId ? String(apiData.buId) : '',

    ASSET_ITEM_ID: apiData.assetItemId ? String(apiData.assetItemId) : '',
    ASSET_ITEM_NAME: itemOpt?.label || (apiData.assetItemId ? `Item #${apiData.assetItemId}` : ''),

    ASSET_NO: apiData.assetNo || '',
    ASSET_UNIT: apiData.assetUnit || 'Piece',

    ASSET_MAJOR_CATEGORY_ID: apiData.assetMajorCategoryId
      ? String(apiData.assetMajorCategoryId)
      : '',
    ASSET_MAJOR_CATEGORY_NAME:
      catOpt?.label || (apiData.assetMajorCategoryId ? `Category #${apiData.assetMajorCategoryId}` : ''),

    ASSET_OWNER_ID: apiData.assetOwnerId ? String(apiData.assetOwnerId) : '',
    ASSET_OWNER_NAME:
      deptOpt?.label || (apiData.assetOwnerId ? `Department #${apiData.assetOwnerId}` : ''),

    ALLOCATION_TYPE: apiData.allocationType || 'Individual',
    ALLOCATION_REF_ID: apiData.allocationRefId ? String(apiData.allocationRefId) : '',
    ALLOCATION_REF_NAME:
      empOpt?.label ||
      empMap.get(apiData.allocationRefId ? String(apiData.allocationRefId) : '') ||
      (apiData.allocationRefId ? `Employee #${apiData.allocationRefId}` : ''),

    USAGE_STATUS: apiData.usageStatus || 'In Use',
    ASSET_CONDITION: apiData.assetCondition || 'New',
    ASSET_STATUS: apiData.assetStatus || 'Active',
    ALLOCATION_DATE: apiData.allocationDate || '',

    GROUP_NAME: groupMap.get(String(apiData.bgId)) || '',
    BUSINESS_UNIT: unitMap.get(String(apiData.buId)) || '',

    STATUS: apiData.status != null ? String(apiData.status) : '1',

    // Audit Info
    CREATED_USER_ID: createdUserId,
    CREATED_USER_NAME: userMap.get(createdUserId) || createdUserId,
    CREATED_EMP_ID: createdEmpId,
    CREATED_EMP_NAME: empMap.get(createdEmpId) || createdEmpId,
    CREATED_DATETIME: apiData.createdDatetime || '',
    CREATED_APP: apiData.createdApp || '',

    UPDATED_USER_ID: updatedUserId,
    UPDATED_USER_NAME: userMap.get(updatedUserId) || updatedUserId,
    UPDATED_EMP_ID: updatedEmpId,
    UPDATED_EMP_NAME: empMap.get(updatedEmpId) || updatedEmpId,
    UPDATED_DATETIME: apiData.updatedDatetime || '',
    UPDATED_APP: apiData.updatedApp || '',
  }
}

export function mapAssetBookRegisterToApi(formValues, context = {}) {
  return {
    id: formValues.ID ? Number(formValues.ID) : undefined,
    bgId: Number(context.bgId || formValues.BG_ID || 0),
    buId: Number(context.buId || formValues.BU_ID || 0),

    assetItemId: formValues.ASSET_ITEM_ID ? Number(formValues.ASSET_ITEM_ID) : null,
    assetNo: (formValues.ASSET_NO || '').trim() || null,
    assetUnit: formValues.ASSET_UNIT || 'Piece',
    assetMajorCategoryId: formValues.ASSET_MAJOR_CATEGORY_ID
      ? Number(formValues.ASSET_MAJOR_CATEGORY_ID)
      : null,
    assetOwnerId: formValues.ASSET_OWNER_ID ? Number(formValues.ASSET_OWNER_ID) : null,

    allocationType: formValues.ALLOCATION_TYPE || 'Individual',
    allocationRefId: formValues.ALLOCATION_REF_ID
      ? Number(formValues.ALLOCATION_REF_ID)
      : null,
    usageStatus: formValues.USAGE_STATUS || 'In Use',
    assetCondition: formValues.ASSET_CONDITION || 'New',
    assetStatus: formValues.ASSET_STATUS || 'Active',
    allocationDate: formValues.ALLOCATION_DATE || null,

    status: formValues.STATUS != null ? Number(formValues.STATUS) : 1,
  }
}
