/**
 * @file Public Forgot Password page: request OTP -> verify OTP -> new password.
 * The three steps live in component state; the OTP, reset token and passwords are
 * never logged or persisted (no storage, no URL) and are cleared when no longer needed.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, getAuthErrorMessage, resetPassword, verifyOtp } from '../api/authApi'
import PasswordInput from '../components/shared/PasswordInput'
import PasswordPolicy from '../components/shared/PasswordPolicy'
import { isPasswordPolicyMet } from '../utils/passwordPolicy'

const RESEND_SECONDS = 60
const REDIRECT_DELAY_MS = 3000
const GENERIC_MESSAGE = 'If an account exists, an OTP has been sent to its email'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const firstInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [done, setDone] = useState(false)

  // Focus moves to the first input whenever the step changes.
  useEffect(() => {
    requestAnimationFrame(() => firstInputRef.current?.focus())
  }, [step])

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return undefined
    const timer = setTimeout(() => setCountdown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  useEffect(() => {
    if (!done) return undefined
    const timer = setTimeout(() => navigate('/login', { replace: true }), REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [done, navigate])

  const goToStep1 = (nextMessage = '') => {
    setStep(1)
    setOtp('')
    setResetToken('')
    setPasswords({ newPassword: '', confirmPassword: '' })
    setErrors({})
    setInfo('')
    setMessage(nextMessage)
  }

  const handleRequestOtp = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!identifier.trim()) {
      setErrors({ identifier: 'Username or email is required.' })
      return
    }

    setSubmitting(true)
    setMessage('')
    setErrors({})
    try {
      const response = await forgotPassword({ identifier: identifier.trim() })
      // Always advance on 200 with the generic message: never reveal whether the account exists.
      setInfo(response?.message || GENERIC_MESSAGE)
      setOtp('')
      setCountdown(RESEND_SECONDS)
      setStep(2)
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Unable to send the OTP.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (submitting || countdown > 0) return
    setSubmitting(true)
    setMessage('')
    try {
      const response = await forgotPassword({ identifier: identifier.trim() })
      setInfo(response?.message || GENERIC_MESSAGE)
      setCountdown(RESEND_SECONDS)
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Unable to resend the OTP.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'Enter the 6-digit OTP.' })
      return
    }

    setSubmitting(true)
    setMessage('')
    setErrors({})
    try {
      const response = await verifyOtp({ identifier: identifier.trim(), otp })
      setResetToken(response?.resetToken || '')
      setOtp('')
      setInfo('')
      setStep(3)
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Invalid or expired OTP'))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = {}
    if (!passwords.newPassword) nextErrors.newPassword = 'New password is required.'
    else if (!isPasswordPolicyMet(passwords.newPassword)) nextErrors.newPassword = 'New password does not meet the requirements.'
    if (!passwords.confirmPassword) nextErrors.confirmPassword = 'Confirm password is required.'
    else if (passwords.confirmPassword !== passwords.newPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const response = await resetPassword({ resetToken, ...passwords })
      setInfo(response?.message || 'Password has been reset. Please log in.')
      setResetToken('')
      setPasswords({ newPassword: '', confirmPassword: '' })
      setDone(true)
    } catch (error) {
      const apiMessage = getAuthErrorMessage(error, 'Unable to reset the password.')
      if (/invalid or expired reset token/i.test(apiMessage)) goToStep1(apiMessage)
      else setMessage(apiMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const titles = { 1: 'Forgot Password', 2: 'Verify OTP', 3: 'New Password' }
  const subtitles = {
    1: 'Enter your username or email to receive an OTP.',
    2: 'Enter the 6-digit OTP sent to your email.',
    3: 'Choose a new password for your account.',
  }

  return (
    <main className={'auth-page'}>
      <section className={'auth-card'} aria-labelledby={'forgot-title'}>
        <div className={'auth-brand'}>
          <img src={'/images/logo_HR Expert.png'} alt={'Health Expert'} />
        </div>
        <div className={'auth-card-heading'}>
          <h1 id={'forgot-title'}>{titles[step]}</h1>
          <p>{subtitles[step]}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestOtp} noValidate>
            <div className={'auth-field'}>
              <label className={'erp-field-label'} htmlFor={'identifier'}>
                Username or Email <span className={'erp-required'}>*</span>
              </label>
              <input
                ref={firstInputRef}
                id={'identifier'}
                name={'identifier'}
                className={['erp-form-control', errors.identifier ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')}
                value={identifier}
                autoComplete={'username'}
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                onChange={(event) => {
                  setIdentifier(event.target.value)
                  setErrors({})
                  setMessage('')
                }}
              />
              {errors.identifier && <p id={'identifier-error'} className={'erp-field-error'} role={'alert'}>{errors.identifier}</p>}
            </div>
            {message && <p className={'auth-error'} role={'alert'}>{message}</p>}
            <button type={'submit'} className={'primary-button auth-submit'} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send OTP'}
            </button>
            <p className={'auth-field-link'}>
              <Link to={'/login'}>Back to login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            {info && <p className={'auth-info'} aria-live={'polite'}>{info}</p>}
            <div className={'auth-field'}>
              <label className={'erp-field-label'} htmlFor={'otp'}>
                OTP <span className={'erp-required'}>*</span>
              </label>
              <input
                ref={firstInputRef}
                id={'otp'}
                name={'otp'}
                className={['erp-form-control', errors.otp ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')}
                value={otp}
                inputMode={'numeric'}
                autoComplete={'one-time-code'}
                maxLength={6}
                aria-invalid={Boolean(errors.otp)}
                aria-describedby={errors.otp ? 'otp-error' : 'otp-hint'}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                  setErrors({})
                  setMessage('')
                }}
              />
              {errors.otp && <p id={'otp-error'} className={'erp-field-error'} role={'alert'}>{errors.otp}</p>}
            </div>
            <p id={'otp-hint'} className={'auth-hint'}>OTP is valid for 5 minutes.</p>
            {message && <p className={'auth-error'} role={'alert'}>{message}</p>}
            <button type={'submit'} className={'primary-button auth-submit'} disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className={'auth-step-actions'}>
              <button type={'button'} className={'auth-link'} onClick={() => goToStep1()}>
                Change identifier
              </button>
              <button type={'button'} className={'auth-link'} disabled={submitting || countdown > 0} onClick={handleResend}>
                Resend OTP
              </button>
            </div>
            <p className={'auth-hint'} aria-live={'polite'}>
              {countdown > 0 ? `You can request a new OTP in ${countdown}s.` : 'You can request a new OTP now.'}
            </p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate>
            {done ? (
              <>
                <p className={'auth-info'} role={'status'}>{info}</p>
                <button type={'button'} className={'primary-button auth-submit'} onClick={() => navigate('/login', { replace: true })}>
                  Go to login
                </button>
              </>
            ) : (
              <>
                <PasswordInput id={'newPassword'} name={'newPassword'} label={'New Password'} value={passwords.newPassword} error={errors.newPassword} autoComplete={'new-password'} inputRef={firstInputRef} className={'auth-field'} onChange={handlePasswordChange} />
                <PasswordInput id={'confirmPassword'} name={'confirmPassword'} label={'Confirm Password'} value={passwords.confirmPassword} error={errors.confirmPassword} autoComplete={'new-password'} className={'auth-field'} onChange={handlePasswordChange} />
                <PasswordPolicy password={passwords.newPassword} confirmPassword={passwords.confirmPassword} />
                {message && <p className={'auth-error'} role={'alert'}>{message}</p>}
                <button type={'submit'} className={'primary-button auth-submit'} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Reset Password'}
                </button>
              </>
            )}
          </form>
        )}
      </section>
    </main>
  )
}

export default ForgotPasswordPage
