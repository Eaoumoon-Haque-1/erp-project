/**
 * @file Exact screenshot-aligned form presentation for AFM Chart of Accounts.
 * Features horizontal radio button groups, clean inputs, and responsive layout.
 */
import SearchableSelect from './SearchableSelect'
import {
  LEDGER_HEAD_OPTIONS,
  ACCOUNT_HEAD_TYPE_OPTIONS,
  ACCOUNT_USAGE_OPTIONS,
  ACCOUNTS_SOURCE_OPTIONS,
  LEVEL_OPTIONS,
} from '../validation/afmChartOfAccountsValidation'

function FieldError({ id, message }) {
  if (!message) return null
  return <p id={id} className="text-xs text-rose-600 mt-1">{message}</p>
}

function AfmChartOfAccountsForm({
  title = 'New Account Head',
  values,
  errors = {},
  businessUnitName = '',
  parentAccountOptions = [],
  parentsLoading = false,
  submitting = false,
  isEdit = false,
  onChange,
  onParentChange,
  onSubmit,
  onReset,
  onDelete,
}) {
  const formBody = (
    <div className="space-y-3 text-xs sm:text-sm">
      {/* 1. Business Unit */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="BUSINESS_UNIT_DISPLAY">
          Business Unit<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="BUSINESS_UNIT_DISPLAY"
          type="text"
          readOnly
          value={businessUnitName || '--Select Business Unit First--'}
          className="w-full h-8 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700 text-xs sm:text-sm cursor-not-allowed focus:outline-none"
        />
        <FieldError id="BU_ID-error" message={errors.BU_ID} />
      </div>

      {/* 2. Account Code */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="ACCOUNT_CODE">
          Account Code<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="ACCOUNT_CODE"
          name="ACCOUNT_CODE"
          type="text"
          placeholder="Enter Account Code"
          value={values.ACCOUNT_CODE || ''}
          onChange={onChange}
          maxLength={50}
          className={`w-full h-8 px-3 py-1 border rounded text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
            errors.ACCOUNT_CODE ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300'
          }`}
        />
        <FieldError id="ACCOUNT_CODE-error" message={errors.ACCOUNT_CODE} />
      </div>

      {/* 3. Account Head */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="ACCOUNT_HEAD_NAME">
          Account Head<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="ACCOUNT_HEAD_NAME"
          name="ACCOUNT_HEAD_NAME"
          type="text"
          placeholder="Enter Account Code"
          value={values.ACCOUNT_HEAD_NAME || ''}
          onChange={onChange}
          maxLength={150}
          className={`w-full h-8 px-3 py-1 border rounded text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
            errors.ACCOUNT_HEAD_NAME ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300'
          }`}
        />
        <FieldError id="ACCOUNT_HEAD_NAME-error" message={errors.ACCOUNT_HEAD_NAME} />
      </div>

      {/* 4. Ledger Head (Radio Buttons) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Ledger Head<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-4 pt-0.5">
          {LEDGER_HEAD_OPTIONS.map((item) => (
            <label key={item} className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="LEDGER_HEAD"
                value={item}
                checked={values.LEDGER_HEAD === item}
                onChange={onChange}
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
              />
              {item}
            </label>
          ))}
        </div>
        <FieldError id="LEDGER_HEAD-error" message={errors.LEDGER_HEAD} />
      </div>

      {/* 5. Account Type (Radio Buttons) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Account Type<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-4 pt-0.5">
          {ACCOUNT_HEAD_TYPE_OPTIONS.map((item) => (
            <label key={item} className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="ACCOUNT_HEAD_TYPE"
                value={item}
                checked={values.ACCOUNT_HEAD_TYPE === item}
                onChange={onChange}
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
              />
              {item}
            </label>
          ))}
        </div>
        <FieldError id="ACCOUNT_HEAD_TYPE-error" message={errors.ACCOUNT_HEAD_TYPE} />
      </div>

      {/* 6. Parent Account Head */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="PARENT_ACCOUNT_HEAD">
          Parent Account Head
        </label>
        <SearchableSelect
          id="PARENT_ACCOUNT_HEAD"
          name="PARENT_ACCOUNT_HEAD"
          value={values.PARENT_ACCOUNT_HEAD || ''}
          options={parentAccountOptions}
          disabled={parentsLoading || !values.BU_ID}
          placeholder={
            parentsLoading
              ? 'Loading Parent Accounts...'
              : !values.BU_ID
              ? '--Select Business Unit First--'
              : '--Select / Type Parent Account Head--'
          }
          emptyOptionLabel="--None (Root Account)--"
          error={errors.PARENT_ACCOUNT_HEAD}
          onChange={(val) => {
            const simulatedEvent = {
              target: {
                name: 'PARENT_ACCOUNT_HEAD',
                value: val,
              },
            }
            if (onParentChange) {
              onParentChange(simulatedEvent)
            } else if (onChange) {
              onChange(simulatedEvent)
            }
          }}
        />
        <FieldError id="PARENT_ACCOUNT_HEAD-error" message={errors.PARENT_ACCOUNT_HEAD} />
      </div>

      {/* 7. Parent Account Code */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="PARENT_ACCOUNT_CODE">
          Parent Account Code
        </label>
        <input
          id="PARENT_ACCOUNT_CODE"
          name="PARENT_ACCOUNT_CODE"
          type="text"
          readOnly
          placeholder="Select Account Type First"
          value={values.PARENT_ACCOUNT_CODE || ''}
          className="w-full h-8 px-3 py-1 border border-gray-300 rounded bg-gray-100 text-gray-700 text-xs sm:text-sm cursor-not-allowed focus:outline-none"
        />
      </div>

      {/* 8. Sort Order No. */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="SORT_ORDER">
          Sort Order No.
        </label>
        <input
          id="SORT_ORDER"
          name="SORT_ORDER"
          type="text"
          placeholder="Enter Sort Order No."
          value={values.SORT_ORDER || ''}
          onChange={onChange}
          className="w-full h-8 px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
        />
        <FieldError id="SORT_ORDER-error" message={errors.SORT_ORDER} />
      </div>

      {/* 9. Account Usage (Radio Buttons) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Account Usage<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-4 pt-0.5">
          {ACCOUNT_USAGE_OPTIONS.map((item) => (
            <label key={item} className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="ACCOUNT_USAGE"
                value={item}
                checked={values.ACCOUNT_USAGE === item}
                onChange={onChange}
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
              />
              {item}
            </label>
          ))}
        </div>
        <FieldError id="ACCOUNT_USAGE-error" message={errors.ACCOUNT_USAGE} />
      </div>

      {/* 10. Account Source (Radio Buttons) */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Account Source<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-4 pt-0.5">
          {ACCOUNTS_SOURCE_OPTIONS.map((item) => (
            <label key={item} className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="ACCOUNTS_SOURCE"
                value={item}
                checked={values.ACCOUNTS_SOURCE === item}
                onChange={onChange}
                className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
              />
              {item}
            </label>
          ))}
        </div>
        <FieldError id="ACCOUNTS_SOURCE-error" message={errors.ACCOUNTS_SOURCE} />
      </div>

      {/* 11. Cost Center Mandatory */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Cost Center Mandatory<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex gap-4 pt-0.5">
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="IS_COST_CENTER_MANDATORY"
              value="1"
              checked={values.IS_COST_CENTER_MANDATORY === '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            Yes
          </label>
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="IS_COST_CENTER_MANDATORY"
              value="0"
              checked={values.IS_COST_CENTER_MANDATORY !== '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            No
          </label>
        </div>
      </div>

      {/* 12. Is Budget Account Head */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Is Budget Account Head<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex gap-4 pt-0.5">
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="IS_BUDGET_ACC_HEAD"
              value="1"
              checked={values.IS_BUDGET_ACC_HEAD === '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            Yes
          </label>
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="IS_BUDGET_ACC_HEAD"
              value="0"
              checked={values.IS_BUDGET_ACC_HEAD !== '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            No
          </label>
        </div>
      </div>

      {/* 13. Level */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="LEVEL">
          Level<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <select
          id="LEVEL"
          name="LEVEL"
          value={values.LEVEL || '1'}
          onChange={onChange}
          className="w-full h-8 px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Level</option>
          {LEVEL_OPTIONS.map((lvl) => (
            <option key={lvl} value={String(lvl)}>
              Level {lvl}
            </option>
          ))}
        </select>
        <FieldError id="LEVEL-error" message={errors.LEVEL} />
      </div>

      {/* 14. Is Active */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Is Active<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="flex gap-4 pt-0.5">
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="STATUS"
              value="1"
              checked={values.STATUS === '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            Yes
          </label>
          <label className="inline-flex items-center text-xs text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="STATUS"
              value="0"
              checked={values.STATUS !== '1'}
              onChange={onChange}
              className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 accent-teal-600 mr-1.5"
            />
            No
          </label>
        </div>
      </div>

      {/* 15. Action Buttons */}
      {onSubmit && (
        <div className="pt-2 flex items-center space-x-3">
          <button
            type="submit"
            disabled={submitting || !values.BU_ID}
            className="px-6 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#4a7c82] hover:bg-[#3d676c] disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-sm transition-colors"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Submit'}
          </button>

          {isEdit && onDelete && (
            <button
              type="button"
              disabled={submitting}
              onClick={onDelete}
              className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-sm transition-colors"
            >
              Delete
            </button>
          )}

          {onReset && (
            <button
              type="button"
              disabled={submitting}
              onClick={onReset}
              className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded shadow-sm transition-colors"
            >
              {isEdit ? 'Cancel' : 'Reset'}
            </button>
          )}
        </div>
      )}
    </div>
  )

  // If onSubmit is provided, render within a self-contained card container
  if (onSubmit) {
    return (
      <div className="bg-white rounded border border-gray-200 shadow-sm p-4 min-h-[620px]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          {isEdit && onReset && (
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
              onClick={onReset}
            >
              + New Head
            </button>
          )}
        </div>
        <form onSubmit={onSubmit} noValidate>
          {formBody}
        </form>
      </div>
    )
  }

  // If no onSubmit provided, render fields directly (e.g. inside external FormPage/ActionForm)
  return formBody
}

export default AfmChartOfAccountsForm
