/** @file Menu Permission form using the project's standard add-then-list pattern. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')
}

function DeleteIcon() {
  return (
    <svg viewBox={'0 0 24 24'} className={'size-4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}>
      <path d={'M4 7h16'} />
      <path d={'M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5'} />
    </svg>
  )
}

function StatusBadge({ status }) {
  const active = String(status) === '1'
  return (
    <span className={[
      'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
      active ? 'bg-action-success' : 'bg-action-danger',
    ].join(' ')}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function MenuPermissionForm({
  moduleId,
  moduleOptions = [],
  entryValues,
  errors,
  rows = [],
  permissionNameRef,
  allowMultiple = false,
  onModuleChange,
  onEntryChange,
  onAdd,
  onRemove,
}) {
  const permissionInputError = errors.PERMISSION_NAME || errors.PERMISSIONS

  return (
    <>
      <div className={'erp-menu-permission-module'}>
        <label className={'erp-field-label'} htmlFor={'MODULE_ID'}>
          Module Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
        </label>
        <select
          id={'MODULE_ID'}
          name={'MODULE_ID'}
          className={fieldClass(errors.MODULE_ID)}
          value={moduleId}
          disabled={allowMultiple && rows.length > 0}
          required
          aria-invalid={Boolean(errors.MODULE_ID)}
          aria-describedby={errors.MODULE_ID ? 'MODULE_ID-error' : undefined}
          onChange={(event) => onModuleChange(event.target.value)}
        >
          <option value={''}>--Select Module--</option>
          {moduleOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FieldError id={'MODULE_ID-error'} message={errors.MODULE_ID} />
      </div>

      <div className={'erp-role-divider'} />

      <div className={`erp-menu-permission-entry-grid${allowMultiple ? '' : ' erp-menu-permission-entry-grid-single'}`}>
        <div>
          <label className={'erp-field-label'} htmlFor={'PERMISSION_NAME'}>
            Permission Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
          </label>
          <input
            ref={permissionNameRef}
            id={'PERMISSION_NAME'}
            name={'PERMISSION_NAME'}
            type={'text'}
            className={fieldClass(permissionInputError)}
            value={entryValues.PERMISSION_NAME}
            maxLength={100}
            placeholder={'Enter permission name'}
            required={!allowMultiple}
            aria-invalid={Boolean(permissionInputError)}
            aria-describedby={errors.PERMISSION_NAME ? 'PERMISSION_NAME-error' : errors.PERMISSIONS ? 'PERMISSIONS-error' : undefined}
            onChange={(event) => onEntryChange('PERMISSION_NAME', event.target.value)}
          />
          <FieldError id={'PERMISSION_NAME-error'} message={errors.PERMISSION_NAME} />
        </div>

        <div>
          <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
          <label className={'erp-switch-field'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              checked={entryValues.STATUS === '1'}
              onChange={(event) => onEntryChange('STATUS', event.target.checked ? '1' : '0')}
            />
            <span>Is Active</span>
          </label>
        </div>

        {allowMultiple && (
          <button type={'button'} className={'erp-role-add-button'} aria-label={'Add permission'} title={'Add permission'} onClick={onAdd}>
            <span aria-hidden={'true'}>+</span>
          </button>
        )}
      </div>

      {allowMultiple && (
        <>
          <div className={'erp-role-divider'} />
          <h2 className={'erp-employee-section-title'}>Menu Permission List</h2>
          <div className={'erp-table-wrap'}>
            <table className={'erp-table'} data-table={'PERMISSIONS'}>
              <thead>
                <tr>
                  <th className={'erp-number-column'}>#</th>
                  <th>Permission Name</th>
                  <th className={'erp-status-column'}>Status</th>
                  <th className={'erp-action-column'}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className={'erp-empty-cell'} colSpan={4}>No permission has been added.</td>
                  </tr>
                ) : rows.map((row, index) => (
                  <tr key={row.key}>
                    <td className={'erp-number-column'}>{index + 1}</td>
                    <td>{row.PERMISSION_NAME}</td>
                    <td className={'erp-status-column'}><StatusBadge status={row.STATUS} /></td>
                    <td className={'erp-action-column'}>
                      <button type={'button'} className={'erp-role-delete-button'} aria-label={`Remove ${row.PERMISSION_NAME}`} title={'Remove'} onClick={() => onRemove(row.key)}>
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FieldError id={'PERMISSIONS-error'} message={errors.PERMISSIONS} />
        </>
      )}
    </>
  )
}

export default MenuPermissionForm
