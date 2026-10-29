/**
 * @file AFM Chart of Accounts main dashboard view.
 * Displays top controls (Business Unit selector, Account Head selector, View COA Report button),
 * left-column interactive hierarchy tree, and right-column Account Head entry/edit form.
 */
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import { confirmAction, showSuccess, showError } from '../../../../components/shared/actionAlerts'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { afmChartOfAccountsApi } from '../api/afmChartOfAccountsApi'
import AfmChartOfAccountsForm from '../components/AfmChartOfAccountsForm'
import AfmChartOfAccountsTree from '../components/AfmChartOfAccountsTree'
import AfmChartOfAccountsReportModal from '../components/AfmChartOfAccountsReportModal'
import SearchableSelect from '../components/SearchableSelect'
import {
  mapAfmChartOfAccountsFromApi,
  mapAfmChartOfAccountsToApi,
} from '../data/afmChartOfAccountsApiMapper'
import {
  initialAfmChartOfAccountsValues,
  validateAfmChartOfAccounts,
} from '../validation/afmChartOfAccountsValidation'

function AfmChartOfAccountsList() {
  const [businessUnits, setBusinessUnits] = useState([])
  const [selectedBuId, setSelectedBuId] = useState('')
  const [accounts, setAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [formValues, setFormValues] = useState(initialAfmChartOfAccountsValues)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  // 1. Load Business Units on mount
  useEffect(() => {
    let active = true
    businessUnitsApi.list()
      .then((units) => {
        if (!active) return
        setBusinessUnits(units)
        if (units && units.length > 0) {
          setSelectedBuId(String(units[0].id))
        }
      })
      .catch((error) => {
        if (active) showError(getApiErrorMessage(error, 'Unable to load business units.'))
      })
    return () => {
      active = false
    }
  }, [])

  // Currently selected Business Unit object
  const currentBu = useMemo(
    () => businessUnits.find((u) => String(u.id) === String(selectedBuId)),
    [businessUnits, selectedBuId]
  )

  const currentBuName = currentBu ? currentBu.businessUnit : ''
  const currentBgId = currentBu ? String(currentBu.bgId || '') : ''

  // 2. Load accounts whenever selected BU changes
  const loadAccountsForBu = async (buId) => {
    if (!buId) {
      setAccounts([])
      return
    }
    setLoadingAccounts(true)
    try {
      const records = await afmChartOfAccountsApi.listByUnit(buId)
      setAccounts(records)
    } catch (error) {
      showError(getApiErrorMessage(error, 'Unable to load Chart of Accounts.'))
    } finally {
      setLoadingAccounts(false)
    }
  }

  useEffect(() => {
    if (selectedBuId) {
      loadAccountsForBu(selectedBuId)
      // Reset form to new entry for this BU
      setFormValues({
        ...initialAfmChartOfAccountsValues,
        BU_ID: String(selectedBuId),
        BG_ID: currentBgId,
      })
      setSelectedAccountId(null)
      setFormErrors({})
    } else {
      setAccounts([])
    }
  }, [selectedBuId, currentBgId])

  // Build parent options for dropdown (only Title/Control accounts in this BU, excluding current node)
  const parentAccountOptions = useMemo(() => {
    return accounts
      .filter((acc) => {
        const accId = String(acc.id ?? acc.ID)
        const isSelf = selectedAccountId && accId === String(selectedAccountId)
        const isEligibleLedger = acc.ledgerHead !== 'Active Account'
        return !isSelf && isEligibleLedger && String(acc.status ?? 1) === '1'
      })
      .map((acc) => ({
        value: String(acc.id ?? acc.ID),
        label: `[${acc.accountCode}] ${acc.accountHeadName} (${acc.ledgerHead})`,
        code: acc.accountCode,
        level: acc.level || 1,
      }))
  }, [accounts, selectedAccountId])

  // Search options for top header account selector with write facility
  const accountHeadOptions = useMemo(() => {
    return accounts.map((acc) => ({
      value: String(acc.id ?? acc.ID),
      label: `${acc.accountCode} - ${acc.accountHeadName} (L${acc.level || 1})`,
      code: acc.accountCode,
      name: acc.accountHeadName,
    }))
  }, [accounts])

  // Top header select account handler
  const handleTopAccountSelect = (e) => {
    const accId = e.target.value
    if (!accId) {
      handleResetForm()
      return
    }
    const targetNode = accounts.find((a) => String(a.id ?? a.ID) === String(accId))
    if (targetNode) handleSelectNode(targetNode)
  }

  // Node selection from Tree
  const handleSelectNode = (node) => {
    const accId = String(node.id ?? node.ID)
    setSelectedAccountId(accId)
    setFormValues(mapAfmChartOfAccountsFromApi(node))
    setFormErrors({})
  }

  // Reset form to Create mode
  const handleResetForm = () => {
    setSelectedAccountId(null)
    setFormValues({
      ...initialAfmChartOfAccountsValues,
      BU_ID: String(selectedBuId),
      BG_ID: currentBgId,
    })
    setFormErrors({})
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Handle parent dropdown change: auto-fills parent code and calculates level
  const handleParentChange = (e) => {
    const parentId = e.target.value
    const selectedParent = parentAccountOptions.find((p) => String(p.value) === String(parentId))

    setFormValues((prev) => ({
      ...prev,
      PARENT_ACCOUNT_HEAD: parentId,
      PARENT_ACCOUNT_CODE: selectedParent ? selectedParent.code : '',
      LEVEL: selectedParent ? String(Number(selectedParent.level) + 1) : '1',
    }))
    setFormErrors((prev) => ({
      ...prev,
      PARENT_ACCOUNT_HEAD: undefined,
      PARENT_ACCOUNT_CODE: undefined,
    }))
  }

  // Submit / Update handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateAfmChartOfAccounts(formValues, accounts, selectedAccountId)
    setFormValues(validation.values)
    setFormErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    const isEdit = Boolean(selectedAccountId)
    const confirmed = await confirmAction({
      action: isEdit ? 'update' : 'create',
      entityName: 'Account Head',
    })
    if (!confirmed) return

    setSubmitting(true)
    try {
      const apiPayload = mapAfmChartOfAccountsToApi(validation.values)

      if (isEdit) {
        await afmChartOfAccountsApi.update(selectedAccountId, apiPayload)
        await showSuccess('Account head updated successfully.')
      } else {
        await afmChartOfAccountsApi.create(apiPayload)
        await showSuccess('Account head created successfully.')
      }

      await loadAccountsForBu(selectedBuId)
      handleResetForm()
    } catch (error) {
      showError(getApiErrorMessage(error, `Unable to ${isEdit ? 'update' : 'create'} account head.`))
    } finally {
      setSubmitting(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!selectedAccountId) return
    const confirmed = await confirmAction({
      action: 'delete',
      entityName: 'Account Head',
      title: 'Delete Account Head?',
      text: 'Are you sure you want to delete this account head? Child accounts may be affected.',
    })
    if (!confirmed) return

    setSubmitting(true)
    try {
      await afmChartOfAccountsApi.remove(selectedAccountId)
      await showSuccess('Account head deleted successfully.')
      await loadAccountsForBu(selectedBuId)
      handleResetForm()
    } catch (error) {
      showError(getApiErrorMessage(error, 'Unable to delete account head.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 bg-[#f4f6f8] min-h-screen font-sans">
      {/* Top Controls Bar */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Business Unit Selector */}
          <select
            value={selectedBuId}
            onChange={(e) => setSelectedBuId(e.target.value)}
            className="h-8 px-2.5 py-1 border border-gray-300 rounded text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">--Select Business Unit--</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={String(bu.id)}>
                {bu.businessUnit}
              </option>
            ))}
          </select>

          {/* 2. Search option by Account Head with write facility */}
          <div className="w-56 sm:w-72">
            <SearchableSelect
              id="top-account-head-search"
              placeholder="--Select / Type Account Head--"
              value={selectedAccountId || ''}
              options={accountHeadOptions}
              disabled={accounts.length === 0}
              emptyOptionLabel="--Clear Selection--"
              onChange={(val) => {
                if (!val) {
                  handleResetForm()
                  return
                }
                const targetNode = accounts.find((a) => String(a.id ?? a.ID) === String(val))
                if (targetNode) handleSelectNode(targetNode)
              }}
            />
          </div>

          {/* 3. View COA Report Button */}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            disabled={!selectedBuId}
            className="h-8 px-3.5 py-1 text-xs font-semibold text-white bg-[#00a8b5] hover:bg-[#00929d] disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            View COA Report
          </button>
        </div>

        {/* New Head button at top right */}
        <div>
          <button
            type="button"
            onClick={handleResetForm}
            className="h-8 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded shadow-sm"
          >
            + New Account Head
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left Tree (Col 6), Right Form (Col 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Tree View */}
        <div className="lg:col-span-6">
          <AfmChartOfAccountsTree
            accounts={accounts}
            selectedId={selectedAccountId}
            onSelectNode={handleSelectNode}
            businessUnitName={currentBuName}
            loading={loadingAccounts}
          />
        </div>

        {/* Right Column: Account Head Entry / Edit Form */}
        <div className="lg:col-span-6">
          <AfmChartOfAccountsForm
            title={selectedAccountId ? 'Edit Account Head' : 'New Account Head'}
            values={formValues}
            errors={formErrors}
            businessUnitName={currentBuName}
            parentAccountOptions={parentAccountOptions}
            parentsLoading={loadingAccounts}
            submitting={submitting}
            isEdit={Boolean(selectedAccountId)}
            onChange={handleChange}
            onParentChange={handleParentChange}
            onSubmit={handleSubmit}
            onReset={handleResetForm}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* COA Report Modal */}
      <AfmChartOfAccountsReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        accounts={accounts}
        businessUnitName={currentBuName}
      />
    </div>
  )
}

export default AfmChartOfAccountsList
