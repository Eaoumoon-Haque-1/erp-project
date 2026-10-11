/** @file Create-page controller for Gate Pass header and item-detail rows. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import GatePassForm from '../components/GatePassForm'
import { getGatePassReferences } from '../data/gatePassOptions'
import { createGatePass, generateGatePassNo, listGatePasses } from '../data/gatePassStore'
import { ASSET_GATE_PASS_TABLE, createInitialGatePassValues, initialGatePassItemValues, validateGatePass, validateGatePassItem } from '../validation/gatePassValidation'

const listPath = '/asset/gate-pass'

function GatePassCreate() {
  const navigate = useNavigate()
  const gatePassNoRef = useRef(null)
  const itemRef = useRef(null)
  const references = getGatePassReferences()
  const [values, setValues] = useState(() => createInitialGatePassValues(generateGatePassNo()))
  const [entryValues, setEntryValues] = useState(initialGatePassItemValues)
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState({})

  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleEntryChange = (event) => { const { name, value } = event.target; setEntryValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleAdd = () => { const result = validateGatePassItem(entryValues, rows, references); setEntryValues(result.values); setErrors((current) => ({ ...current, ITEM_NAME: result.errors.ITEM_NAME, QUANTITY: result.errors.QUANTITY })); if (!result.isValid) return; setRows((current) => [...current, { ID: `${Date.now()}-${current.length}`, ...result.values }]); setEntryValues(initialGatePassItemValues); setErrors((current) => ({ ...current, ITEMS: undefined, ITEM_NAME: undefined, QUANTITY: undefined })); requestAnimationFrame(() => itemRef.current?.focus()) }
  const handleSubmit = (event) => { event.preventDefault(); const result = validateGatePass(values, rows, listGatePasses(), references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; createGatePass({ ...result.values, ITEMS: rows }); navigate(listPath) }
  const handleReset = () => { setValues(createInitialGatePassValues(generateGatePassNo())); setEntryValues(initialGatePassItemValues); setRows([]); setErrors({}); requestAnimationFrame(() => gatePassNoRef.current?.focus()) }

  return <FormPage title={'Gate Pass Create'} listTo={listPath} tableName={ASSET_GATE_PASS_TABLE} onSubmit={handleSubmit} onReset={handleReset}><GatePassForm values={values} entryValues={entryValues} rows={rows} errors={errors} references={references} gatePassNoRef={gatePassNoRef} itemRef={itemRef} onChange={handleChange} onEntryChange={handleEntryChange} onAdd={handleAdd} onRemove={(id) => setRows((current) => current.filter((row) => row.ID !== id))} /></FormPage>
}

export default GatePassCreate
