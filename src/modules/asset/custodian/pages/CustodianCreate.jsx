/** @file Create-page controller for Custodian and Sub Custodian rows. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import CustodianForm from '../components/CustodianForm'
import { createCustodian, listCustodians } from '../data/custodianStore'
import {
  ASSET_CUSTODIAN_TABLE,
  initialCustodianValues,
  initialSubCustodianValues,
  validateCustodianSubmission,
  validateSubCustodian,
} from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianCreate() {
  const navigate = useNavigate()
  const custodianNameRef = useRef(null)
  const subCustodianNameRef = useRef(null)
  const [values, setValues] = useState(initialCustodianValues)
  const [entryValues, setEntryValues] = useState(initialSubCustodianValues)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleEntryChange = (event) => {
    const { name, type, value, checked } = event.target
    setEntryValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleAdd = () => {
    const result = validateSubCustodian(entryValues, rows, values.CUSTODIAN_NAME)
    setEntryValues(result.values)
    setErrors((current) => ({ ...current, ...result.errors }))
    if (!result.isValid) {
      requestAnimationFrame(() => subCustodianNameRef.current?.focus())
      return
    }

    setRows((current) => [
      ...current,
      { ID: `${Date.now()}-${current.length}`, ...result.values },
    ])
    setEntryValues(initialSubCustodianValues)
    setErrors((current) => ({
      ...current,
      SUB_CUSTODIAN_NAME: undefined,
      SUB_CUSTODIANS: undefined,
    }))
    requestAnimationFrame(() => subCustodianNameRef.current?.focus())
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateCustodianSubmission(values, rows, listCustodians())
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    createCustodian({ ...result.values, SUB_CUSTODIANS: rows })
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialCustodianValues)
    setEntryValues(initialSubCustodianValues)
    setRows([])
    setErrors({})
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage title={'Custodian Create'} listTo={listPath} tableName={ASSET_CUSTODIAN_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <CustodianForm
        values={values}
        entryValues={entryValues}
        errors={errors}
        rows={rows}
        custodianNameRef={custodianNameRef}
        subCustodianNameRef={subCustodianNameRef}
        onChange={handleChange}
        onEntryChange={handleEntryChange}
        onAdd={handleAdd}
        onRemove={(id) => setRows((current) => current.filter((row) => row.ID !== id))}
      />
    </FormPage>
  )
}

export default CustodianCreate
