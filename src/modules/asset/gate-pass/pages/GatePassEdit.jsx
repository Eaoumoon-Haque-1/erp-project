/** @file Edit-page controller for an existing Gate Pass. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import GatePassForm from '../components/GatePassForm'
import { getGatePassReferences } from '../data/gatePassOptions'
import { getGatePass, listGatePasses, updateGatePass } from '../data/gatePassStore'
import { ASSET_GATE_PASS_TABLE, initialGatePassItemValues, validateGatePass, validateGatePassItem } from '../validation/gatePassValidation'

const listPath = '/asset/gate-pass'

function GatePassEdit() {
  const { gatePassId } = useParams()
  const navigate = useNavigate()
  const gatePassNoRef = useRef(null)
  const itemRef = useRef(null)
  const record = getGatePass(gatePassId)
  const references = getGatePassReferences()
  const [values, setValues] = useState(record)
  const [entryValues, setEntryValues] = useState(initialGatePassItemValues)
  const [rows, setRows] = useState(record?.ITEMS ?? [])
  const [errors, setErrors] = useState({})
  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleEntryChange = (event) => { const { name, value } = event.target; setEntryValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })) }
  const handleAdd = () => { const result = validateGatePassItem(entryValues, rows, references); setEntryValues(result.values); setErrors((current) => ({ ...current, ITEM_NAME: result.errors.ITEM_NAME, QUANTITY: result.errors.QUANTITY })); if (!result.isValid) return; setRows((current) => [...current, { ID: `${Date.now()}-${current.length}`, GATE_PASS_ID: record.ID, ...result.values }]); setEntryValues(initialGatePassItemValues); setErrors((current) => ({ ...current, ITEMS: undefined, ITEM_NAME: undefined, QUANTITY: undefined })); requestAnimationFrame(() => itemRef.current?.focus()) }
  const handleSubmit = (event) => { event.preventDefault(); const others = listGatePasses().filter((item) => item.ID !== record.ID); const result = validateGatePass(values, rows, others, references); setValues(result.values); setErrors(result.errors); if (!result.isValid) { requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus()); return }; updateGatePass(record.ID, { ...result.values, ITEMS: rows }); navigate(listPath) }
  const handleReset = () => { setValues(record); setEntryValues(initialGatePassItemValues); setRows(record.ITEMS); setErrors({}); requestAnimationFrame(() => gatePassNoRef.current?.focus()) }

  return <FormPage title={'Gate Pass Edit'} listTo={listPath} tableName={ASSET_GATE_PASS_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}><GatePassForm values={values} entryValues={entryValues} rows={rows} errors={errors} references={references} gatePassNoRef={gatePassNoRef} itemRef={itemRef} onChange={handleChange} onEntryChange={handleEntryChange} onAdd={handleAdd} onRemove={(id) => setRows((current) => current.filter((row) => row.ID !== id))} /></FormPage>
}

export default GatePassEdit
