/** @file API-backed edit controller for an existing Gate Pass. */
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
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

function GatePassEdit() {
  const { gatePassId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const gatePassNoRef = useRef(null)
  const itemRef = useRef(null)

  const [values, setValues] = useState(() => createInitialGatePassValues(''))
  const [originalValues, setOriginalValues] = useState(null)
  const [entryValues, setEntryValues] = useState(initialGatePassItemValues)
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState(getInitialGatePassReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      gatePassApi.get(gatePassId),
      loadGatePassReferences(sessionBusinessUnitId),
      gatePassApi.list(sessionBusinessUnitId),
    ])
      .then(([record, refs, list]) => {
        if (!active) return
        setReferences(refs)
        const mapped = mapGatePassFromApi(record, refs)
        setValues(mapped)
        setOriginalValues(mapped)
        setRows(mapped.ITEMS || [])
        setExistingRecords(
          (list || [])
            .filter((item) => String(item.id) !== String(gatePassId))
            .map((item) => mapGatePassFromApi(item, refs)),
        )
      })
      .catch((error) => {
        if (!active) return
        if (error?.response?.status === 404) {
          setNotFound(true)
        } else {
          setMessage(getApiErrorMessage(error, 'Unable to load Gate Pass.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [gatePassId, sessionBusinessUnitId])

  if (notFound) return <Navigate to={listPath} replace />

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

    setRows((current) => [
      ...current,
      { ID: `new-${Date.now()}-${current.length}`, GATE_PASS_ID: gatePassId, ...result.values },
    ])
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
        bgId: sessionGroupId || values.BG_ID,
        buId: sessionBusinessUnitId || values.BU_ID,
      })
      await gatePassApi.update(gatePassId, payload)
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Gate Pass.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (originalValues) {
      setValues(originalValues)
      setRows(originalValues.ITEMS || [])
    }
    setEntryValues(initialGatePassItemValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => gatePassNoRef.current?.focus())
  }

  return (
    <FormPage
      title={'Gate Pass Edit'}
      listTo={listPath}
      tableName={ASSET_GATE_PASS_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
      loading={loading}
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

export default GatePassEdit
