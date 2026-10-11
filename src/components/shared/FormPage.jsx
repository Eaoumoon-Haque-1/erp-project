/**
 * @file Shared reusable UI/workflow component: FormPage.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import PageHeader from './PageHeader'
import {
  getEntityNameFromTitle,
  runConfirmedFormSubmit,
} from './actionAlerts'

/**
 * Standard create/edit page shell.
 * Feature pages own state and validation, then pass their rendered fields as
 * children. `onDraft` adds an optional action without changing normal forms.
 */
function FormPage({
  title,
  listTo,
  onSubmit,
  onReset,
  children,
  tableName,
  submitting = false,
  onDraft,
  draftLabel = 'Save as Draft',
  submitLabel = 'Save',
}) {
  const entityName = getEntityNameFromTitle(title)
  const action = submitLabel.toLowerCase().includes('update') ? 'update' : 'create'

  const handleSubmit = (event) => runConfirmedFormSubmit(
    event,
    { action, entityName },
    onSubmit,
  )

  const handleDraft = (event) => runConfirmedFormSubmit(
    {
      preventDefault: () => {},
      currentTarget: event.currentTarget.form,
    },
    { action: 'draft', entityName },
    onDraft,
  )

  return (
    <div className={'erp-list-page'}>
      {/* listTo controls the standard List link shown on create/edit pages. */}
      <PageHeader title={title} actionLabel={'List'} actionTo={listTo} />
      <section className={'erp-form-card'}>
        {/* Feature controls are provided through children; this shell owns only shared actions. */}
        <form data-table={tableName} onSubmit={handleSubmit} onReset={onReset} noValidate>
          {children}
          <div className={'erp-form-actions'}>
            <button type={'reset'} className={'secondary-button'} disabled={submitting}>
              Reset
            </button>
            {onDraft && (
              // Draft is optional; ordinary forms do not render this button.
              <button
                type={'button'}
                className={'secondary-button'}
                disabled={submitting}
                onClick={handleDraft}
              >
                {draftLabel}
              </button>
            )}
            <button type={'submit'} className={'primary-button'} disabled={submitting}>
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default FormPage
