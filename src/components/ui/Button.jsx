/**
 * @file Small generic UI primitive: Button.
 * Sections: style variants/props and the rendered primitive.
 * Keep this component domain-neutral and compose it from feature/shared components.
 */
function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  const variantClass = variant === 'icon' ? 'icon-button' : 'primary-button'

  return (
    <button
      type={type}
      className={[variantClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export default Button
