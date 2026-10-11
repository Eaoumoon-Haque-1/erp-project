/** @file List-page controller for API-backed Asset Receive Register records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetReceivesApi } from '../../../../api/assetReceive'
import { assetItemsApi } from '../../../../api/assetReferences'
import { getApiErrorMessage } from '../../../../api/errors'
import { suppliersApi } from '../../../../api/supplier'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { mapAssetReceiveFromApi, mapItemRef, mapSupplierRef } from '../data/assetReceiveApiMapper'
import { receiveBusinessGroup } from '../data/assetReceiveScope'

const columns = [
  { key: 'GRN_NO', label: 'GRN No' },
  { key: 'GRN_DATE', label: 'GRN Date', render: (value) => formatDateForDisplay(value) },
  { key: 'SUPPLIER_NAME', label: 'Supplier' },
  { key: 'ITEM_NAME', label: 'Item' },
  { key: 'QTY', label: 'Qty' },
  { key: 'CAPITALIZED_COST', label: 'Capitalized Cost' },
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

const safeList = (request) => request.catch((error) => {
  getApiErrorMessage(error, 'Unable to load reference data.')
  return []
})

function AssetReceiveRegisterList() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { businessUnitOptions } = useBusinessOptions(receiveBusinessGroup.ID)

  useEffect(() => {
    let active = true
    // No buId is sent: the default view lists every Business Unit.
    assetReceivesApi.list()
      .then((data) => {
        if (active) setRecords(data.map(mapAssetReceiveFromApi))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Asset Receives.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    safeList(suppliersApi.list()).then((data) => active && setSuppliers(data.map(mapSupplierRef)))
    safeList(assetItemsApi.list()).then((data) => active && setItems(data.map(mapItemRef)))
    return () => {
      active = false
    }
  }, [])

  // The API returns ids only; names are resolved from the loaded lists.
  const rows = useMemo(() => records.map((record) => ({
    ...record,
    SUPPLIER_NAME: suppliers.find((item) => item.ID === record.SUPPLIER_ID)?.NAME || '-',
    ITEM_NAME: items.find((item) => item.ID === record.ITEM_NAME_ID)?.NAME || '-',
  })), [records, suppliers, items])

  const filters = useMemo(() => [
    {
      key: 'GRN_NO',
      label: 'Search by GRN No',
      placeholder: '--Search by GRN No--',
      matches: (row, value) => String(row.GRN_NO ?? '').toLowerCase().includes(value.toLowerCase()),
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

  // There is no delete: cancel/reactivate with PATCH (ListRowActions confirms first).
  const handleStatusChange = async (row) => {
    const nextStatus = row.STATUS === '1' ? 0 : 1
    try {
      await assetReceivesApi.setStatus(row.ID, nextStatus)
      setRecords((current) => current.map((item) => (
        item.ID === row.ID ? { ...item, STATUS: String(nextStatus) } : item
      )))
    } catch (error) {
      getApiErrorMessage(error, 'Unable to update Asset Receive status.')
    }
  }

  return (
    <ListPage
      title={'Asset Receive Register List'}
      createLabel={'New'}
      createTo={'/asset/asset-receive-register/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-receive-register/${row.ID}/edit`)}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetReceiveRegisterList
