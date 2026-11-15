/**
 * @file Password field with a show/hide toggle, using the existing auth/erp input styles.
 * The wrapper takes an optional className (e.g. 'auth-field' on the public auth pages).
 */
import { useState } from 'react'

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

function PasswordInput({
  id,
  name,
  label,
  value,
  error,
  autoComplete,
  inputRef,
  required = true,
  className,
  onChange,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <label className={'erp-field-label'} htmlFor={id}>
        {label}{required && <> <span className={'erp-required'}>*</span></>}
      </label>
      <div className={'auth-password-field'}>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className={['erp-form-control', error ? 'erp-form-control-invalid' : ''].filter(Boolean).join(' ')}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onChange}
        />
        <button
          type={'button'}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
      {error && <p id={`${id}-error`} className={'erp-field-error'} role={'alert'}>{error}</p>}
    </div>
  )
}

export default PasswordInput
