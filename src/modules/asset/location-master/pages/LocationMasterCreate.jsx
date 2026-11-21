/**
 * @file Create-page controller for Location Master.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 * Dropdown data for Custodian, Sub Custodian, and Department strictly come from session bgId and buId.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetLocationsApi } from '../../../../api/assetLocation'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import LocationMasterForm from '../components/LocationMasterForm'
import { mapLocationMasterToApi } from '../data/locationMasterApiMapper'
import {
  buildCustodianOptions,
  buildDepartmentOptions,
  buildSubCustodianOptions,
} from '../data/locationMasterOptions'
import useLocationMasterForm from '../data/useLocationMasterForm'
import useLocationReferences from '../data/useLocationReferences'
import { ASSET_LOCATION_TABLE, createInitialLocationMasterValues } from '../validation/locationMasterValidation'

const listPath = '/asset/location-master'

function LocationMasterCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()

  const locationNameRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)

  const form = useLocationMasterForm({
    ...createInitialLocationMasterValues(),
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  })

  // Ensure BG_ID is populated if only buId is in the session
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

  // Sync session buId and bgId into form values
  useEffect(() => {
    if (sessionBusinessUnitId || resolvedGroupId) {
      form.handleChange({
        target: {
          name: 'BU_ID',
          value: sessionBusinessUnitId || form.values.BU_ID,
        },
      })
      if (resolvedGroupId) {
        form.handleChange({
          target: {
            name: 'BG_ID',
            value: resolvedGroupId,
          },
        })
      }
    }
  }, [sessionBusinessUnitId, resolvedGroupId])

  // References are strictly filtered by the session business unit and resolved group
  const refs = useLocationReferences({
    buId: sessionBusinessUnitId || form.values.BU_ID,
    groupId: resolvedGroupId || sessionGroupId,
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = form.validate()
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await assetLocationsApi.create(
        mapLocationMasterToApi(result.values, {
          bgId: resolvedGroupId || sessionGroupId || result.values.BG_ID,
          buId: sessionBusinessUnitId || result.values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      await form.failWithApiError(error, 'Unable to create Location.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset({
      ...createInitialLocationMasterValues(),
      BG_ID: resolvedGroupId || sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    requestAnimationFrame(() => locationNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Location Master Create'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      tableName={ASSET_LOCATION_TABLE}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <LocationMasterForm
        values={form.values}
        errors={form.errors}
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
        submitLabel={'Save'}
        submitting={submitting}
        onChange={form.handleChange}
      />
    </FormPage>
  )
}

export default LocationMasterCreate
