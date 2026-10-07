/** @file Edit-page controller for temporary Vendor / Supplier records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import VendorSupplierMasterForm from '../components/VendorSupplierMasterForm'
import { getVendorSupplier, listVendorSuppliers, updateVendorSupplier } from '../data/vendorSupplierMasterStore'
import { ASSET_VENDOR_TABLE, validateVendorSupplier } from '../validation/vendorSupplierMasterValidation'

const listPath = '/asset/vendor-supplier-master'

function VendorSupplierMasterEdit() {
  const { vendorSupplierId } = useParams()
  const navigate = useNavigate()
  const vendorNameRef = useRef(null)
  const record = getVendorSupplier(vendorSupplierId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listVendorSuppliers().filter((item) => item.ID !== record.ID)
    const result = validateVendorSupplier(values, otherRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    updateVendorSupplier(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => vendorNameRef.current?.focus())
  }

  return (
    <FormPage title={'Vendor / Supplier Master Edit'} listTo={listPath} tableName={ASSET_VENDOR_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <VendorSupplierMasterForm values={values} errors={errors} vendorNameRef={vendorNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default VendorSupplierMasterEdit
