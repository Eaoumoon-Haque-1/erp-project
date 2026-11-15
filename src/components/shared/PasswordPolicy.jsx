/** @file Live password-policy checklist (and optional "passwords match" line). */
import { PASSWORD_RULES } from '../../utils/passwordPolicy'

function PasswordPolicy({ password, confirmPassword }) {
  const showMatch = confirmPassword !== undefined
  const items = [
    ...PASSWORD_RULES.map((rule) => ({ key: rule.key, label: rule.label, met: rule.test(password) })),
    ...(showMatch
      ? [{ key: 'match', label: 'Passwords match', met: Boolean(confirmPassword) && confirmPassword === password }]
      : []),
  ]

  return (
    <ul className={'password-policy'} aria-label={'Password requirements'}>
      {items.map((item) => (
        <li key={item.key} className={item.met ? 'is-met' : undefined}>
          <span aria-hidden={'true'}>{item.met ? '✓' : '○'}</span> {item.label}
          <span className={'sr-only'}>{item.met ? ' (met)' : ' (not met)'}</span>
        </li>
      ))}
    </ul>
  )
}

export default PasswordPolicy
