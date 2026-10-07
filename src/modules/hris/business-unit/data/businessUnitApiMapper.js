/**
 * @file Converts between the Business Unit API schema and existing HR_BU form
 * field names. The API documents the logo as a string, so selected image files
 * are converted to data URLs before create/update requests.
 */
export function mapBusinessUnitFromApi(record = {}) {
  return {
    ID: String(record.id ?? ''),
    BG_ID: String(record.bgId ?? ''),
    BUSINESS_UNIT: record.businessUnit ?? '',
    ADDRESS: record.address ?? '',
    E_MAIL: record.email ?? '',
    MOBILE_NO: record.mobileNo ?? '',
    WEB_ADDRESS: record.webAddress ?? '',
    BU_LOGO: record.buLogo ?? '',
    REPORT_HEADER: record.reportHeader ?? '',
    REPORT_FOOTER: record.reportFooter ?? '',
    STATUS: String(record.status ?? 1),
  }
}

function fileToDataUrl(file) {
  if (!(file instanceof File)) return Promise.resolve(file || '')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read the selected logo.'))
    reader.readAsDataURL(file)
  })
}

export async function mapBusinessUnitToApi(values) {
  return {
    bgId: Number(values.BG_ID),
    businessUnit: values.BUSINESS_UNIT,
    buLogo: await fileToDataUrl(values.BU_LOGO),
    address: values.ADDRESS,
    email: values.E_MAIL,
    mobileNo: values.MOBILE_NO,
    webAddress: values.WEB_ADDRESS,
    reportHeader: values.REPORT_HEADER,
    reportFooter: values.REPORT_FOOTER,
    status: Number(values.STATUS),
  }
}
