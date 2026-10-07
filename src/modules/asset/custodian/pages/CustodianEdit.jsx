/** @file Edit-page controller for temporary Custodian records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import CustodianForm from '../components/CustodianForm'
import { getCustodian, listCustodians, updateCustodian } from '../data/custodianStore'
import {
  ASSET_CUSTODIAN_TABLE,
  initialSubCustodianValues,
  validateCustodianSubmission,
  validateSubCustodian,
} from '../validation/custodianValidation'

const listPath = '/asset/custodian'

function CustodianEdit() {
  const { custodianId } = useParams()
  const navigate = useNavigate()
  const custodianNameRef = useRef(null)
  const subCustodianNameRef = useRef(null)
  const record = getCustodian(custodianId)
  const [values, setValues] = useState(record ? {
    CUSTODIAN_NAME: record.CUSTODIAN_NAME,
    STATUS: record.STATUS,
  } : null)
  const [entryValues, setEntryValues] = useState(initialSubCustodianValues)
  const [rows, setRows] = useState(record?.SUB_CUSTODIANS ?? [])
  const [errors, setErrors] = useState({})

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleEntryChange = (event) => {
    const { name, type, value, checked } = event.target
    setEntryValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
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

    setRows((current) => [...current, { ID: `${Date.now()}-${current.length}`, CUSTODIAN_ID: record.ID, ...result.values }])
    setEntryValues(initialSubCustodianValues)
    setErrors((current) => ({ ...current, SUB_CUSTODIAN_NAME: undefined, SUB_CUSTODIANS: undefined }))
    requestAnimationFrame(() => subCustodianNameRef.current?.focus())
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listCustodians().filter((item) => item.ID !== record.ID)
    const result = validateCustodianSubmission(values, rows, otherRecords)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    updateCustodian(record.ID, { ...result.values, SUB_CUSTODIANS: rows })
    navigate(listPath)
  }

  const handleReset = () => {
    setValues({ CUSTODIAN_NAME: record.CUSTODIAN_NAME, STATUS: record.STATUS })
    setEntryValues(initialSubCustodianValues)
    setRows(record.SUB_CUSTODIANS)
    setErrors({})
    requestAnimationFrame(() => custodianNameRef.current?.focus())
  }

  return (
    <FormPage title={'Custodian Edit'} listTo={listPath} tableName={ASSET_CUSTODIAN_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
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

export default CustodianEdit
