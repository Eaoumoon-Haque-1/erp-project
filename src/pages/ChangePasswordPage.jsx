/**
 * @file Authenticated Change Password page. On success the backend returns a new
 * access token (the old one stops working); it replaces the stored session token
 * through AuthProvider so the user stays logged in.
 */
import { useRef, useState } from 'react'
import { changePassword, getAuthErrorMessage } from '../api/authApi'
import { showSuccess } from '../components/shared/actionAlerts'
import PageHeader from '../components/shared/PageHeader'
import PasswordInput from '../components/shared/PasswordInput'
import PasswordPolicy from '../components/shared/PasswordPolicy'
import useAuth from '../auth/useAuth'
import { isPasswordPolicyMet } from '../utils/passwordPolicy'

const emptyValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

function ChangePasswordPage() {
  const { replaceAccessToken } = useAuth()
  const currentRef = useRef(null)
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const validate = () => {
    const next = {}
    if (!values.currentPassword) next.currentPassword = 'Current password is required.'
    if (!values.newPassword) next.newPassword = 'New password is required.'
    else if (!isPasswordPolicyMet(values.newPassword)) next.newPassword = 'New password does not meet the requirements.'
    else if (values.newPassword === values.currentPassword) {
      next.newPassword = 'New password must be different from the current password.'
    }
    if (!values.confirmPassword) next.confirmPassword = 'Confirm password is required.'
    else if (values.confirmPassword !== values.newPassword) next.confirmPassword = 'Passwords do not match.'
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const response = await changePassword({ ...values })
      replaceAccessToken(response)
      setValues(emptyValues)
      setErrors({})
      await showSuccess(response?.message || 'Password changed successfully.')
    } catch (error) {
      // A 401 is handled globally by the shared client (session cleared, redirect to login).
      if (error.response?.status === 401) return
      const apiMessage = getAuthErrorMessage(error, 'Unable to change password.')
      setMessage(apiMessage)
      if (/current password is incorrect/i.test(apiMessage)) {
        setValues(emptyValues)
        requestAnimationFrame(() => currentRef.current?.focus())
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={'erp-list-page'}>
      <PageHeader title={'Change Password'} />
      <section className={'erp-form-card'}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={'erp-form-grid'}>
            <PasswordInput id={'currentPassword'} name={'currentPassword'} label={'Current Password'} value={values.currentPassword} error={errors.currentPassword} autoComplete={'current-password'} inputRef={currentRef} onChange={handleChange} />
            <PasswordInput id={'newPassword'} name={'newPassword'} label={'New Password'} value={values.newPassword} error={errors.newPassword} autoComplete={'new-password'} onChange={handleChange} />
            <PasswordInput id={'confirmPassword'} name={'confirmPassword'} label={'Confirm Password'} value={values.confirmPassword} error={errors.confirmPassword} autoComplete={'new-password'} onChange={handleChange} />
          </div>
          <PasswordPolicy password={values.newPassword} confirmPassword={values.confirmPassword} />
          {message && <p className={'auth-error'} role={'alert'}>{message}</p>}
          <div className={'erp-form-actions'}>
            <button type={'submit'} className={'primary-button'} disabled={submitting}>
              {submitting ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ChangePasswordPage
