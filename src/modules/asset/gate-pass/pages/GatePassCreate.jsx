/** @file API-backed create controller for Gate Pass header and item-detail rows. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import GatePassForm from '../components/GatePassForm'
import { gatePassApi } from '../api/gatePassApi'
import { mapGatePassFromApi, mapGatePassToApi } from '../data/gatePassApiMapper'
import { getInitialGatePassReferences, loadGatePassReferences } from '../data/gatePassOptions'
import {
  ASSET_GATE_PASS_TABLE,
  createInitialGatePassValues,
  generateGatePassNo,
  initialGatePassItemValues,
  validateGatePass,
  validateGatePassItem,
} from '../validation/gatePassValidation'

const listPath = '/asset/gate-pass'
const fieldMap = {
  gatePassDate: 'GATE_PASS_DATE',
  gatePassNo: 'GATE_PASS_NO',
  supplierId: 'SUPPLIER_ID',
  custodianId: 'CUSTODIAN',
  remark: 'REMARK',
  status: 'STATUS',
  items: 'ITEMS',
}

function GatePassCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const gatePassNoRef = useRef(null)
  const itemRef = useRef(null)
  const [references, setReferences] = useState(getInitialGatePassReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [values, setValues] = useState(() => createInitialGatePassValues(''))
  const [entryValues, setEntryValues] = useState(initialGatePassItemValues)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      gatePassApi.list(sessionBusinessUnitId),
      loadGatePassReferences(sessionBusinessUnitId),
    ])
      .then(([records, refs]) => {
        if (!active) return
        setReferences(refs)
        const mappedRecords = (records || []).map((r) => mapGatePassFromApi(r, refs))
        setExistingRecords(mappedRecords)
        setValues((current) => ({
          ...current,
          GATE_PASS_NO: current.GATE_PASS_NO || generateGatePassNo(mappedRecords),
        }))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load references.'))
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleEntryChange = (event) => {
    const { name, value } = event.target
    setEntryValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleAdd = () => {
    const result = validateGatePassItem(entryValues, rows, references)
    setEntryValues(result.values)
    setErrors((current) => ({
      ...current,
      ITEM_NAME: result.errors.ITEM_NAME,
      QUANTITY: result.errors.QUANTITY,
    }))
    if (!result.isValid) return

    setRows((current) => [...current, { ID: `${Date.now()}-${current.length}`, ...result.values }])
    setEntryValues(initialGatePassItemValues)
    setErrors((current) => ({ ...current, ITEMS: undefined, ITEM_NAME: undefined, QUANTITY: undefined }))
    requestAnimationFrame(() => itemRef.current?.focus())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateGatePass(values, rows, existingRecords, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const payload = mapGatePassToApi(result.values, rows, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      })
      await gatePassApi.create(payload)
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Gate Pass.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialGatePassValues(generateGatePassNo(existingRecords)))
    setEntryValues(initialGatePassItemValues)
    setRows([])
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => gatePassNoRef.current?.focus())
  }

  return (
    <FormPage
      title={'Gate Pass Create'}
      listTo={listPath}
      tableName={ASSET_GATE_PASS_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      message={message}
    >
      <GatePassForm
        values={values}
        entryValues={entryValues}
        rows={rows}
        errors={errors}
        references={references}
        gatePassNoRef={gatePassNoRef}
        itemRef={itemRef}
        onChange={handleChange}
        onEntryChange={handleEntryChange}
        onAdd={handleAdd}
        onRemove={(id) => setRows((current) => current.filter((row) => row.ID !== id))}
      />
    </FormPage>
  )
}

export default GatePassCreate
