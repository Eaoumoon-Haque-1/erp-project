/**
 * @file Shared reusable UI/workflow component: ListRowActions.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useContext } from 'react'
import {
  beginAction,
  cancelAction,
  confirmAction,
  finishAction,
  showError,
  showSuccess,
  successMessage,
} from './actionAlerts'
import ListActionContext from './ListActionContext'

// An omitted handler intentionally disables the corresponding action. Never
// pass an empty function merely to make an unfinished action look enabled.
function ActionButton({ label, className, onClick, children }) {
  return (
    <button
      type={'button'}
      className={[
        'inline-flex h-6 w-[34px] items-center justify-center rounded px-2 py-[3px] text-sm text-white shadow-sm transition',
        'hover:-translate-y-px hover:brightness-95 hover:shadow',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      ].join(' ')}
      aria-label={label}
      title={label}
      disabled={!onClick}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ActionIcon({ type }) {
  const paths = {
    view: <><path d={'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z'} /><circle cx={'12'} cy={'12'} r={'2.5'} /></>,
    edit: <><path d={'M12 20h9'} /><path d={'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'} /></>,
    delete: <><path d={'M4 7h16'} /><path d={'M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5'} /></>,
    status: <><circle cx={'12'} cy={'12'} r={'9'} /><path d={'m8.5 12 2.2 2.2 4.8-5'} /></>,
  }

  return (
    <svg
      viewBox={'0 0 24 24'}
      className={'size-4'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
    >
      {paths[type]}
    </svg>
  )
}

function ListRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  entityName,
  editLabel = 'Edit',
  showUnavailable = true,
}) {
  const listEntityName = useContext(ListActionContext)
  const resolvedEntityName = entityName || listEntityName
  const runAction = async (action, handler) => {
    const confirmed = await confirmAction({ action, entityName: resolvedEntityName })
    if (!confirmed) return

    const token = beginAction({ action, entityName: resolvedEntityName })
    try {
      const handlerResult = await handler(row)
      const result = finishAction(token)
      if (handlerResult === false || result?.failed) {
        await showError(result?.message)
        return
      }
      await showSuccess(successMessage(action, resolvedEntityName))
    } catch (error) {
      cancelAction(token)
      await showError(error?.message)
    }
  }

  return (
    <div className={'inline-flex items-center gap-1'}>
      {(showUnavailable || onView) && (
        <ActionButton
          label={'View'}
          className={'bg-action-view'}
          onClick={onView ? () => onView(row) : undefined}
        >
          <ActionIcon type={'view'} />
        </ActionButton>
      )}
      {(showUnavailable || onEdit) && (
        <ActionButton
          label={editLabel}
          className={'bg-action-edit'}
          onClick={onEdit ? () => onEdit(row) : undefined}
        >
          <ActionIcon type={'edit'} />
        </ActionButton>
      )}
      {(showUnavailable || onDelete) && (
        <ActionButton
          label={'Delete'}
          className={'bg-action-danger'}
          onClick={onDelete ? () => runAction('delete', onDelete) : undefined}
        >
          <ActionIcon type={'delete'} />
        </ActionButton>
      )}
      {(showUnavailable || onStatusChange) && (
        <ActionButton
          label={'Change status'}
          className={'bg-action-success'}
          onClick={onStatusChange ? () => runAction('status', onStatusChange) : undefined}
        >
          <ActionIcon type={'status'} />
        </ActionButton>
      )}
    </div>
  )
}

export default ListRowActions
