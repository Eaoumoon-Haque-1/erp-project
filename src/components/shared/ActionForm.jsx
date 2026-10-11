/** @file Form wrapper for custom layouts that need the global action workflow. */
import { forwardRef } from 'react'
import { runConfirmedFormSubmit } from './actionAlerts'

const ActionForm = forwardRef(function ActionForm({
  action = 'create',
  entityName,
  successText,
  onSubmit,
  children,
  ...formProps
}, ref) {
  const handleSubmit = (event) => runConfirmedFormSubmit(
    event,
    { action, entityName, successText },
    onSubmit,
  )

  return <form ref={ref} {...formProps} onSubmit={handleSubmit}>{children}</form>
})

export default ActionForm
