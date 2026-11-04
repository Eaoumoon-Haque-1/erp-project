/**
 * @file Data mapper for Account Voucher between API and UI state.
 */

function resolveAuditActor(id, directDisplay, lookupMap) {
  if (directDisplay) return String(directDisplay)
  if (id == null || id === '') return ''
  const key = String(id)
  return lookupMap?.get?.(key) || key
}

function formatEmployeeAuditDisplay(code, name) {
  const cleanCode = String(code ?? '').trim()
  const cleanName = String(name ?? '').trim()
  if (cleanCode && cleanName) return `${cleanCode}: ${cleanName}`
  return cleanCode || cleanName || ''
}

export function mapVoucherFromApi(
  item = {},
  userNames = new Map(),
  employeeNames = new Map(),
) {
  if (!item) return null

  const createdUserId =
    item.createdUserId ??
    item.createdByUserId ??
    item.CREATED_USER_ID ??
    ''
  const createdEmpId =
    item.createdEmpId ??
    item.createdEmployeeId ??
    item.CREATED_EMP_ID ??
    ''
  const updatedUserId =
    item.updatedUserId ??
    item.updatedByUserId ??
    item.UPDATED_USER_ID ??
    ''
  const updatedEmpId =
    item.updatedEmpId ??
    item.updatedEmployeeId ??
    item.UPDATED_EMP_ID ??
    ''

  const directCreatedEmpDisplay = formatEmployeeAuditDisplay(
    item.createdEmployeeCode ?? item.createdEmpCode ?? item.CREATED_EMPLOYEE_CODE,
    item.createdEmployeeName ?? item.createdEmpName ?? item.CREATED_EMPLOYEE_NAME,
  )
  const directUpdatedEmpDisplay = formatEmployeeAuditDisplay(
    item.updatedEmployeeCode ?? item.updatedEmpCode ?? item.UPDATED_EMPLOYEE_CODE,
    item.updatedEmployeeName ?? item.updatedEmpName ?? item.UPDATED_EMPLOYEE_NAME,
  )

  const details = (item.voucherDetails || item.details || []).map((d) => ({
    id: d.id != null ? d.id : null,
    coaId: d.coaId != null ? String(d.coaId) : '',
    accountCode: d.accountCode || '',
    accountHeadName: d.accountHeadName || '',
    coaSourceType: d.coaSourceType || d.accountsSource || '',
    accountsSource: d.coaSourceType || d.accountsSource || '',
    coaSourceName: d.coaSourceName || '',
    coaSourceId: d.coaSourceId != null ? String(d.coaSourceId) : '',
    costCenterId: d.costCenterId != null ? String(d.costCenterId) : '',
    costCenterName: d.costCenterName || '',
    drAmount: d.drAmount != null ? String(d.drAmount) : '',
    crAmount: d.crAmount != null ? String(d.crAmount) : '',
  }))

  const attachments = (item.voucherAttachments || item.attachments || []).map((a) => ({
    id: a.id != null ? a.id : null,
    attachmentFileName: a.attachmentFileName || '',
    attachmentFile: a.attachmentFile || '',
    isActive: a.isActive != null ? a.isActive : 1,
  }))

  return {
    ID: item.id != null ? String(item.id) : '',
    BG_ID: item.bgId != null ? String(item.bgId) : '',
    BU_ID: item.buId != null ? String(item.buId) : '',
    GROUP_NAME: item.businessGroupName || item.groupName || item.GROUP_NAME || '',
    BUSINESS_UNIT: item.businessUnitName || item.businessUnit || item.BUSINESS_UNIT || '',
    VOUCHER_DATE: item.voucherDate || '',
    VOUCHER_TYPE_ID: item.voucherTypeId != null ? String(item.voucherTypeId) : '',
    VOUCHER_TYPE: item.voucherTypeName || item.voucherType || '',
    VOUCHER_NO: item.voucherNo || '',
    LOCATION_ID: item.locationId != null ? String(item.locationId) : '',
    PAYMENT_TYPE_ID: item.paymentTypeId != null ? String(item.paymentTypeId) : '',
    PAYMENT_TYPE: item.paymentTypeName || item.paymentType || '',
    PAYMENT_TO: item.paymentTo || '',
    PAYMENT_THROUGH_ID: item.paymentThroughId != null ? String(item.paymentThroughId) : '',
    PAYMENT_THROUGH: item.paymentThroughName || item.paymentThrough || '',
    PERIOD_NAME: item.periodName || '',
    VOUCHER_AMOUNT: item.voucherAmount != null ? String(item.voucherAmount) : '0.00',
    VOUCHER_SOURCE: item.voucherSource || 'MANUAL',
    VOUCHER_SOURCE_LINK: item.voucherSourceLink || '',
    VOUCHER_STATUS: item.voucherStatus || 'DRAFT',
    APPROVAL_CODE: item.approvalCode || '',
    BANK_ACCOUNT: item.bankAccount || '',
    CHEQUE_NO: item.chequeNo || '',
    CHEQUE_DATE: item.chequeDate || '',
    CHEQUE_AMOUNT: item.chequeAmount != null ? String(item.chequeAmount) : '',
    IS_POSTED: item.isPosted != null ? String(item.isPosted) : '0',
    IS_RECONCILED: item.isReconciled != null ? String(item.isReconciled) : '0',
    NARRATION: item.narration || '',
    STATUS: item.status != null ? String(item.status) : '1',

    details,
    attachments,

    CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
    CREATED_USER_NAME: resolveAuditActor(
      createdUserId,
      item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
      userNames,
    ),
    CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
    CREATED_EMP_NAME: resolveAuditActor(
      createdEmpId,
      directCreatedEmpDisplay,
      employeeNames,
    ),
    CREATED_DATETIME:
      item.createdDatetime ??
      item.createdDateTime ??
      item.createdAt ??
      item.CREATED_DATETIME ??
      '',
    CREATED_APP: item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '',
    UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
    UPDATED_USER_NAME: resolveAuditActor(
      updatedUserId,
      item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
      userNames,
    ),
    UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
    UPDATED_EMP_NAME: resolveAuditActor(
      updatedEmpId,
      directUpdatedEmpDisplay,
      employeeNames,
    ),
    UPDATED_DATETIME:
      item.updatedDatetime ??
      item.updatedDateTime ??
      item.updatedAt ??
      item.UPDATED_DATETIME ??
      '',
    UPDATED_APP: item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '',

    AUDIT_LOG: {
      CREATED_USER_ID: createdUserId !== '' ? String(createdUserId) : '',
      CREATED_USER_NAME: resolveAuditActor(
        createdUserId,
        item.createdUserName ?? item.createdByUserName ?? item.CREATED_USER_NAME,
        userNames,
      ),
      CREATED_EMP_ID: createdEmpId !== '' ? String(createdEmpId) : '',
      CREATED_EMP_NAME: resolveAuditActor(
        createdEmpId,
        directCreatedEmpDisplay,
        employeeNames,
      ),
      CREATED_DATETIME:
        item.createdDatetime ??
        item.createdDateTime ??
        item.createdAt ??
        item.CREATED_DATETIME ??
        '',
      CREATED_APP: item.createdApp ?? item.createdFrom ?? item.CREATED_APP ?? '',
      UPDATED_USER_ID: updatedUserId !== '' ? String(updatedUserId) : '',
      UPDATED_USER_NAME: resolveAuditActor(
        updatedUserId,
        item.updatedUserName ?? item.updatedByUserName ?? item.UPDATED_USER_NAME,
        userNames,
      ),
      UPDATED_EMP_ID: updatedEmpId !== '' ? String(updatedEmpId) : '',
      UPDATED_EMP_NAME: resolveAuditActor(
        updatedEmpId,
        directUpdatedEmpDisplay,
        employeeNames,
      ),
      UPDATED_DATETIME:
        item.updatedDatetime ??
        item.updatedDateTime ??
        item.updatedAt ??
        item.UPDATED_DATETIME ??
        '',
      UPDATED_APP: item.updatedApp ?? item.updatedFrom ?? item.UPDATED_APP ?? '',
      STATUS: item.status !== undefined && item.status !== null ? String(item.status) : '1',
    },
    API_RECORD: item,
  }
}

