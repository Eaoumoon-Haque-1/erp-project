/**
 * @file Feature UI component for Employee Information: EmployeeSectionCard.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function EmployeeSectionCard({ title, tableName, children, className = '' }) {
  return (
    <section className={['erp-employee-card', className].filter(Boolean).join(' ')} data-table={tableName}>
      <h2 className={'erp-employee-section-title'}>{title}</h2>
      {children}
    </section>
  )
}

export default EmployeeSectionCard
