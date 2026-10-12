/** @file Controlled Custodian form with repeatable ASSET_CUSTODIAN_DTL rows. */
import { isRequired } from '../../../../config/devFlags'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function CustodianForm({
  values,
  errors,
  rows,
  groupName,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  custodianNameRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  return (
    <>
      <div className={'erp-form-grid'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'CUSTODIAN_BG_ID-display'}>Group Name</label>
          <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
          <input
            id={'CUSTODIAN_BG_ID-display'}
            className={'erp-form-control erp-readonly'}
            type={'text'}
            value={groupName}
            readOnly
          />
        </div>

        <div>
          <label className={'erp-field-label'} htmlFor={'BU_ID'}>
            Business Unit<span className={'erp-required'} aria-hidden={'true'}>*</span>
          </label>
          <select
            id={'BU_ID'}
            name={'BU_ID'}
            className={fieldClass(errors.BU_ID, businessUnitLocked)}
            value={values.BU_ID}
            required
            disabled={unitsLoading || businessUnitLocked}
            aria-invalid={Boolean(errors.BU_ID)}
            aria-describedby={errors.BU_ID ? 'BU_ID-error' : undefined}
            onChange={onChange}
          >
            <option value={''}>
              {unitsLoading ? 'Loading Business Units...' : '--Select Business Unit--'}
            </option>
            {businessUnitOptions.map((unit) => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
          <FieldError id={'BU_ID-error'} message={errors.BU_ID} />
        </div>

        <div>
          <label className={'erp-field-label'} htmlFor={'CUSTODIAN_NAME'}>
            Custodian Name{isRequired() && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
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
            required={isRequired()}
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

      <h2 className={'erp-employee-section-title'}>Sub Custodian</h2>
      <div className={'erp-table-wrap'}>
        <table className={'erp-table erp-custodian-table'} data-table={'ASSET_CUSTODIAN_DTL'}>
          <thead>
            <tr>
              <th className={'erp-number-column'}>#</th>
              <th>Sub Custodian Name</th>
              <th className={'erp-status-column'}>Is Active?</th>
              <th className={'erp-action-column'}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={'erp-empty-cell'} colSpan={4}>No Sub Custodian has been added.</td>
              </tr>
            ) : rows.map((row, index) => {
              const error = errors.subRows?.[row._ROW_ID]
              return (
                <tr key={row._ROW_ID}>
                  <td className={'erp-number-column'}>{index + 1}</td>
                  <td>
                    <input
                      id={`SUB_CUSTODIAN_NAME-${row._ROW_ID}`}
                      name={'SUB_CUSTODIAN_NAME'}
                      type={'text'}
                      className={fieldClass(error)}
                      value={row.SUB_CUSTODIAN_NAME}
                      minLength={2}
                      maxLength={100}
                      placeholder={'Enter sub custodian name'}
                      aria-label={`Sub Custodian Name ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `SUB_CUSTODIAN_NAME-${row._ROW_ID}-error` : undefined}
                      onChange={(event) => onRowChange(row._ROW_ID, 'SUB_CUSTODIAN_NAME', event.target.value)}
                    />
                    <FieldError id={`SUB_CUSTODIAN_NAME-${row._ROW_ID}-error`} message={error} />
                  </td>
                  <td className={'erp-status-column'}>
                    <label className={'erp-switch-field justify-center'}>
                      <input
                        className={'erp-switch-control'}
                        type={'checkbox'}
                        role={'switch'}
                        name={'STATUS'}
                        checked={row.STATUS === '1'}
                        aria-label={`Sub Custodian ${index + 1} is active`}
                        onChange={(event) => onRowChange(row._ROW_ID, 'STATUS', event.target.checked ? '1' : '0')}
                      />
                      <span>{row.STATUS === '1' ? 'Active' : 'Inactive'}</span>
                    </label>
                  </td>
                  <td className={'erp-action-column'}>
                    <button
                      type={'button'}
                      className={'erp-remove-row-button'}
                      aria-label={`Remove sub custodian ${index + 1}`}
                      title={'Remove'}
                      onClick={() => onRemoveRow(row)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button type={'button'} className={'primary-button erp-add-row-button'} onClick={onAddRow}>+ Add More</button>
    </>
  )
}

export default CustodianForm
