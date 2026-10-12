/** @file List-page controller for API-backed Supplier Information records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../../../../api/supplier'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { mapSupplierFromApi, mapSupplierToApi } from '../data/vendorSupplierMasterApiMapper'
import { supplierBusinessGroup } from '../data/vendorSupplierMasterScope'

const basePath = '/procure-to-pay/procurement-settings/supplier-information'

const columns = [
  { key: 'SUPPLIER_NAME', label: 'Supplier Name' },
  { key: 'SUPPLIER_CODE', label: 'Code' },
  { key: 'CONTACT_PERSON', label: 'Contact Person' },
  { key: 'PHONE', label: 'Phone' },
  { key: 'EMAIL', label: 'Email' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function VendorSupplierMasterList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { businessUnitOptions } = useBusinessOptions(supplierBusinessGroup.ID)

  useEffect(() => {
    let active = true
    // No buId is sent: the default view lists every Business Unit.
    suppliersApi.list()
      .then((items) => {
        if (active) setRows(items.map(mapSupplierFromApi))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Suppliers.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filters = useMemo(() => [
    {
      key: 'SUPPLIER_NAME',
      label: 'Search by Supplier Name',
      placeholder: '--Search by Supplier Name--',
      matches: (row, value) => String(row.SUPPLIER_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'BU_ID',
      label: 'Search by Business Unit',
      placeholder: '--Search by Business Unit--',
      options: businessUnitOptions,
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
    },
  ], [businessUnitOptions])

  const handleDelete = async (row) => {
    try {
      await suppliersApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to delete Supplier.')
    }
  }

  // The record is a flat object, so the row itself is the full PUT body.
  const handleStatusChange = async (row) => {
    try {
      const updated = await suppliersApi.update(
        row.ID,
        mapSupplierToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapSupplierFromApi(updated) : item
      )))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Supplier status.')
    }
  }

  return (
    <ListPage
      title={'Supplier Information List'}
      createLabel={'New'}
      createTo={`${basePath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default VendorSupplierMasterList
