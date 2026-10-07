/**
 * @file Create-page controller for Payscale.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import PayscaleForm from '../components/PayscaleForm'
import {
  PAY_SCALE_TABLE,
  calculateGrandTotal,
  createInitialPayScaleValues,
  createPayScaleRow,
  validatePayScale,
} from '../validation/payscaleValidation'

const existingGradeNames = []
const emptyErrors = () => ({ fields: {}, details: [] })

function PayscaleCreate() {
  const navigate = useNavigate()
  const gradeNameRef = useRef(null)
  const [values, setValues] = useState(createInitialPayScaleValues)
  const [errors, setErrors] = useState(emptyErrors)

  const handleGradeChange = (event) => {
    setValues((current) => ({ ...current, GRADE_NAME: event.target.value }))
    setErrors((current) => ({ ...current, fields: { ...current.fields, GRADE_NAME: undefined } }))
  }

  const handleRowChange = (index, key, value) => {
    setValues((current) => ({
      ...current,
      details: current.details.map((row, rowIndex) => {
        if (rowIndex !== index) return row
        const updatedRow = { ...row, [key]: value }
        return { ...updatedRow, GRAND_TOTAL: calculateGrandTotal(updatedRow) }
      }),
    }))
    setErrors((current) => ({
      ...current,
      details: current.details.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: undefined } : row),
    }))
  }

  const handleAddRow = () => {
    setValues((current) => ({ ...current, details: [...current.details, createPayScaleRow()] }))
  }

  const handleRemoveRow = (index) => {
    if (!window.confirm('Remove this Stage row?')) return
    setValues((current) => ({
      ...current,
      details: current.details.length === 1 ? [createPayScaleRow()] : current.details.filter((_, rowIndex) => rowIndex !== index),
    }))
    setErrors((current) => ({ ...current, details: current.details.filter((_, rowIndex) => rowIndex !== index) }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validatePayScale(values, existingGradeNames)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    navigate('/hris/employee-settings/payscale')
  }

  const handleReset = () => {
    setValues(createInitialPayScaleValues())
    setErrors(emptyErrors())
    requestAnimationFrame(() => gradeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Pay Scale Create'}
      listTo={'/hris/employee-settings/payscale'}
      tableName={PAY_SCALE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <PayscaleForm
        values={values}
        errors={errors}
        gradeNameRef={gradeNameRef}
        onGradeChange={handleGradeChange}
        onRowChange={handleRowChange}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
      />
    </FormPage>
  )
}

export default PayscaleCreate
