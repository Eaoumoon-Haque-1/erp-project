/**
 * @file Controlled Item Attribute Form.
 * Layout:
 * - Attribute Name (required text input)
 * - Attribute Code (text input, auto-generated placeholder or manual code)
 * - Is Active? (Active / Inactive dropdown)
 * - Audit Log Block (when editing or viewing)
 * - Action buttons: Save, Update, Reset, Back to List, Edit Attribute
 * Group Name and Business Unit are retrieved from session data and hidden on the UI.
 */
import { useId } from 'react'

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className={'text-xs text-rose-600 mt-1 font-medium'}>
      {message}
    </p>
  )
}

function inputClass(error, readOnly = false, extraClasses = '') {
  return [
    'w-full h-8 px-2.5 py-1 border rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors',
    readOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white',
    error ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300',
    extraClasses,
  ]
    .filter(Boolean)
    .join(' ')
}

function formatAuditDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return `${day}/${month}/${year} ${time}`
}

function ItemAttributeForm({
  values,
  errors = {},
  auditLog = null,
  submitting = false,
  readOnly = false,
  isEdit = false,
  onChange = () => {},
  onSubmit = () => {},
  onReset,
  onEdit,
  onCancel,
}) {
  const formId = useId()

  return (
    <div className={'space-y-5 max-w-4xl'}>
      {/* Item Attribute Form Card */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4'}>
        {/* Attribute Name */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Attribute Name<span className={'text-rose-500 ml-0.5'}>*</span>
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={values.ATTRIBUTE_NAME || '-'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <input
              type={'text'}
              value={values.ATTRIBUTE_NAME || ''}
              onChange={(e) => onChange('ATTRIBUTE_NAME', e.target.value)}
              placeholder={'Enter attribute name (e.g. Color, Size, Weight, Capacity)'}
              className={inputClass(errors.ATTRIBUTE_NAME, false)}
            />
          )}
          <FieldError id={`${formId}-aname-err`} message={errors.ATTRIBUTE_NAME} />
        </div>

        {/* Attribute Code */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Attribute Code
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={values.ATTRIBUTE_CODE || '-'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <input
              type={'text'}
              value={values.ATTRIBUTE_CODE || ''}
              onChange={(e) => onChange('ATTRIBUTE_CODE', e.target.value)}
              placeholder={isEdit ? 'Enter attribute code' : 'Auto Generated if left blank (e.g. ATTR-00001)'}
              className={inputClass(errors.ATTRIBUTE_CODE, false)}
            />
          )}
          <FieldError id={`${formId}-acode-err`} message={errors.ATTRIBUTE_CODE} />
        </div>

        {/* Is Active? */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Is Active?
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={String(values.STATUS) === '1' ? 'Active' : 'Inactive'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2 flex items-center'}>
                <input
                  id={`${formId}-status`}
                  className={'erp-switch-control'}
                  type={'checkbox'}
                  role={'switch'}
                  name={'STATUS'}
                  checked={String(values.STATUS ?? '1') === '1'}
                  onChange={(e) => onChange('STATUS', e.target.checked ? '1' : '0')}
                />
                <span className={'text-xs font-medium text-gray-700 select-none'}>
                  {String(values.STATUS ?? '1') === '1' ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Buttons / Actions placed above Audit Log */}
        {readOnly && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onCancel && (
              <button
                type={'button'}
                onClick={onCancel}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Back to List
              </button>
            )}
            {onEdit && (
              <button
                type={'button'}
                onClick={onEdit}
                className={
                  'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none transition-colors'
                }
              >
                Edit Attribute
              </button>
            )}
          </div>
        )}

        {!readOnly && isEdit && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onReset && (
              <button
                type={'button'}
                onClick={onReset}
                disabled={submitting}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Reset
              </button>
            )}
            <button
              type={'button'}
              onClick={onSubmit}
              disabled={submitting}
              className={
                'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
              }
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        )}

        {!readOnly && !isEdit && (
          <div className={'flex items-center gap-2 pt-2'}>
            {onReset && (
              <button
                type={'button'}
                onClick={onReset}
                disabled={submitting}
                className={
                  'px-4 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition-colors'
                }
              >
                Reset
              </button>
            )}
            <button
              type={'button'}
              onClick={onSubmit}
              disabled={submitting}
              className={
                'inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded bg-[#038b8d] hover:bg-[#027577] text-white shadow-xs focus:outline-none disabled:opacity-50 transition-colors'
              }
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Audit Log Block (for View and Edit pages) */}
      {auditLog && (
        <div className={'bg-white p-3.5 rounded border border-gray-200 shadow-xs'}>
          <div className={'flex items-center justify-between pb-2 mb-3 border-b border-gray-100'}>
            <div className={'flex items-center gap-2'}>
              <div className={'w-1.5 h-4 bg-[#038b8d] rounded-full'} />
              <h3 className={'text-sm font-semibold text-gray-800 tracking-tight'}>
                Audit Log :
              </h3>
            </div>
            <span
              data-column={'STATUS'}
              className={[
                'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none text-white',
                String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values?.STATUS ?? auditLog?.STATUS ?? '1') === '1'
                ? 'Active'
                : 'Inactive'}
            </span>
          </div>

          <div className={'space-y-3 text-xs'}>
            {/* Row 1: Created Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'CREATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_USER_NAME || auditLog.CREATED_USER_ID || auditLog.CREATED_BY || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_EMP_NAME || auditLog.CREATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'CREATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.CREATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'CREATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Created From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.CREATED_APP || '-'}
                </span>
              </div>
            </div>

            {/* Row 2: Updated Audit Info */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}>
              <div
                data-column={'UPDATED_USER_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (User):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_USER_NAME || auditLog.UPDATED_USER_ID || auditLog.UPDATED_BY || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_EMP_ID'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated By (Employee):
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_EMP_NAME || auditLog.UPDATED_EMP_ID || '-'}
                </span>
              </div>

              <div
                data-column={'UPDATED_DATETIME'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated At:
                </span>
                <span className={'font-semibold text-gray-800'}>
                  {formatAuditDateTime(auditLog.UPDATED_DATETIME)}
                </span>
              </div>

              <div
                data-column={'UPDATED_APP'}
                className={'p-2.5 rounded border border-gray-100 bg-gray-50/70'}
              >
                <span className={'block text-[11px] font-medium text-gray-500 mb-0.5'}>
                  Updated From:
                </span>
                <span className={'font-semibold text-gray-800 break-words'}>
                  {auditLog.UPDATED_APP || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemAttributeForm

