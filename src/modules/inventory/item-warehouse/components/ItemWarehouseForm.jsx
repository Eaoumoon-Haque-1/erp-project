/**
 * @file Controlled Item Warehouse Form.
 * Layout:
 * - Warehouse Name (required text input)
 * - Warehouse Code (text input, auto-generated placeholder or manual code)
 * - Is Default? (Yes / No dropdown, default No)
 * - Store (Dropdown with active stores)
 * - Is Active? (Active / Inactive dropdown, default Active)
 * - Audit Log Block (when editing or viewing)
 * - Action buttons: Save, Update, Reset, Back to List, Edit Warehouse
 * Group Name and Business Unit are retrieved from session data and hidden on the UI.
 */
import { useId, useState } from 'react'
import SearchableMultiSelect from '../../../../components/shared/SearchableMultiSelect'
import { WAREHOUSE_DEFAULT_OPTIONS } from '../validation/itemWarehouseValidation'
import AssignEmployeeModal from './AssignEmployeeModal'

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

function ItemWarehouseForm({
  values,
  storeOptions = [],
  employeeOptions = [],
  assignedEmployees = [],
  businessUnitName = '',
  errors = {},
  auditLog = null,
  submitting = false,
  readOnly = false,
  isEdit = false,
  onChange = () => { },
  onSubmit = () => { },
  onAddEmployees = () => { },
  onRemoveEmployee = () => { },
  onToggleStatus = () => { },
  onReset,
  onEdit,
  onCancel,
}) {
  const formId = useId()
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  return (
    <div className={'space-y-5 max-w-4xl'}>
      {/* Item Warehouse Form Card */}
      <div className={'bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4'}>
        {/* Warehouse Name */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Warehouse Name<span className={'text-rose-500 ml-0.5'}>*</span>
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={values.WAREHOUSE_NAME || '-'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <input
              type={'text'}
              value={values.WAREHOUSE_NAME || ''}
              onChange={(e) => onChange('WAREHOUSE_NAME', e.target.value)}
              placeholder={'Enter warehouse name (e.g. North Finishing Warehouse, Chemical Store WH-1)'}
              className={inputClass(errors.WAREHOUSE_NAME, false)}
            />
          )}
          <FieldError id={`${formId}-wname-err`} message={errors.WAREHOUSE_NAME} />
        </div>

        {/* Warehouse Code */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Warehouse Code
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={values.WAREHOUSE_CODE || '-'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <input
              type={'text'}
              value={values.WAREHOUSE_CODE || ''}
              onChange={(e) => onChange('WAREHOUSE_CODE', e.target.value)}
              placeholder={isEdit ? 'Enter warehouse code' : 'Auto Generated if left blank (e.g. WH-00001)'}
              className={inputClass(errors.WAREHOUSE_CODE, false)}
            />
          )}
          <FieldError id={`${formId}-wcode-err`} message={errors.WAREHOUSE_CODE} />
        </div>

        {/* Is Default? */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Is Default?
          </label>
          {readOnly ? (
            <input
              type={'text'}
              value={String(values.IS_DEFAULT) === '1' ? 'Yes' : 'No'}
              readOnly
              className={inputClass(null, true)}
            />
          ) : (
            <select
              value={String(values.IS_DEFAULT ?? '0')}
              onChange={(e) => onChange('IS_DEFAULT', e.target.value)}
              className={inputClass(errors.IS_DEFAULT, false)}
            >
              {WAREHOUSE_DEFAULT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Store */}
        <div>
          <label className={'block text-xs font-semibold text-gray-700 mb-1'}>
            Store
          </label>
          <SearchableMultiSelect
            id={`${formId}-store`}
            value={values.STORE_ID ? String(values.STORE_ID) : ''}
            options={storeOptions}
            placeholder={'--Select/Write Store--'}
            fallbackDisplay={values.STORE_NAME || ''}
            readOnly={readOnly}
            error={Boolean(errors.STORE_ID)}
            allowClear={true}
            onChange={(val) => onChange('STORE_ID', val)}
            inputClassName={'text-xs'}
          />
          <FieldError id={`${formId}-store-err`} message={errors.STORE_ID} />
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

        {/* Assign Employee To Warehouse Section */}
        <div className={'pt-4 border-t border-gray-100 space-y-3'}>
          <div className={'flex items-center justify-between'}>
            <h4 className={'text-xs font-bold text-gray-800'}>
              Assign Employee To Warehouse
            </h4>
            {!readOnly && (
              <button
                type={'button'}
                onClick={() => setIsAssignModalOpen(true)}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#48757c] hover:bg-[#3b6268] text-white shadow-xs focus:outline-none transition-colors'
                }
              >
                <span className={'text-sm font-bold leading-none'}>+</span> Assign Employee
              </button>
            )}
          </div>

          {/* Assigned Employee Table */}
          <div className={'overflow-x-auto border border-gray-200 rounded'}>
            <table className={'w-full text-xs text-left text-gray-700'}>
              <thead className={'bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200'}>
                <tr>
                  <th className={'px-3 py-2 w-12 text-center'}>#</th>
                  <th className={'px-3 py-2'}>Employee</th>
                  <th className={'px-3 py-2 text-center w-24'}>Status</th>
                  {!readOnly && <th className={'px-3 py-2 text-center w-28'}>Action</th>}
                </tr>
              </thead>
              <tbody className={'divide-y divide-gray-200 bg-white'}>
                {assignedEmployees && assignedEmployees.length > 0 ? (
                  assignedEmployees.map((emp, idx) => {
                    const empId = emp.employeeId || emp.id
                    const displayName =
                      emp.employeeDisplay ||
                      (emp.employeeName
                        ? `${emp.employeeName}${emp.employeeCode ? ` (${emp.employeeCode})` : ''}`
                        : emp.employeeCode || `Employee #${empId}`)
                    const empStatus = emp.status !== undefined && emp.status !== null ? Number(emp.status) : 1

                    return (
                      <tr key={empId || idx} className={'hover:bg-gray-50/70 transition-colors'}>
                        <td className={'px-3 py-2 text-center text-gray-500 font-medium'}>
                          {idx + 1}
                        </td>
                        <td className={'px-3 py-2 font-medium text-gray-800'}>
                          {displayName}
                        </td>
                        <td className={'px-3 py-2 text-center'}>
                          <span
                            className={
                              empStatus === 1
                                ? 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#32c497] text-white'
                                : 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-400 text-white'
                            }
                          >
                            {empStatus === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {!readOnly && (
                          <td className={'px-3 py-2 text-center'}>
                            <div className={'flex items-center justify-center gap-1.5'}>
                              {/* Change Status Button */}
                              <button
                                type={'button'}
                                onClick={() => onToggleStatus && onToggleStatus(empId, emp)}
                                title={empStatus === 1 ? 'Change Status to Inactive' : 'Change Status to Active'}
                                className={
                                  'inline-flex items-center justify-center w-6 h-6 rounded bg-[#48757c] hover:bg-[#3b6268] text-white shadow-xs transition-colors focus:outline-none'
                                }
                              >
                                <svg
                                  className={'w-3.5 h-3.5'}
                                  fill={'none'}
                                  stroke={'currentColor'}
                                  viewBox={'0 0 24 24'}
                                >
                                  <path
                                    strokeLinecap={'round'}
                                    strokeLinejoin={'round'}
                                    strokeWidth={2}
                                    d={'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'}
                                  />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                type={'button'}
                                onClick={() => onRemoveEmployee && onRemoveEmployee(empId, emp)}
                                title={'Remove Employee'}
                                className={
                                  'inline-flex items-center justify-center w-6 h-6 rounded bg-[#ea5455] hover:bg-[#d63b3c] text-white shadow-xs transition-colors focus:outline-none'
                                }
                              >
                                <svg
                                  className={'w-3.5 h-3.5'}
                                  fill={'none'}
                                  stroke={'currentColor'}
                                  viewBox={'0 0 24 24'}
                                >
                                  <path
                                    strokeLinecap={'round'}
                                    strokeLinejoin={'round'}
                                    strokeWidth={2}
                                    d={'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'}
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={readOnly ? 3 : 4}
                      className={'px-3 py-4 text-center text-xs text-gray-400 italic'}
                    >
                      No employees assigned to this warehouse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Employee Modal */}
        <AssignEmployeeModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          warehouseName={values.WAREHOUSE_NAME}
          employeeOptions={employeeOptions}
          alreadyAssignedIds={(assignedEmployees || []).map((e) => String(e.employeeId || e.id))}
          onAssign={(selectedEmps, selectedIds) => onAddEmployees(selectedEmps, selectedIds)}
        />

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
                Edit Warehouse
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

export default ItemWarehouseForm