export function mapVoucherToApi(values, details = [], attachments = [], original = null) {
  const mappedDetails = details.map((d) => ({
    id: d.id || null,
    coaId: d.coaId ? Number(d.coaId) : null,
    coaSourceType: d.coaSourceType || d.accountsSource || null,
    coaSourceName: d.coaSourceName ? String(d.coaSourceName).trim() : null,
    coaSourceId: d.coaSourceId ? Number(d.coaSourceId) : null,
    costCenterId: d.costCenterId ? Number(d.costCenterId) : null,
    drAmount: d.drAmount !== '' && d.drAmount != null ? Number(d.drAmount) : 0,
    crAmount: d.crAmount !== '' && d.crAmount != null ? Number(d.crAmount) : 0,
    status: 1,
  }))

  const mappedAttachments = attachments
    .filter((a) => (a.attachmentFileName && a.attachmentFileName.trim()) || a.attachmentFile)
    .map((a) => ({
      id: a.id || null,
      attachmentFileName: a.attachmentFileName ? String(a.attachmentFileName).trim() : 'attachment',
      attachmentFile: a.attachmentFile || null,
      isActive: a.isActive != null ? Number(a.isActive) : 1,
      status: 1,
    }))

  const totalDr = mappedDetails.reduce((sum, d) => sum + (d.drAmount || 0), 0)

  return {
    bgId: values.BG_ID ? Number(values.BG_ID) : original?.bgId || null,
    buId: values.BU_ID ? Number(values.BU_ID) : original?.buId || null,
    voucherDate: values.VOUCHER_DATE || null,
    voucherTypeId: values.VOUCHER_TYPE_ID ? Number(values.VOUCHER_TYPE_ID) : null,
    voucherType: values.VOUCHER_TYPE ? String(values.VOUCHER_TYPE).trim() : null,
    voucherNo: values.VOUCHER_NO ? String(values.VOUCHER_NO).trim() : null,
    locationId: values.LOCATION_ID ? Number(values.LOCATION_ID) : null,
    paymentTypeId: values.PAYMENT_TYPE_ID ? Number(values.PAYMENT_TYPE_ID) : null,
    paymentType: values.PAYMENT_TYPE ? String(values.PAYMENT_TYPE).trim() : null,
    paymentTo: values.PAYMENT_TO ? String(values.PAYMENT_TO).trim() : null,
    paymentThroughId: values.PAYMENT_THROUGH_ID ? Number(values.PAYMENT_THROUGH_ID) : null,
    paymentThrough: values.PAYMENT_THROUGH ? String(values.PAYMENT_THROUGH).trim() : null,
    periodName: values.PERIOD_NAME ? String(values.PERIOD_NAME).trim() : null,
    voucherAmount: values.VOUCHER_AMOUNT !== '' && values.VOUCHER_AMOUNT != null
      ? Number(values.VOUCHER_AMOUNT)
      : totalDr,
    voucherSource: values.VOUCHER_SOURCE ? String(values.VOUCHER_SOURCE).trim() : 'MANUAL',
    voucherSourceLink: values.VOUCHER_SOURCE_LINK ? String(values.VOUCHER_SOURCE_LINK).trim() : null,
    voucherStatus: values.VOUCHER_STATUS ? String(values.VOUCHER_STATUS).trim() : 'DRAFT',
    approvalCode: values.APPROVAL_CODE ? String(values.APPROVAL_CODE).trim() : null,
    bankAccount: values.BANK_ACCOUNT ? String(values.BANK_ACCOUNT).trim() : null,
    chequeNo: values.CHEQUE_NO ? String(values.CHEQUE_NO).trim() : null,
    chequeDate: values.CHEQUE_DATE || null,
    chequeAmount: values.CHEQUE_AMOUNT !== '' && values.CHEQUE_AMOUNT != null ? Number(values.CHEQUE_AMOUNT) : null,
    isPosted: values.IS_POSTED != null ? Number(values.IS_POSTED) : 0,
    isReconciled: values.IS_RECONCILED != null ? Number(values.IS_RECONCILED) : 0,
    narration: values.NARRATION ? String(values.NARRATION).trim() : null,
    status: values.STATUS != null ? Number(values.STATUS) : 1,

    voucherDetails: mappedDetails,
    voucherAttachments: mappedAttachments,
  }
}

