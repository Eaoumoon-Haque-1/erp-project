/**
 * @file Client-side mirror of the backend password policy (the backend stays the
 * source of truth): 8-64 characters with an uppercase, lowercase, digit and special character.
 */
export const PASSWORD_RULES = [
  { key: 'length', label: '8-64 characters', test: (value) => value.length >= 8 && value.length <= 64 },
  { key: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'digit', label: 'One digit', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'One special character', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
]

export const isPasswordPolicyMet = (value) => PASSWORD_RULES.every((rule) => rule.test(value))
