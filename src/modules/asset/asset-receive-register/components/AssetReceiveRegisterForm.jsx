/** @file Sectioned four-column form for ASSET_RECEIVE_REGISTER. */
import { useState } from 'react'
import { getReceiveLocations, getReceiveSubCustodians } from '../data/assetReceiveRegisterOptions'

const assetReceiveTabs = [
  ['specification', 'Asset Item Specification'],
  ['price', 'Asset Price Details'],
  ['warranty', 'Warranty / Guaranty Information'],
  ['location', 'Location'],
  ['depreciation', 'Depreciation Information'],
]

function FieldError({ id, message }) {
  return message ? <p id={id} className={'erp-field-error'}>{message}</p> : null
}

function fieldClass(error, readOnly = false) {
  return ['erp-form-control', readOnly ? 'erp-readonly' : '', error ? 'erp-form-control-invalid' : '']
    .filter(Boolean)
    .join(' ')
}

function Section({ title, children }) {
  return (
    <section className={'erp-asset-receive-section'}>
      <h2 className={'erp-employee-section-title'}>{title}</h2>
      <div className={'erp-form-grid'}>{children}</div>
    </section>
  )
}

function TabSection({ active, children }) {
  if (!active) return null
  return <div className={'erp-form-grid'}>{children}</div>
}

