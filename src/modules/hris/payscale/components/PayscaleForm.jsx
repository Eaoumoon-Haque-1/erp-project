/**
 * @file Controlled form presentation for Payscale.
 * Sections: field helpers, feature field groups, validation display, and exported form component.
 * Receive values/errors/callbacks through props; saving, navigation, and API calls stay in the page.
 */
import { PAY_SCALE_DETAILS_TABLE, calculateGrandTotal } from '../validation/payscaleValidation'

const columns = [
  { key: 'STAGE', label: 'Stage', required: true, integer: true },
  { key: 'BASIC', label: 'Basic', required: true },
  { key: 'DEARNESS', label: 'Dearness' },
  { key: 'HOUSE_RENT', label: 'House Rent' },
  { key: 'CONVEYANCE', label: 'Conveyance' },
  { key: 'WASHING', label: 'Washing' },
  { key: 'MEDICAL', label: 'Medical' },
  { key: 'PF', label: 'PF' },
  { key: 'FESTIVAL_BONUS', label: 'Festival Bonus' },
  { key: 'ANNUAL_BONUS', label: 'Annual Bonus' },
  { key: 'GRATUITY', label: 'Gratuity' },
]

function HeaderLabel({ label }) {
  const words = label.split(' ')

  return (
    <span className={'erp-payscale-header-label'}>
      {words.map((word) => <span key={word}>{word}</span>)}
    </span>
  )
}

function PayscaleForm({ values, errors, gradeNameRef, onGradeChange, onRowChange, onAddRow, onRemoveRow }) {
  return (
    <>
      <div className={'erp-form-grid erp-payscale-grade-grid'}>
        <div>
          <label className={'erp-field-label'} htmlFor={'GRADE_NAME'}>
            Grade Name<span className={'erp-required'}>*</span>
          </label>
          <input
            ref={gradeNameRef}
            id={'GRADE_NAME'}
            name={'GRADE_NAME'}
            type={'text'}
            className={['erp-form-control', errors.fields?.GRADE_NAME ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')}
            value={values.GRADE_NAME}
            maxLength={100}
            placeholder={'Enter grade name'}
            aria-invalid={Boolean(errors.fields?.GRADE_NAME)}
            onChange={onGradeChange}
          />
          {errors.fields?.GRADE_NAME && <p className={'erp-field-error'}>{errors.fields.GRADE_NAME}</p>}
        </div>
      </div>

      <div className={'erp-payscale-table-wrap'} data-table={PAY_SCALE_DETAILS_TABLE}>
        <table className={'erp-table erp-payscale-table'}>
          <thead>
            <tr>
              <th className={'erp-number-column'}>#</th>
              {columns.map((column) => (
                <th key={column.key}>
                  <HeaderLabel label={column.label} />
                  {column.required && <span className={'erp-required'}>*</span>}
                </th>
              ))}
              <th><HeaderLabel label={'Grand Total'} /></th>
              <th className={'erp-action-column'}>Action</th>
            </tr>
          </thead>
          <tbody>
            {values.details.map((row, index) => (
              <tr key={row._ROW_ID}>
                <td className={'erp-number-column'} data-label={'Record'}>{index + 1}</td>
                {columns.map((column) => {
                  const error = errors.details?.[index]?.[column.key]
                  return (
                    <td key={column.key} data-label={column.label}>
                      <input
                        name={column.key}
                        type={'number'}
                        className={['erp-payscale-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')}
                        value={row[column.key]}
                        min={column.key === 'BASIC' || column.integer ? '1' : '0'}
                        max={column.integer ? '99' : undefined}
                        step={column.integer ? '1' : '0.01'}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => onRowChange(index, column.key, event.target.value)}
                      />
                      {error && <p className={'erp-field-error'}>{error}</p>}
                    </td>
                  )
                })}
                <td data-label={'Grand Total'}>
                  <input
                    name={'GRAND_TOTAL'}
                    type={'text'}
                    className={'erp-payscale-control erp-readonly'}
                    value={calculateGrandTotal(row)}
                    readOnly
                  />
                </td>
                <td className={'erp-action-column'} data-label={'Action'}>
                  <button type={'button'} className={'erp-remove-row-button'} onClick={() => onRemoveRow(index)} aria-label={`Remove pay scale row ${index + 1}`}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type={'button'} className={'primary-button erp-add-row-button'} onClick={onAddRow}>+ Add More</button>
    </>
  )
}

export default PayscaleForm
