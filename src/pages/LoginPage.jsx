/**
 * @file Basic API-backed login page using the established Health Expert style.
 * Validation stays local; successful authentication returns the user to the
 * originally requested route.
 */
import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { IS_MOCK_API_ENABLED } from '../api/client'
import useAuth from '../auth/useAuth'

function EyeIcon({ hidden }) {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
    >
      {hidden ? (
        <>
          <path d={'M3 3l18 18'} />
          <path d={'M10.6 10.6a2 2 0 0 0 2.8 2.8'} />
          <path d={'M9.9 4.2A10.5 10.5 0 0 1 21 12a14 14 0 0 1-2.1 3.2'} />
          <path d={'M6.6 6.6A14 14 0 0 0 3 12c2.3 4 5.3 6 9 6a9.7 9.7 0 0 0 3-.5'} />
        </>
      ) : (
        <>
          <path d={'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12'} />
          <circle cx={'12'} cy={'12'} r={'2.5'} />
        </>
      )}
    </svg>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const usernameRef = useRef(null)
  const [values, setValues] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) return <Navigate to={'/'} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!values.username.trim()) nextErrors.username = 'Username is required.'
    if (!values.password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid=true]')?.focus(),
      )
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      await login({
        username: values.username.trim(),
        password: values.password,
      })
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (error) {
      const apiMessage =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Invalid username or password.'
          : 'Unable to sign in. Please try again.')
      setMessage(apiMessage)
      requestAnimationFrame(() => usernameRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={'auth-page'}>
      <section className={'auth-card'} aria-labelledby={'login-title'}>
        <div className={'auth-brand'}>
          <img src={'/images/logo_HR Expert.png'} alt={'Health Expert'} />
        </div>
        <div className={'auth-card-heading'}>
          <h1 id={'login-title'}>Login</h1>
          <p>Sign in to continue to Cloud ERP.</p>
        </div>
        {IS_MOCK_API_ENABLED && (
          <p className={'erp-form-message'} role={'status'}>
            Development mock mode is active. Use any non-empty username and password.
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className={'auth-field'}>
            <label className={'erp-field-label'} htmlFor={'username'}>
              Username <span className={'erp-required'}>*</span>
            </label>
            <input
              ref={usernameRef}
              id={'username'}
              name={'username'}
              className={[
                'erp-form-control',
                errors.username ? 'erp-form-control-invalid' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.username}
              autoComplete={'username'}
              autoFocus
              aria-invalid={Boolean(errors.username)}
              onChange={handleChange}
            />
            {errors.username && (
              <p className={'erp-field-error'}>{errors.username}</p>
            )}
          </div>
          <div className={'auth-field'}>
            <label className={'erp-field-label'} htmlFor={'password'}>
              Password <span className={'erp-required'}>*</span>
            </label>
            <div className={'auth-password-field'}>
              <input
                id={'password'}
                name={'password'}
                type={showPassword ? 'text' : 'password'}
                className={[
                  'erp-form-control',
                  errors.password ? 'erp-form-control-invalid' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                value={values.password}
                autoComplete={'current-password'}
                aria-invalid={Boolean(errors.password)}
                onChange={handleChange}
              />
              <button
                type={'button'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            {errors.password && (
              <p className={'erp-field-error'}>{errors.password}</p>
            )}
          </div>
          {message && (
            <p className={'auth-error'} role={'alert'}>
              {message}
            </p>
          )}
          <button
            type={'submit'}
            className={'primary-button auth-submit'}
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
