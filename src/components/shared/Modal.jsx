/**
 * @file Shared reusable UI/workflow component: Modal.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useEffect } from 'react'

function Modal({ title, open, onClose, children, panelClassName = '' }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className={'erp-modal-backdrop'}
      role={'presentation'}
      onMouseDown={onClose}
    >
      <section
        className={['erp-modal-panel', panelClassName].filter(Boolean).join(' ')}
        role={'dialog'}
        aria-modal={'true'}
        aria-labelledby={'erp-modal-title'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={'erp-modal-header'}>
          <h2 id={'erp-modal-title'}>{title}</h2>
          <button
            type={'button'}
            className={'erp-modal-close'}
            aria-label={'Close'}
            onClick={onClose}
          >
            &times;
          </button>
        </header>
        <div className={'erp-modal-body'}>{children}</div>
      </section>
    </div>
  )
}

export default Modal
