/**
 * @file Shared reusable UI/workflow component: FormPage.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import PageHeader from './PageHeader'

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
  message,
  messageTone = 'success',
  tableName,
  submitting = false,
  onDraft,
  draftLabel = 'Save as Draft',
  submitLabel = 'Save',
}) {
  return (
    <div className={'erp-list-page'}>
      {/* listTo controls the standard List link shown on create/edit pages. */}
      <PageHeader title={title} actionLabel={'List'} actionTo={listTo} />
      <section className={'erp-form-card'}>
        {/* Feature controls are provided through children; this shell owns only shared actions. */}
        <form data-table={tableName} onSubmit={onSubmit} onReset={onReset} noValidate>
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
                onClick={onDraft}
              >
                {draftLabel}
              </button>
            )}
            <button type={'submit'} className={'primary-button'} disabled={submitting}>
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </div>
          {message && <p className={messageTone === 'error' ? 'erp-form-message erp-form-message-error' : 'erp-form-message'} role={messageTone === 'error' ? 'alert' : 'status'}>{message}</p>}
        </form>
      </section>
    </div>
  )
}

export default FormPage
