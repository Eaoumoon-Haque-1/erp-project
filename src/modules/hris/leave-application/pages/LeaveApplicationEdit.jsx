/** @file API-backed Leave Application edit page for draft records. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { leaveApplicationsApi } from '../api/leaveApplicationApi'
import LeaveApplicationForm from '../components/LeaveApplicationForm'
import { leaveApplicationFieldMap, mapLeaveApplicationFromApi, mapLeaveApplicationToApi } from '../data/leaveApplicationApiMapper'
import { loadLeaveApplicationReferences, mapLeaveBalanceOptions } from '../data/leaveApplicationReferences'
import { LEAVE_APPLICATION_TABLE, createInitialLeaveApplicationValues, validateLeaveApplication } from '../validation/leaveApplicationValidation'

const listPath = '/hris/hris-forms/leave-application'

function LeaveApplicationEdit() {
  const { leaveApplicationId } = useParams()
  const navigate = useNavigate()
  const employeeRef = useRef(null)
  const fileRef = useRef(null)
  const [values, setValues] = useState(createInitialLeaveApplicationValues)
  const [original, setOriginal] = useState(createInitialLeaveApplicationValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(null)
  const [categoryOptions, setCategoryOptions] = useState([])
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const employeeId = values.EMPLOYEE_ID
  const fromDate = values.FROM_DATE
  const toDate = values.TO_DATE
  const leaveCategoryId = values.LEAVE_CATEGORY_ID
  const leaveCategoryName = values.LEAVE_CATEGORY

  useEffect(() => {
    let active = true
    Promise.all([leaveApplicationsApi.get(leaveApplicationId), loadLeaveApplicationReferences()])
      .then(([record, loaded]) => {
        if (!active) return
        const mapped = mapLeaveApplicationFromApi(record, loaded)
        setReferences(loaded); setValues(mapped); setOriginal(mapped)
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Leave Application.'))
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [leaveApplicationId])

  useEffect(() => {
    if (!employeeId) return undefined
    let active = true
    const year = Number((fromDate || new Date().toISOString().slice(0, 10)).slice(0, 4))
    leaveApplicationsApi.availableCategories(employeeId, year)
      .then((records) => {
        if (!active) return
        const options = mapLeaveBalanceOptions(records)
        if (leaveCategoryId && !options.some((item) => item.value === leaveCategoryId)) {
          options.push({ value: leaveCategoryId, label: leaveCategoryName || leaveCategoryId, balance: '' })
        }
        setCategoryOptions(options)
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load available leave categories.'))
    return () => { active = false }
  }, [employeeId, fromDate, leaveCategoryId, leaveCategoryName])

  useEffect(() => {
    if (!employeeId || !leaveCategoryId || !fromDate || !toDate || toDate < fromDate) return undefined
    let active = true
    leaveApplicationsApi.calculate({ employeeId, leaveCategoryId, fromDate, toDate })
      .then((result) => {
        if (active) setValues((current) => ({ ...current,
          TOTAL_LEAVE_DAYS: String(result.totalLeaveDays ?? ''),
          LEAVE_BALANCE: String(result.remainingLeaveDays ?? current.LEAVE_BALANCE),
        }))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to calculate leave days.'))
    return () => { active = false }
  }, [employeeId, fromDate, leaveCategoryId, toDate])

  const handleChange = (event) => {
    const { name, type, value, checked, files } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : type === 'file' ? files?.[0] ?? null : value
    setValues((current) => ({ ...current, [name]: nextValue,
      ...((name === 'FROM_DATE' || name === 'TO_DATE') ? { TOTAL_LEAVE_DAYS: '' } : {}),
      ...(name === 'LEAVE_CATEGORY_ID' ? {
        LEAVE_CATEGORY: categoryOptions.find((item) => item.value === nextValue)?.label || '',
        LEAVE_BALANCE: categoryOptions.find((item) => item.value === nextValue)?.balance || '', TOTAL_LEAVE_DAYS: '',
      } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleEmployeeChange = (event) => {
    const employee = references?.employeeById.get(event.target.value)
    if (!employee) setCategoryOptions([])
    setValues((current) => ({ ...current,
      EMPLOYEE_ID: employee ? String(employee.id) : '', BU_ID: employee ? String(employee.buId ?? '') : '',
      BUSINESS_UNIT: employee ? references.businessUnitNames.get(String(employee.buId)) || '' : '',
      DEPT_ID: employee ? String(employee.deptId ?? '') : '',
      DEPARTMENT: employee ? references.departmentNames.get(String(employee.deptId)) || '' : '',
      DESIGNATION_ID: employee ? String(employee.desigId ?? '') : '',
      DESIGNATION: employee ? references.designationNames.get(String(employee.desigId)) || '' : '',
      EMP_TYPE_ID: employee ? String(employee.employmentTypeId ?? '') : '',
      EMPLOYEE_TYPE: employee ? references.employmentTypeNames.get(String(employee.employmentTypeId)) || '' : '',
      LEAVE_CATEGORY_ID: '', LEAVE_CATEGORY: '', LEAVE_BALANCE: '', TOTAL_LEAVE_DAYS: '',
    }))
  }

  const saveApplication = async (submit) => {
    const result = validateLeaveApplication({ ...values, STATUS: submit ? '1' : '0' })
    setValues(result.values); setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return false
    }
    setSubmitting(true)
    try {
      await leaveApplicationsApi.update(leaveApplicationId, await mapLeaveApplicationToApi(result.values), submit)
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Leave Application.', leaveApplicationFieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleSubmit = (event) => { event.preventDefault(); return saveApplication(true) }
  const handleReset = () => {
    setValues(original); setErrors({})
    if (fileRef.current) fileRef.current.value = ''
    requestAnimationFrame(() => employeeRef.current?.focus())
  }

  return (
    <FormPage title={'Leave Application Edit'} listTo={listPath} tableName={LEAVE_APPLICATION_TABLE}
      onSubmit={handleSubmit} onDraft={() => saveApplication(false)} draftLabel={'Update Draft'}
      submitLabel={'Update and Submit'} onReset={handleReset} submitting={submitting}>
      <LeaveApplicationForm values={values} errors={errors} employeeRef={employeeRef} fileRef={fileRef}
        employeeOptions={references?.employeeOptions || []} leaveCategoryOptions={categoryOptions}
        referencesLoading={referencesLoading} onChange={handleChange} onEmployeeChange={handleEmployeeChange} />
    </FormPage>
  )
}

export default LeaveApplicationEdit
