/**
 * @file Create-page controller for Sales Agreement.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import SalesAgreementForm from '../components/SalesAgreementForm'
import {
  SALES_AGREEMENT_TABLE,
  createInitialSalesAgreementValues,
  temporaryBusinessUnits,
  temporarySalesPeople,
  validateSalesAgreement,
} from '../validation/salesAgreementValidation'

const listPath = '/admin/sales-agreement'

function SalesAgreementCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(createInitialSalesAgreementValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleMultiSelectChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateSalesAgreement(values)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    navigate(listPath)
  }

  const handleReset = () => {
    setValues(createInitialSalesAgreementValues())
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage
      title={'Sales Agreement Create'}
      listTo={listPath}
      tableName={SALES_AGREEMENT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <SalesAgreementForm
        values={values}
        errors={errors}
        businessUnits={temporaryBusinessUnits}
        salesPeople={temporarySalesPeople}
        businessUnitRef={businessUnitRef}
        onChange={handleChange}
        onMultiSelectChange={handleMultiSelectChange}
      />
    </FormPage>
  )
}

export default SalesAgreementCreate