function InputField({ name, label, values, errors, onChange, type = 'text', required = true, readOnly = false, maxLength, min, step, placeholder, inputRef }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        className={fieldClass(errors[name], readOnly)}
        value={values[name]}
        required={required}
        readOnly={readOnly}
        maxLength={maxLength}
        min={min}
        step={step}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function SelectField({ name, label, values, errors, options, onChange, placeholder, required = true, disabled = false }) {
  return (
    <div>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        className={fieldClass(errors[name], disabled)}
        value={values[name]}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={onChange}
      >
        <option value={''}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function TextAreaField({ name, label, values, errors, onChange, required = false, maxLength = 500, isRemarks = false }) {
  return (
    <div className={isRemarks ? 'erp-asset-remarks-field' : undefined}>
      <label className={'erp-field-label'} htmlFor={name}>
        {label}{required && <span className={'erp-required'} aria-hidden={'true'}>*</span>}
      </label>
      <textarea id={name} name={name} className={[fieldClass(errors[name]), isRemarks ? 'erp-asset-remarks-textarea' : ''].filter(Boolean).join(' ')} value={values[name]} required={required} maxLength={maxLength} rows={isRemarks ? 4 : 2} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} onChange={onChange} />
      <FieldError id={`${name}-error`} message={errors[name]} />
    </div>
  )
}

function AssetReceiveRegisterForm({ values, errors, references, grnRef, onChange, onSpecificationChange }) {
  const [activeTab, setActiveTab] = useState('specification')
  const subCustodians = getReceiveSubCustodians(values.CUSTODIAN_ID, references)
    .map((record) => ({ value: record.ID, label: record.SUB_CUSTODIAN_NAME }))
  const locations = getReceiveLocations(values.CUSTODIAN_ID, values.SUB_CUSTODIAN_ID, references)
    .map((record) => ({ value: record.ID, label: record.LOCATION_NAME }))
  const warrantyApplicable = values.IS_W_G_APPLICABLE !== 'NA'
  const warrantyInfoLabel = values.IS_W_G_APPLICABLE === 'WARRANTY'
    ? 'Warranty Info'
    : values.IS_W_G_APPLICABLE === 'GUARANTY'
      ? 'Guaranty Info'
      : 'Warranty / Guaranty Info'

  return (
    <div className={'erp-asset-receive-form'}>
      <Section title={'Asset Primary / Basic Information'}>
        <InputField name={'GRN_NO'} label={'Receive No (GRN)'} values={values} errors={errors} onChange={onChange} readOnly inputRef={grnRef} />
        <SelectField name={'RECEIVED_BY_ID'} label={'Received By'} values={values} errors={errors} options={references.employees.map((record) => ({ value: record.value, label: `${record.employeeId} - ${record.name}` }))} onChange={onChange} placeholder={'--Select Employee--'} />
        <InputField name={'GRN_DATE'} label={'Receive Date'} values={values} errors={errors} onChange={onChange} type={'date'} />
        <InputField name={'PURCHASE_DATE'} label={'Purchase Date'} values={values} errors={errors} onChange={onChange} type={'date'} />
        <SelectField name={'PURCHASE_THROUGH'} label={'Purchase Through'} values={values} errors={errors} options={references.purchaseThroughOptions} onChange={onChange} placeholder={'--Select Purchase Through--'} />

        <SelectField name={'ITEM_NAME'} label={'Asset Item Name'} values={values} errors={errors} options={references.assetItems.map((record) => ({ value: record.ID, label: record.ITEM_NAME }))} onChange={onChange} placeholder={'--Select Asset Item--'} />
        <InputField name={'PO_NO'} label={'PO No'} values={values} errors={errors} onChange={onChange} required={values.PURCHASE_THROUGH === 'PURCHASE_ORDER'} maxLength={50} placeholder={'Enter PO number'} />
        <InputField name={'ITEM_GROUP'} label={'Item Group'} values={values} errors={errors} onChange={onChange} readOnly />
        <SelectField name={'SUPPLIER_ID'} label={'Vendor / Supplier'} values={values} errors={errors} options={references.vendors.map((record) => ({ value: record.ID, label: record.VENDOR_NAME }))} onChange={onChange} placeholder={'--Select Vendor / Supplier--'} />

        <SelectField name={'UOM'} label={'UOM'} values={values} errors={errors} options={references.uomOptions} onChange={onChange} placeholder={'--Select UOM--'} />
        <SelectField name={'CURRENCY'} label={'Currency'} values={values} errors={errors} options={references.currencyOptions} onChange={onChange} placeholder={'--Select Currency--'} />
        <InputField name={'ASSET_NO'} label={'Asset Number'} values={values} errors={errors} onChange={onChange} readOnly />
      </Section>

      <section className={'erp-employee-card erp-employee-tabs erp-asset-receive-tabs'}>
        <div
          className={'erp-employee-tab-list'}
          role={'tablist'}
          aria-label={'Asset receive information sections'}
        >
          {assetReceiveTabs.map(([key, label]) => (
            <button
              key={key}
              id={`asset-receive-tab-${key}`}
              type={'button'}
              role={'tab'}
              className={[
                'erp-employee-tab',
                activeTab === key ? 'erp-employee-tab-active' : '',
              ].filter(Boolean).join(' ')}
              aria-selected={activeTab === key}
              aria-controls={`asset-receive-panel-${key}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={'erp-employee-tab-panel'}
          id={`asset-receive-panel-${activeTab}`}
          role={'tabpanel'}
          aria-labelledby={`asset-receive-tab-${activeTab}`}
        >
      <TabSection active={activeTab === 'specification'}>
        {values.SPECIFICATIONS.length === 0 ? (
          <p className={'erp-asset-receive-empty-note'}>Select an Asset Item to load its mapped specifications.</p>
        ) : values.SPECIFICATIONS.map((row) => {
          const error = errors.SPECIFICATIONS?.[row.SPECIFICATION_ID]
          const id = `SPECIFICATION-${row.SPECIFICATION_ID}`
          return (
            <div key={row.SPECIFICATION_ID}>
              <label className={'erp-field-label'} htmlFor={id}>
                {row.EQUIPMENT_NAME}<span className={'erp-required'} aria-hidden={'true'}>*</span>
              </label>
              <input id={id} type={'text'} className={fieldClass(error)} value={row.EQUIPMENT_VALUE} maxLength={255} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onSpecificationChange(row.SPECIFICATION_ID, event.target.value)} />
              <FieldError id={`${id}-error`} message={error} />
            </div>
          )
        })}
      </TabSection>

      <TabSection active={activeTab === 'price'}>
        <InputField name={'QTY'} label={'Qty'} values={values} errors={errors} onChange={onChange} type={'number'} min={'1'} step={'1'} />
        <InputField name={'UNIT_PRICE'} label={'Unit Price'} values={values} errors={errors} onChange={onChange} type={'number'} min={'0'} step={'0.01'} />
        <InputField name={'GROSS_AMOUNT'} label={'Gross Amount'} values={values} errors={errors} onChange={onChange} type={'number'} readOnly />
        <InputField name={'DISCOUNT'} label={'Discount'} values={values} errors={errors} onChange={onChange} type={'number'} min={'0'} step={'0.01'} required={false} />
        <InputField name={'VAT_TAX'} label={'VAT / Tax'} values={values} errors={errors} onChange={onChange} type={'number'} min={'0'} step={'0.01'} required={false} />
        <InputField name={'OTHER_CHARGES'} label={'Other Charges'} values={values} errors={errors} onChange={onChange} type={'number'} min={'0'} step={'0.01'} required={false} />
        <InputField name={'CAPITALIZED_COST'} label={'Capitalized Cost'} values={values} errors={errors} onChange={onChange} type={'number'} readOnly />
      </TabSection>

      <TabSection active={activeTab === 'warranty'}>
        <SelectField name={'IS_W_G_APPLICABLE'} label={'Is Applicable?'} values={values} errors={errors} options={references.warrantyOptions} onChange={onChange} placeholder={'--Select Warranty / Guaranty--'} />
        <InputField name={'W_G_PERIOD'} label={'Period / Time'} values={values} errors={errors} onChange={onChange} type={'number'} min={'1'} step={'1'} required={warrantyApplicable} readOnly={!warrantyApplicable} />
        <InputField name={'W_G_START_DATE'} label={'Start Date'} values={values} errors={errors} onChange={onChange} type={'date'} required={warrantyApplicable} readOnly={!warrantyApplicable} />
        <InputField name={'W_G_END_DATE'} label={'End Date'} values={values} errors={errors} onChange={onChange} type={'date'} required={warrantyApplicable} readOnly={!warrantyApplicable} />
        <TextAreaField name={'W_G_OTHER_INFO'} label={warrantyInfoLabel} values={values} errors={errors} onChange={onChange} />
      </TabSection>

      <TabSection active={activeTab === 'location'}>
        <SelectField name={'CUSTODIAN_ID'} label={'Custodian Name'} values={values} errors={errors} options={references.custodians.map((record) => ({ value: record.ID, label: record.CUSTODIAN_NAME }))} onChange={onChange} placeholder={'--Select Custodian--'} />
        <InputField name={'FLOOR'} label={'Floor'} values={values} errors={errors} onChange={onChange} readOnly required={false} />
        <SelectField name={'SUB_CUSTODIAN_ID'} label={'Sub Custodian Name'} values={values} errors={errors} options={subCustodians} onChange={onChange} placeholder={'--Select Sub Custodian--'} disabled={!values.CUSTODIAN_ID} />
        <InputField name={'ROOM'} label={'Room'} values={values} errors={errors} onChange={onChange} readOnly required={false} />
        <SelectField name={'LOCATION'} label={'Location'} values={values} errors={errors} options={locations} onChange={onChange} placeholder={'--Select Location--'} disabled={!values.SUB_CUSTODIAN_ID} />
        <InputField name={'RAC'} label={'Rack'} values={values} errors={errors} onChange={onChange} required={false} maxLength={50} placeholder={'Enter rack'} />
        <InputField name={'BUILDING'} label={'Building'} values={values} errors={errors} onChange={onChange} readOnly required={false} />
        <InputField name={'BIN'} label={'Bin'} values={values} errors={errors} onChange={onChange} required={false} maxLength={50} placeholder={'Enter bin'} />
      </TabSection>

      <TabSection active={activeTab === 'depreciation'}>
        <InputField name={'DEPRI_METHOD'} label={'Depreciation Method'} values={values} errors={errors} onChange={onChange} readOnly />
        <InputField name={'DEPRI_START_DATE'} label={'Depreciation Start Date'} values={values} errors={errors} onChange={onChange} type={'date'} />
        <InputField name={'DEPRI_LIFE'} label={'Depreciation Period (Month)'} values={values} errors={errors} onChange={onChange} type={'number'} readOnly />
        <InputField name={'DEPRI_END_DATE'} label={'Depreciation End Date'} values={values} errors={errors} onChange={onChange} type={'date'} readOnly />
        <InputField name={'DEPRI_PERCENTAGE'} label={'Depreciation Percentage'} values={values} errors={errors} onChange={onChange} type={'number'} readOnly />
        <TextAreaField name={'REMARKS'} label={'Remarks'} values={values} errors={errors} onChange={onChange} isRemarks />
      </TabSection>
        </div>
      </section>
    </div>
  )
}

export default AssetReceiveRegisterForm
