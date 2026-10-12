/** @file Edit-page controller for Supplier Information. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { suppliersApi } from '../../../../api/supplier'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import VendorSupplierMasterForm from '../components/VendorSupplierMasterForm'
import { mapSupplierFromApi, mapSupplierToApi } from '../data/vendorSupplierMasterApiMapper'
import { supplierBusinessGroup } from '../data/vendorSupplierMasterScope'
import useSupplierForm from '../data/useSupplierForm'
import { SUPPLIER_TABLE, createInitialSupplierValues } from '../validation/vendorSupplierMasterValidation'

const listPath = '/procure-to-pay/procurement-settings/supplier-information'

function VendorSupplierMasterEdit() {
  const { vendorSupplierId } = useParams()
  const navigate = useNavigate()
  const supplierNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const form = useSupplierForm(createInitialSupplierValues())
  const { reset } = form
  const { businessUnitOptions, unitsLoading } = useBusinessOptions(supplierBusinessGroup.ID, {
    preserveUnitId: form.values.BU_ID,
  })

  useEffect(() => {
    let active = true
    suppliersApi.get(vendorSupplierId)
      .then((record) => {
        if (!active) return
        const { ID, ...values } = mapSupplierFromApi(record)
        void ID
        setOriginal(values)
        reset(values)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Supplier.')
        navigate(listPath, { replace: true })
      })
    return () => {
      active = false
    }
  }, [vendorSupplierId, navigate, reset])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await suppliersApi.update(vendorSupplierId, mapSupplierToApi(result.values))
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Supplier.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original)
    requestAnimationFrame(() => supplierNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Supplier Information Edit'}
      listTo={listPath}
      tableName={SUPPLIER_TABLE}
      submitLabel={'Update'}
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
        businessUnitLocked
        supplierNameRef={supplierNameRef}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default VendorSupplierMasterEdit
