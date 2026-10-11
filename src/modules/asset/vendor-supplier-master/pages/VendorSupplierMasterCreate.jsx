/** @file Create-page controller for Supplier Information. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../../../../api/supplier'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import VendorSupplierMasterForm from '../components/VendorSupplierMasterForm'
import { mapSupplierToApi } from '../data/vendorSupplierMasterApiMapper'
import { supplierBusinessGroup } from '../data/vendorSupplierMasterScope'
import useSupplierForm from '../data/useSupplierForm'
import { SUPPLIER_TABLE, createInitialSupplierValues } from '../validation/vendorSupplierMasterValidation'

const listPath = '/procure-to-pay/procurement-settings/supplier-information'

function VendorSupplierMasterCreate() {
  const navigate = useNavigate()
  const supplierNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const form = useSupplierForm(createInitialSupplierValues())
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(supplierBusinessGroup.ID)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await suppliersApi.create(mapSupplierToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Supplier.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset(createInitialSupplierValues())
    requestAnimationFrame(() => supplierNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Supplier Information Create'}
      listTo={listPath}
      tableName={SUPPLIER_TABLE}
      onSubmit={handleSubmit}
      onValidate={() => form.validate().isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <VendorSupplierMasterForm
        values={form.values}
        errors={form.errors}
        groupName={supplierBusinessGroup.GROUP_NAME}
        businessUnitOptions={businessUnitOptions}
        unitsLoading={unitsLoading}
        supplierNameRef={supplierNameRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default VendorSupplierMasterCreate
