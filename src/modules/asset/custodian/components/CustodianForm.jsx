/** @file Controlled Custodian form with repeatable ASSET_CUSTODIAN_DTL rows. */
function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error) {
  return ['erp-form-control', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
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

function CustodianForm({
  values,
  entryValues,
  errors,
  rows,
  custodianNameRef,
  subCustodianNameRef,
  onChange,
  onEntryChange,
  onAdd,
  onRemove,
}) {
  return (
    <>
      <div className={'erp-form-grid'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'CUSTODIAN_NAME'}>
            Custodian Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
          </label>
          <input
            ref={custodianNameRef}
            id={'CUSTODIAN_NAME'}
            name={'CUSTODIAN_NAME'}
            type={'text'}
            className={fieldClass(errors.CUSTODIAN_NAME)}
            value={values.CUSTODIAN_NAME}
            minLength={2}
            maxLength={100}
            placeholder={'Enter custodian name'}
            required
            aria-invalid={Boolean(errors.CUSTODIAN_NAME)}
            aria-describedby={errors.CUSTODIAN_NAME ? 'CUSTODIAN_NAME-error' : undefined}
            onChange={onChange}
          />
          <FieldError id={'CUSTODIAN_NAME-error'} message={errors.CUSTODIAN_NAME} />
        </div>

        <div>
          <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
          <label className={'erp-switch-field'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'STATUS'}
              checked={values.STATUS === '1'}
              onChange={onChange}
            />
            <span>Is Active</span>
          </label>
        </div>
      </div>

      <div className={'erp-role-divider'} />

      <div className={'erp-custodian-entry-grid'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'SUB_CUSTODIAN_NAME'}>
            Sub Custodian Name<span className={'erp-required'} aria-hidden={'true'}>*</span>
          </label>
          <input
            ref={subCustodianNameRef}
            id={'SUB_CUSTODIAN_NAME'}
            name={'SUB_CUSTODIAN_NAME'}
            type={'text'}
            className={fieldClass(errors.SUB_CUSTODIAN_NAME)}
            value={entryValues.SUB_CUSTODIAN_NAME}
            minLength={2}
            maxLength={100}
            placeholder={'Enter sub custodian name'}
            aria-invalid={Boolean(errors.SUB_CUSTODIAN_NAME)}
            aria-describedby={errors.SUB_CUSTODIAN_NAME ? 'SUB_CUSTODIAN_NAME-error' : undefined}
            onChange={onEntryChange}
          />
          <FieldError id={'SUB_CUSTODIAN_NAME-error'} message={errors.SUB_CUSTODIAN_NAME} />
        </div>

        <div>
          <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
          <label className={'erp-switch-field'}>
            <input
              className={'erp-switch-control'}
              type={'checkbox'}
              role={'switch'}
              name={'STATUS'}
              checked={entryValues.STATUS === '1'}
              onChange={onEntryChange}
            />
            <span>Is Active</span>
          </label>
        </div>

        <button type={'button'} className={'erp-role-add-button'} aria-label={'Add sub custodian'} title={'Add'} onClick={onAdd}>
          <span aria-hidden={'true'}>+</span>
        </button>
      </div>

      <div className={'erp-role-divider'} />

      <h2 className={'erp-employee-section-title'}>Sub Custodian List</h2>
      <div className={'erp-table-wrap'}>
        <table className={'erp-table erp-custodian-table'} data-table={'ASSET_CUSTODIAN_DTL'}>
          <thead>
            <tr>
              <th className={'erp-number-column'}>#</th>
              <th>Sub Custodian Name</th>
              <th className={'erp-status-column'}>Status</th>
              <th className={'erp-action-column'}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={'erp-empty-cell'} colSpan={4}>No Sub Custodian has been added.</td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={row.ID}>
                <td className={'erp-number-column'}>{index + 1}</td>
                <td>{row.SUB_CUSTODIAN_NAME}</td>
                <td className={'erp-status-column'}><StatusBadge status={row.STATUS} /></td>
                <td className={'erp-action-column'}>
                  <button type={'button'} className={'erp-role-delete-button'} aria-label={`Remove ${row.SUB_CUSTODIAN_NAME}`} title={'Remove'} onClick={() => onRemove(row.ID)}>
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FieldError id={'SUB_CUSTODIANS-error'} message={errors.SUB_CUSTODIANS} />
    </>
  )
}

export default CustodianForm
