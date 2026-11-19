/**
 * @file Asset Lookup Type Edit page.
 * Loads lookup type master and its detail values by ID, allowing edits, row modifications, and displays audit log.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import { assetLookupTypesApi } from '../api/assetLookupTypeApi'
import AssetLookupTypeForm from '../components/AssetLookupTypeForm'
import { mapAssetLookupTypeFromApi, mapAssetLookupTypeToApi } from '../data/assetLookupTypeApiMapper'
import useAssetLookupTypeForm from '../data/useAssetLookupTypeForm'
import { ASSET_LOOKUP_TYPE_TABLE, initialAssetLookupTypeValues } from '../validation/assetLookupTypeValidation'

const listPath = '/asset/asset-lookup-type'

function AssetLookupTypeEdit() {
  const { assetLookupTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const form = useAssetLookupTypeForm(
    { ...initialAssetLookupTypeValues, BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId },
    [],
  )
  const { reset } = form

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupTypesApi.get(assetLookupTypeId),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([record, users, employees]) => {
        if (!active) return
        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display =
              code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )
        const mapped = mapAssetLookupTypeFromApi(
          record,
          new Map(),
          new Map(),
          userMap,
          empMap,
        )
        const loaded = {
          values: {
            ID: mapped.ID,
            BG_ID: sessionGroupId || mapped.BG_ID,
            BU_ID: sessionBusinessUnitId || mapped.BU_ID,
            TYPE_NAME: mapped.TYPE_NAME,
            TYPE_CODE: mapped.TYPE_CODE,
            CODE: mapped.CODE,
            STATUS: mapped.STATUS,
          },
          rows: mapped.LOOKUP_VALUES,
        }
        setOriginal(loaded)
        setAuditLog({
          CREATED_USER_ID: mapped.CREATED_USER_ID,
          CREATED_USER_NAME: mapped.CREATED_USER_NAME,
          CREATED_EMP_ID: mapped.CREATED_EMP_ID,
          CREATED_EMP_NAME: mapped.CREATED_EMP_NAME,
          CREATED_DATETIME: mapped.CREATED_DATETIME,
          CREATED_APP: mapped.CREATED_APP,
          UPDATED_USER_ID: mapped.UPDATED_USER_ID,
          UPDATED_USER_NAME: mapped.UPDATED_USER_NAME,
          UPDATED_EMP_ID: mapped.UPDATED_EMP_ID,
          UPDATED_EMP_NAME: mapped.UPDATED_EMP_NAME,
          UPDATED_DATETIME: mapped.UPDATED_DATETIME,
          UPDATED_APP: mapped.UPDATED_APP,
          STATUS: mapped.STATUS,
        })
        reset(loaded.values, loaded.rows)
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Asset Lookup Type.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [assetLookupTypeId, navigate, reset, sessionBusinessUnitId, sessionGroupId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate({
      BG_ID: sessionGroupId || form.values.BG_ID,
      BU_ID: sessionBusinessUnitId || form.values.BU_ID,
    })
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetLookupTypesApi.update(
        assetLookupTypeId,
        mapAssetLookupTypeToApi(result.values, result.rows, {
          bgId: sessionGroupId || form.values.BG_ID,
          buId: sessionBusinessUnitId || form.values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Asset Lookup Type.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original.values, original.rows)
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Lookup Type Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back To List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_LOOKUP_TYPE_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onValidate={() => form.validate({
        BG_ID: sessionGroupId || form.values.BG_ID,
        BU_ID: sessionBusinessUnitId || form.values.BU_ID,
      }).isValid}
      onReset={handleReset}
      submitting={submitting}
    >
      <AssetLookupTypeForm
        values={form.values}
        errors={form.errors}
        rows={form.rows}
        auditLog={auditLog}
        submitLabel={'Update'}
        submitting={submitting}
        typeNameRef={typeNameRef}
        onChange={form.handleChange}
        onRowChange={form.handleRowChange}
        onAddRow={form.handleAddRow}
        onRemoveRow={form.handleRemoveRow}
      />
    </FormPage>
  )
}

export default AssetLookupTypeEdit
