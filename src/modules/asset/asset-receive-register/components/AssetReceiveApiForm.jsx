/**
 * @file Controlled Asset Receive form for the API-backed page (sections follow
 * the spec mockup). The older AssetReceiveRegisterForm.jsx still serves the
 * mock Bulk Asset Receive page.
 */
import DateInput from '../../../../components/shared/DateInput'
import { isRequired } from '../../../../config/devFlags'

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function Label({ name, text, required }) {
  return (
    <label className={'erp-field-label'} htmlFor={name}>
      {text}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
    </label>
  )
}

// Dropdown of ids: always required because the id is needed for the request.
function SelectField({ name, label, value, error, options, loading, disabled = false, locked = false, placeholder, onChange }) {
  return (
    <div>
      <Label name={name} text={label} required />
      <select
        id={name}
        name={name}
        className={fieldClass(error, locked)}
        value={value}
        required
        disabled={loading || disabled || locked}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={''}>{loading ? 'Loading...' : placeholder ?? `--Select ${label}--`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function TextField({ name, label, value, error, maxLength, type = 'text', mustFill = false, required, step, inputRef, onChange }) {
  const requiredMark = required ?? mustFill
  return (
    <div>
      <Label name={name} text={label} required={requiredMark} />
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        className={fieldClass(error)}
        value={value}
        maxLength={maxLength}
        step={step}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={requiredMark}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function DateField({ name, label, value, error, max, min, mustFill = false, onChange }) {
  return (
    <div>
      <Label name={name} text={label} required={mustFill} />
      <DateInput
        id={name}
        name={name}
        value={value}
        max={max}
        min={min}
        className={fieldClass(error)}
        required={mustFill}
        aria-invalid={error ? 'true' : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  )
}

function ReadOnlyField({ id, label, value }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={id}>{label}</label>
      <input id={id} className={'erp-form-control erp-readonly'} type={'text'} value={value} readOnly />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className={'erp-asset-receive-section'}>
      <h2 className={'erp-employee-section-title'}>{title}</h2>
      {children}
    </section>
  )
}

const money = (value) => value.toFixed(2)

function AssetReceiveApiForm({
  values,
  errors,
  rows,
  isEdit = false,
  groupName,
  options,
  referencesLoading = false,
  businessUnitOptions = [],
  unitsLoading = false,
  businessUnitLocked = false,
  amounts,
  place,
  today,
  firstFieldRef,
  onChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  const noBusinessUnit = !values.BU_ID
  const loading = referencesLoading
  const warrantyOn = values.WG_APPLICABLE !== 'N/A'
  const mustFill = isRequired()

  return (
    <>
      <Section title={'Asset Primary/Basic Information'}>
        <div className={'erp-form-grid'}>
          <div>
            <label className={'erp-field-label'} htmlFor={'RECEIVE_BG_ID-display'}>Group Name</label>
            <input type={'hidden'} name={'BG_ID'} value={values.BG_ID} />
            <input id={'RECEIVE_BG_ID-display'} className={'erp-form-control erp-readonly'} type={'text'} value={groupName} readOnly />
          </div>
          <SelectField name={'BU_ID'} label={'Business Unit'} value={values.BU_ID} error={errors.BU_ID} options={businessUnitOptions} loading={unitsLoading} locked={businessUnitLocked} onChange={onChange} />
          {isEdit && <ReadOnlyField id={'GRN_NO'} label={'Receive No (GRN)'} value={values.GRN_NO} />}
          <DateField name={'GRN_DATE'} label={'Receive Date'} value={values.GRN_DATE} error={errors.GRN_DATE} max={today} mustFill={mustFill} onChange={onChange} />
          {/* TODO: replace with an employee dropdown when the employee API exists. */}
          <TextField name={'RECEIVED_BY_ID'} label={'Received By (Employee ID)'} type={'number'} step={'1'} value={values.RECEIVED_BY_ID} error={errors.RECEIVED_BY_ID} required inputRef={firstFieldRef} onChange={onChange} />
          <DateField name={'PURCHASE_DATE'} label={'Purchase Date'} value={values.PURCHASE_DATE} error={errors.PURCHASE_DATE} max={today} onChange={onChange} />
          <TextField name={'PURCHASE_THROUGH'} label={'Purchase Through'} value={values.PURCHASE_THROUGH} error={errors.PURCHASE_THROUGH} maxLength={50} onChange={onChange} />
          <TextField name={'PO_NO'} label={'PO No'} value={values.PO_NO} error={errors.PO_NO} maxLength={50} onChange={onChange} />
          <TextField name={'REQ_NO'} label={'Req No'} value={values.REQ_NO} error={errors.REQ_NO} maxLength={50} onChange={onChange} />
          <SelectField name={'SUPPLIER_ID'} label={'Supplier'} value={values.SUPPLIER_ID} error={errors.SUPPLIER_ID} options={options.supplier} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'CURRENCY_ID'} label={'Currency'} value={values.CURRENCY_ID} error={errors.CURRENCY_ID} options={options.currency} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'ITEM_NAME_ID'} label={'Asset Item Name'} value={values.ITEM_NAME_ID} error={errors.ITEM_NAME_ID} options={options.item} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'UOM_ID'} label={'UOM'} value={values.UOM_ID} error={errors.UOM_ID} options={options.uom} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <TextField name={'ASSET_NO'} label={'Asset Number'} value={values.ASSET_NO} error={errors.ASSET_NO} maxLength={50} onChange={onChange} />
        </div>
      </Section>

      <Section title={'Asset Item Specification'}>
        <div className={'erp-table-wrap'}>
          <table className={'erp-table erp-custodian-table'} data-table={'ASSET_ITEM_SPEC'}>
            <thead>
              <tr>
                <th className={'erp-number-column'}>#</th>
                <th>Equipment Name</th>
                <th>Equipment Value</th>
                <th className={'erp-status-column'}>Is Active?</th>
                <th className={'erp-action-column'}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className={'erp-empty-cell'} colSpan={5}>No Specification has been added.</td>
                </tr>
              ) : rows.map((row, index) => {
                const rowErrors = errors.specRows?.[row._ROW_ID] ?? {}
                return (
                  <tr key={row._ROW_ID}>
                    <td className={'erp-number-column'}>{index + 1}</td>
                    <td>
                      <input
                        name={'EQUIPMENT_NAME'}
                        type={'text'}
                        className={fieldClass(rowErrors.EQUIPMENT_NAME)}
                        value={row.EQUIPMENT_NAME}
                        maxLength={50}
                        placeholder={'Enter equipment name'}
                        aria-label={`Equipment Name ${index + 1}`}
                        aria-invalid={Boolean(rowErrors.EQUIPMENT_NAME)}
                        onChange={(event) => onRowChange(row._ROW_ID, 'EQUIPMENT_NAME', event.target.value)}
                      />
                      <FieldError message={rowErrors.EQUIPMENT_NAME} />
                    </td>
                    <td>
                      <input
                        name={'EQUIPMENT_VALUE'}
                        type={'text'}
                        className={fieldClass(rowErrors.EQUIPMENT_VALUE)}
                        value={row.EQUIPMENT_VALUE}
                        maxLength={100}
                        placeholder={'Enter equipment value'}
                        aria-label={`Equipment Value ${index + 1}`}
                        aria-invalid={Boolean(rowErrors.EQUIPMENT_VALUE)}
                        onChange={(event) => onRowChange(row._ROW_ID, 'EQUIPMENT_VALUE', event.target.value)}
                      />
                      <FieldError message={rowErrors.EQUIPMENT_VALUE} />
                    </td>
                    <td className={'erp-status-column'}>
                      <label className={'erp-switch-field justify-center'}>
                        <input
                          className={'erp-switch-control'}
                          type={'checkbox'}
                          role={'switch'}
                          name={'STATUS'}
                          checked={row.STATUS === '1'}
                          aria-label={`Specification ${index + 1} is active`}
                          onChange={(event) => onRowChange(row._ROW_ID, 'STATUS', event.target.checked ? '1' : '0')}
                        />
                        <span>{row.STATUS === '1' ? 'Active' : 'Inactive'}</span>
                      </label>
                    </td>
                    <td className={'erp-action-column'}>
                      <button type={'button'} className={'erp-remove-row-button'} aria-label={`Remove specification ${index + 1}`} title={'Remove'} onClick={() => onRemoveRow(row)}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button type={'button'} className={'primary-button erp-add-row-button'} onClick={onAddRow}>+ Add More</button>
      </Section>

      <Section title={'Asset Price Details'}>
        <div className={'erp-form-grid'}>
          <TextField name={'QTY'} label={'Qty'} type={'number'} step={'1'} value={values.QTY} error={errors.QTY} mustFill={mustFill} onChange={onChange} />
          <TextField name={'UNIT_PRICE'} label={'Unit Price'} type={'number'} step={'0.01'} value={values.UNIT_PRICE} error={errors.UNIT_PRICE} mustFill={mustFill} onChange={onChange} />
          <ReadOnlyField id={'GROSS_AMOUNT'} label={'Gross Amount'} value={money(amounts.gross)} />
          <TextField name={'DISCOUNT'} label={'Discount'} type={'number'} step={'0.01'} value={values.DISCOUNT} error={errors.DISCOUNT} onChange={onChange} />
          <TextField name={'VAT_TAX'} label={'VAT/Tax'} type={'number'} step={'0.01'} value={values.VAT_TAX} error={errors.VAT_TAX} onChange={onChange} />
          <TextField name={'OTHER_CHARGES'} label={'Other Charges'} type={'number'} step={'0.01'} value={values.OTHER_CHARGES} error={errors.OTHER_CHARGES} onChange={onChange} />
          <ReadOnlyField id={'CAPITALIZED_COST'} label={'Capitalized Cost'} value={money(amounts.capitalized)} />
        </div>
      </Section>

      <Section title={'Warranty/Guaranty Information'}>
        <div className={'erp-form-grid'}>
          <div>
            <Label name={'WG_APPLICABLE'} text={'Is Applicable?'} required />
            <select id={'WG_APPLICABLE'} name={'WG_APPLICABLE'} className={fieldClass(errors.WG_APPLICABLE)} value={values.WG_APPLICABLE} aria-invalid={Boolean(errors.WG_APPLICABLE)} onChange={onChange}>
              <option value={'N/A'}>N/A</option>
              <option value={'Warranty'}>Warranty</option>
              <option value={'Guaranty'}>Guaranty</option>
            </select>
            <FieldError id={'WG_APPLICABLE-error'} message={errors.WG_APPLICABLE} />
          </div>
          {warrantyOn && (
            <>
              <TextField name={'WG_PERIOD'} label={'Period/Time'} type={'number'} step={'1'} value={values.WG_PERIOD} error={errors.WG_PERIOD} mustFill={mustFill} onChange={onChange} />
              <SelectField name={'WG_TYPE_ID'} label={'Type'} value={values.WG_TYPE_ID} error={errors.WG_TYPE_ID} options={options.warrantyType} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
              <DateField name={'WG_START_DATE'} label={'Start Date'} value={values.WG_START_DATE} error={errors.WG_START_DATE} mustFill={mustFill} onChange={onChange} />
              <DateField name={'WG_END_DATE'} label={'End Date'} value={values.WG_END_DATE} error={errors.WG_END_DATE} min={values.WG_START_DATE || undefined} mustFill={mustFill} onChange={onChange} />
              <TextField name={'WG_OTHER_INFO'} label={'Warranty/Guaranty Other Info'} value={values.WG_OTHER_INFO} error={errors.WG_OTHER_INFO} maxLength={255} onChange={onChange} />
            </>
          )}
        </div>
      </Section>

      <Section title={'Location'}>
        <div className={'erp-form-grid'}>
          <SelectField name={'CUSTODIAN_ID'} label={'Custodian Name'} value={values.CUSTODIAN_ID} error={errors.CUSTODIAN_ID} options={options.custodian} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'SUB_CUSTODIAN_ID'} label={'Sub Custodian Name'} value={values.SUB_CUSTODIAN_ID} error={errors.SUB_CUSTODIAN_ID} options={options.subCustodian} disabled={!values.CUSTODIAN_ID} onChange={onChange} />
          <SelectField name={'LOCATION_ID'} label={'Location'} value={values.LOCATION_ID} error={errors.LOCATION_ID} options={options.location} disabled={!values.SUB_CUSTODIAN_ID} onChange={onChange} />
          <ReadOnlyField id={'BUILDING'} label={'Building'} value={place.building} />
          <ReadOnlyField id={'FLOOR'} label={'Floor'} value={place.floor} />
          <ReadOnlyField id={'ROOM'} label={'Room'} value={place.room} />
          <TextField name={'RAC'} label={'Rac'} value={values.RAC} error={errors.RAC} maxLength={50} onChange={onChange} />
          <TextField name={'BIN'} label={'Bin'} value={values.BIN} error={errors.BIN} maxLength={50} onChange={onChange} />
        </div>
      </Section>

      <Section title={'Depreciation Information'}>
        <div className={'erp-form-grid'}>
          <SelectField name={'DEPRI_CATEGORY_ID'} label={'Depreciation Category'} value={values.DEPRI_CATEGORY_ID} error={errors.DEPRI_CATEGORY_ID} options={options.category} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'DEPRI_METHOD_ID'} label={'Depreciation Method'} value={values.DEPRI_METHOD_ID} error={errors.DEPRI_METHOD_ID} options={options.method} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <SelectField name={'ASSET_TYPE_ID'} label={'Asset Type'} value={values.ASSET_TYPE_ID} error={errors.ASSET_TYPE_ID} options={options.assetType} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
          <TextField name={'DEPRI_LIFE'} label={'Depreciation Period (Month)'} type={'number'} step={'1'} value={values.DEPRI_LIFE} error={errors.DEPRI_LIFE} mustFill={mustFill} onChange={onChange} />
          <TextField name={'DEPRI_PERCENTAGE'} label={'Depreciation Percentage'} type={'number'} step={'0.01'} value={values.DEPRI_PERCENTAGE} error={errors.DEPRI_PERCENTAGE} mustFill={mustFill} onChange={onChange} />
          <SelectField name={'ASSET_OWNER_ID'} label={'Asset Owner'} value={values.ASSET_OWNER_ID} error={errors.ASSET_OWNER_ID} options={options.owner} loading={loading} disabled={noBusinessUnit} onChange={onChange} />
        </div>
      </Section>

      <div className={'erp-form-grid'}>
        <div>
          <Label name={'REMARKS'} text={'Remarks'} required={false} />
          <textarea id={'REMARKS'} name={'REMARKS'} className={fieldClass(errors.REMARKS)} value={values.REMARKS} maxLength={500} rows={2} placeholder={'Enter remarks'} aria-invalid={Boolean(errors.REMARKS)} aria-describedby={errors.REMARKS ? 'REMARKS-error' : undefined} onChange={onChange} />
          <FieldError id={'REMARKS-error'} message={errors.REMARKS} />
        </div>
        <div>
          <span className={'erp-field-label'} aria-hidden={'true'}>&nbsp;</span>
          <label className={'erp-switch-field'}>
            <input className={'erp-switch-control'} type={'checkbox'} role={'switch'} name={'STATUS'} checked={values.STATUS === '1'} onChange={onChange} />
            <span>Is Active</span>
          </label>
        </div>
      </div>
    </>
  )
}

export default AssetReceiveApiForm
