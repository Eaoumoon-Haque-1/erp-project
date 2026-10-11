/** @file Create-page controller for Supplier Information. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import VendorSupplierMasterForm from '../components/VendorSupplierMasterForm'
import { createVendorSupplier, listVendorSuppliers } from '../data/vendorSupplierMasterStore'
import { ASSET_VENDOR_TABLE, initialVendorSupplierValues, validateVendorSupplier } from '../validation/vendorSupplierMasterValidation'

const listPath = '/procure-to-pay/procurement-settings/supplier-information'

function VendorSupplierMasterCreate() {
  const navigate = useNavigate()
  const vendorNameRef = useRef(null)
  const [values, setValues] = useState(initialVendorSupplierValues)
  const [errors, setErrors] = useState({})

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
    const result = validateVendorSupplier(values, listVendorSuppliers())
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    createVendorSupplier(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialVendorSupplierValues)
    setErrors({})
    requestAnimationFrame(() => vendorNameRef.current?.focus())
  }

  return (
    <FormPage title={'Supplier Information Create'} listTo={listPath} tableName={ASSET_VENDOR_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <VendorSupplierMasterForm values={values} errors={errors} vendorNameRef={vendorNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default VendorSupplierMasterCreate
