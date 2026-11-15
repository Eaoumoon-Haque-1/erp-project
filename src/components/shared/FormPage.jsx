/**
 * @file Shared reusable UI/workflow component: FormPage.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { Link } from 'react-router-dom'
import PageHeader from './PageHeader'
import {
  getEntityNameFromTitle,
  runConfirmedFormSubmit,
} from './actionAlerts'

/**
 * Standard create/edit page shell.
 * Feature pages own state and validation, then pass their rendered fields as
 * children. `onDraft` adds an optional action without changing normal forms.
 * `onValidate` (optional) returns false to stop submit before the confirm dialog.
 */
function FormPage({
  title,
  listTo,
  backTo,
  backLabel,
  createTo,
  createLabel = 'Create New',
  actionLabel,
  actionTo,
  actions = [],
  onSubmit,
  onReset,
  children,
  tableName,
  submitting = false,
  onDraft,
  draftLabel = 'Save as Draft',
  submitLabel = 'Save',
  onValidate,
  hideActions = false,
  afterActions = null,
}) {
  const entityName = getEntityNameFromTitle(title)
  const isEditPage = submitLabel.toLowerCase().includes('update') || (Boolean(title) && title.toLowerCase().includes('edit'))
  const isViewPage = Boolean(title) && title.toLowerCase().includes('view')
  const action = isEditPage ? 'update' : 'create'

  const resolvedBackTo = backTo || listTo || actionTo
  const resolvedBackLabel = backLabel || (actionLabel && actionLabel !== 'List' ? actionLabel : 'Back to List')

  const resolvedCreateTo = createTo || ((isEditPage || isViewPage) && resolvedBackTo ? `${resolvedBackTo.replace(/\/$/, '')}/create` : null)

  const headerActions = []
  if ((isEditPage || isViewPage || createTo) && resolvedCreateTo) {
    headerActions.push({
      label: createLabel,
      to: resolvedCreateTo,
      variant: 'primary',
    })
  }
  if (Array.isArray(actions)) {
    headerActions.push(...actions)
  }

  const handleSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault()
    if (!onSubmit) return false
    // Optional: lets a page show its own inline errors before the confirm dialog opens.
    if (onValidate && !onValidate()) {
      return false
    }
    return runConfirmedFormSubmit(event, { action, entityName }, onSubmit)
  }

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
      {/* PageHeader with Back to List and Create New actions */}
      <PageHeader
        title={title}
        actionLabel={resolvedBackTo ? resolvedBackLabel : undefined}
        actionTo={resolvedBackTo}
        actionVariant={'secondary'}
        actions={headerActions}
      />
      <section className={'erp-form-card'}>
        {/* Feature controls are provided through children; this shell owns only shared actions. */}
        <form data-table={tableName} onSubmit={handleSubmit} onReset={onReset} noValidate method={'post'} action={'#'}>
          {children}
          {!hideActions && (
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
          )}
          {afterActions}
        </form>
      </section>
    </div>
  )
}

export default FormPage
