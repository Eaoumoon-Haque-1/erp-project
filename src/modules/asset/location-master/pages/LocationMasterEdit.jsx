/**
 * @file Edit-page controller for Location Master.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 * Dropdown data for Custodian, Sub Custodian, and Department strictly come from session bgId and buId.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
import LocationMasterForm from '../components/LocationMasterForm'
import { mapLocationMasterFromApi, mapLocationMasterToApi } from '../data/locationMasterApiMapper'
import {
  buildCustodianOptions,
  buildDepartmentOptions,
  buildSubCustodianOptions,
} from '../data/locationMasterOptions'
import useLocationMasterForm from '../data/useLocationMasterForm'
import useLocationReferences from '../data/useLocationReferences'
import { ASSET_LOCATION_TABLE, createInitialLocationMasterValues } from '../validation/locationMasterValidation'

const listPath = '/asset/location-master'

function LocationMasterEdit() {
  const { locationMasterId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const locationNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [original, setOriginal] = useState(null)
  const [auditLog, setAuditLog] = useState(null)
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)

  const form = useLocationMasterForm(createInitialLocationMasterValues())
  const { reset } = form

  // Resolve BG_ID if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  // References are strictly filtered by the session business unit and resolved group
  const refs = useLocationReferences({
    buId: sessionBusinessUnitId || form.values.BU_ID,
    groupId: resolvedGroupId || sessionGroupId,
  })

  useEffect(() => {
    let active = true

    Promise.all([
      assetLocationsApi.get(locationMasterId),
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
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const mapped = mapLocationMasterFromApi(record, userMap, empMap)
        const loadedValues = {
          BG_ID: resolvedGroupId || sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBusinessUnitId || mapped.BU_ID,
          CUSTODIAN_ID: mapped.CUSTODIAN_ID,
          SUB_CUSTODIAN_ID: mapped.SUB_CUSTODIAN_ID,
          DEPT_ID: mapped.DEPT_ID,
          LOCATION_NAME: mapped.LOCATION_NAME,
          LOCATION_CODE: mapped.LOCATION_CODE,
          ADDRESS: mapped.ADDRESS,
          BUILDING: mapped.BUILDING,
          FLOOR: mapped.FLOOR,
          ROOM: mapped.ROOM,
          STATUS: mapped.STATUS,
        }

        setOriginal(loadedValues)
        reset(loadedValues)
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
      })
      .catch((error) => {
        if (!active) return
        getApiErrorMessage(error, 'Unable to load Location.')
        navigate(listPath, { replace: true })
      })

    return () => {
      active = false
    }
  }, [locationMasterId, navigate, reset, resolvedGroupId, sessionBusinessUnitId, sessionGroupId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetLocationsApi.update(
        locationMasterId,
        mapLocationMasterToApi(result.values, {
          bgId: resolvedGroupId || sessionGroupId || result.values.BG_ID,
          buId: sessionBusinessUnitId || result.values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to update Location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (original) form.reset(original)
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Location Master Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_LOCATION_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <LocationMasterForm
        values={form.values}
        errors={form.errors}
        auditLog={auditLog}
        custodianOptions={buildCustodianOptions(
          refs.custodians,
          form.values.CUSTODIAN_ID,
          refs.custodiansLoading,
        )}
        custodiansLoading={refs.custodiansLoading}
        subCustodianOptions={buildSubCustodianOptions(
          refs.custodians,
          form.values.CUSTODIAN_ID,
          form.values.SUB_CUSTODIAN_ID,
          refs.custodiansLoading,
        )}
        departmentOptions={buildDepartmentOptions(
          refs.departments,
          form.values.DEPT_ID,
          refs.departmentsLoading,
        )}
        departmentsLoading={refs.departmentsLoading}
        locationNameRef={locationNameRef}
        submitLabel={'Update'}
        submitting={submitting}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default LocationMasterEdit
