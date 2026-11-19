/**
 * @file Controlled Asset Item Information entry form.
 * Matches standard compact entry layout with audit log block.
 */

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

function ReadonlyField({ id, name, label, value, error }) {
  return (
    <div>
      <label className={'block text-xs font-medium text-gray-700 mb-1'} htmlFor={id || name}>
        {label}
      </label>
      <input
        id={id || name}
        name={name}
        type={'text'}
        className={inputClass(error, true)}
        value={value || ''}
        readOnly
      />
      <FieldError id={`${id || name}-error`} message={error} />
    </div>
  )
}

function AssetItemInformationForm({
  values,
  errors = {},
  references = {},
  auditLog = null,
  submitLabel = '',
  submitting = false,
  itemNameRef,
  onChange,
}) {
  const { assetGroups = [], depreciationCategories = [], uomOptions = [] } = references

  return (
    <div className={'space-y-4 text-xs sm:text-sm'}>
      {/* =========================================================================
          SECTION 1: ASSET ITEM INFORMATION (ENTRY FORM)
          ========================================================================= */}
      <div className={'bg-white p-4 rounded border border-gray-200 shadow-xs'}>
        <div className={'flex flex-col gap-3.5 max-w-lg'}>
          {/* 1. Item Name */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ITEM_NAME'}
            >
              Item Name<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <input
              ref={itemNameRef}
              id={'ITEM_NAME'}
              name={'ITEM_NAME'}
              type={'text'}
              className={inputClass(errors.ITEM_NAME)}
              value={values.ITEM_NAME || ''}
              maxLength={100}
              placeholder={'Enter item name'}
              required
              aria-invalid={Boolean(errors.ITEM_NAME)}
              aria-describedby={errors.ITEM_NAME ? 'ITEM_NAME-error' : undefined}
              onChange={onChange}
            />
            <FieldError id={'ITEM_NAME-error'} message={errors.ITEM_NAME} />
          </div>

          {/* 2. Item Group */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ITEM_GROUP'}
            >
              Item Group<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ITEM_GROUP'}
              name={'ITEM_GROUP'}
              className={inputClass(errors.ITEM_GROUP)}
              value={values.ITEM_GROUP || ''}
              required
              aria-invalid={Boolean(errors.ITEM_GROUP)}
              aria-describedby={errors.ITEM_GROUP ? 'ITEM_GROUP-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Asset Group--</option>
              {assetGroups.map((record) => (
                <option key={record.ID} value={record.ID}>
                  {record.ASSET_GROUP}
                </option>
              ))}
            </select>
            <FieldError id={'ITEM_GROUP-error'} message={errors.ITEM_GROUP} />
          </div>

          {/* 3. Depreciation Category */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'ASSET_DEPRI_CATE_ID'}
            >
              Depreciation Category<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'ASSET_DEPRI_CATE_ID'}
              name={'ASSET_DEPRI_CATE_ID'}
              className={inputClass(errors.ASSET_DEPRI_CATE_ID)}
              value={values.ASSET_DEPRI_CATE_ID || ''}
              required
              aria-invalid={Boolean(errors.ASSET_DEPRI_CATE_ID)}
              aria-describedby={errors.ASSET_DEPRI_CATE_ID ? 'ASSET_DEPRI_CATE_ID-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select Depreciation Category--</option>
              {depreciationCategories.map((record) => (
                <option key={record.ID} value={record.ID}>
                  {record.DEPRI_CATEGORY}
                </option>
              ))}
            </select>
            <FieldError id={'ASSET_DEPRI_CATE_ID-error'} message={errors.ASSET_DEPRI_CATE_ID} />
          </div>

          {/* 4. UOM */}
          <div>
            <label
              className={'block text-xs font-medium text-gray-700 mb-1'}
              htmlFor={'UOM'}
            >
              UOM<span className={'text-rose-500 ml-0.5'}>*</span>
            </label>
            <select
              id={'UOM'}
              name={'UOM'}
              className={inputClass(errors.UOM)}
              value={values.UOM || ''}
              required
              aria-invalid={Boolean(errors.UOM)}
              aria-describedby={errors.UOM ? 'UOM-error' : undefined}
              onChange={onChange}
            >
              <option value={''}>--Select UOM--</option>
              {uomOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError id={'UOM-error'} message={errors.UOM} />
          </div>

          {/* 5. Read-only derived fields */}
          <ReadonlyField
            id={'DEPRI_METHOD'}
            name={'DEPRI_METHOD'}
            label={'Depreciation Method'}
            value={values.DEPRI_METHOD}
            error={errors.DEPRI_METHOD}
          />

          <ReadonlyField
            id={'CATEGORY_TYPE'}
            name={'CATEGORY_TYPE'}
            label={'Asset Type'}
            value={values.CATEGORY_TYPE}
            error={errors.CATEGORY_TYPE}
          />

          <ReadonlyField
            id={'DEPRI_LIFE'}
            name={'DEPRI_LIFE'}
            label={'Depreciation Life (Months)'}
            value={values.DEPRI_LIFE}
            error={errors.DEPRI_LIFE}
          />

          <ReadonlyField
            id={'DEPRI_PERCENTAGE'}
            name={'DEPRI_PERCENTAGE'}
            label={'Depreciation (%)'}
            value={values.DEPRI_PERCENTAGE}
            error={errors.DEPRI_PERCENTAGE}
          />

          <ReadonlyField
            id={'ASSET_OWNER'}
            name={'ASSET_OWNER'}
            label={'Asset Owner'}
            value={values.ASSET_OWNER}
            error={errors.ASSET_OWNER}
          />

          {/* 6. is active ? */}
          <div>
            <span className={'block text-xs font-medium text-gray-700 mb-1'}>
              is active ?<span className={'text-rose-500 ml-0.5'}>*</span>
            </span>
            <div className={'flex items-center h-8'}>
              <label className={'erp-switch-field cursor-pointer !h-8 !w-auto !text-xs gap-2'}>
                <input
                  id={'ASSET_ITEM_STATUS'}
                  className={'erp-switch-control'}
                  type={'checkbox'}
                  role={'switch'}
                  name={'STATUS'}
                  checked={values.STATUS === '1'}
                  onChange={onChange}
                />
                <span className={'text-xs font-medium text-gray-700 select-none'}>
                  {values.STATUS === '1' ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* 7. Action buttons (Reset & Save / Update) directly inside the form card on left side */}
          {submitLabel && (
            <div className={'flex items-center gap-2 pt-1'}>
              <button
                type={'reset'}
                className={'secondary-button'}
                disabled={submitting}
              >
                Reset
              </button>
              <button
                type={'submit'}
                className={'primary-button'}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : submitLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: AUDIT LOG DATA (DISPLAYED ON EDIT)
          ========================================================================= */}
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
                String(values.STATUS ?? auditLog.STATUS ?? '1') === '1'
                  ? 'bg-[#32c497]'
                  : 'bg-[#fa5c70]',
              ].join(' ')}
            >
              {String(values.STATUS ?? auditLog.STATUS ?? '1') === '1'
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
                  {formatAuditDateTime(auditLog.CREATED_DATETIME || auditLog.CREATED_AT)}
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
                  {formatAuditDateTime(auditLog.UPDATED_DATETIME || auditLog.UPDATED_AT)}
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

export default AssetItemInformationForm
