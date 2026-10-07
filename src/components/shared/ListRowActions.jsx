/**
 * @file Shared reusable UI/workflow component: ListRowActions.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
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

function ListRowActions({ row, onView, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={'inline-flex items-center gap-1'}>
      <ActionButton
        label={'View'}
        className={'bg-action-view'}
        onClick={onView ? () => onView(row) : undefined}
      >
        <ActionIcon type={'view'} />
      </ActionButton>
      <ActionButton
        label={'Edit'}
        className={'bg-action-edit'}
        onClick={onEdit ? () => onEdit(row) : undefined}
      >
        <ActionIcon type={'edit'} />
      </ActionButton>
      <ActionButton
        label={'Delete'}
        className={'bg-action-danger'}
        onClick={onDelete ? () => onDelete(row) : undefined}
      >
        <ActionIcon type={'delete'} />
      </ActionButton>
      <ActionButton
        label={'Change status'}
        className={'bg-action-success'}
        onClick={onStatusChange ? () => onStatusChange(row) : undefined}
      >
        <ActionIcon type={'status'} />
      </ActionButton>
    </div>
  )
}

export default ListRowActions
