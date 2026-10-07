/**
 * @file Small generic UI primitive: Card.
 * Sections: style variants/props and the rendered primitive.
 * Keep this component domain-neutral and compose it from feature/shared components.
 */
function Card({ className = '', ...props }) {
  return <section className={['app-card', className].filter(Boolean).join(' ')} {...props} />
}

export default Card
