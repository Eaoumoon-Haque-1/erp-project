/**
 * @file Supplier View page.
 * Displays details of an existing AFM_SUPPLIER_INFO record with Audit Log block.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { showError } from '../../../../components/shared/actionAlerts'
import { supplierApi } from '../api/supplierApi'
import SupplierForm from '../components/SupplierForm'
import { mapSupplierFromApi } from '../data/supplierApiMapper'
import { initialSupplierValues } from '../validation/supplierValidation'

const listPath = '/accounts/supplier'

function SupplierView() {
  const { supplierId } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(initialSupplierValues)
  const [auditLog, setAuditLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supplierId) return
    let active = true

    supplierApi
      .get(supplierId)
      .then((data) => {
        if (!active) return
        const mapped = mapSupplierFromApi(data)
        setValues(mapped)
        setAuditLog(mapped.AUDIT_LOG || mapped)
      })
      .catch((err) => {
        if (active) showError(getApiErrorMessage(err, 'Unable to load supplier details.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [supplierId])

  if (loading) {
    return (
      <FormPage
        title={'View Supplier'}
        backTo={listPath}
        backLabel={'Back to Supplier List'}
        hideActions
      >
        <div className={'p-8 text-center text-xs text-gray-500'}>
          Loading supplier details...
        </div>
      </FormPage>
    )
  }

  return (
    <FormPage
      title={`Supplier Information: ${values.SUPPLIER_NAME || values.SUPPLIER_CODE || ''}`}
      backTo={listPath}
      backLabel={'Back to Supplier List'}
      hideActions
    >
      <SupplierForm
        values={values}
        errors={{}}
        isEdit={true}
        readOnly={true}
        auditLog={auditLog}
        editLabel={'Edit Supplier'}
        onEdit={() => navigate(`/accounts/supplier/${supplierId}/edit`)}
        onCancel={() => navigate(listPath)}
      />
    </FormPage>
  )
}

export default SupplierView

