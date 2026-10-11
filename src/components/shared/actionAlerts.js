/**
 * @file Central confirmation, result, and action-state service.
 * Feature code must use this adapter instead of importing SweetAlert2 directly.
 */
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const alertClasses = {
  popup: 'erp-action-alert',
  confirmButton: 'primary-button erp-action-alert-button',
  cancelButton: 'secondary-button erp-action-alert-button',
}

let activeAction = null

function sentenceCase(value) {
  const text = String(value || 'record').trim()
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Record'
}

export function getEntityNameFromTitle(title) {
  return String(title || 'record')
    .replace(/\s+(Create|Edit|List)$/i, '')
    .trim() || 'record'
}

export function beginAction(meta = {}) {
  const token = Symbol('action')
  activeAction = { token, failed: false, message: '', ...meta }
  return token
}

export function failActiveAction(message = '') {
  if (!activeAction) return false
  activeAction.failed = true
  if (message) activeAction.message = message
  return true
}

export function finishAction(token) {
  if (!activeAction || activeAction.token !== token) return null
  const result = activeAction
  activeAction = null
  return result
}

export function cancelAction(token) {
  if (activeAction?.token === token) activeAction = null
}

export async function confirmAction({ action = 'create', entityName = 'record' } = {}) {
  const entity = sentenceCase(entityName)
  const messages = {
    create: `Save this ${entity.toLowerCase()}?`,
    update: 'Save changes?',
    delete: 'Confirm deletion?',
    status: 'Save changes?',
    draft: `Save this ${entity.toLowerCase()} as draft?`,
  }

  const result = await Swal.fire({
    title: messages[action] || 'Continue with this operation?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: alertClasses,
  })

  return result.isConfirmed
}

export async function showSuccess(message = 'Operation completed successfully.') {
  await Swal.fire({
    title: message,
    icon: 'success',
    confirmButtonText: 'OK',
    buttonsStyling: false,
    customClass: alertClasses,
  })
}

export async function showError(message = 'Unable to complete the operation.') {
  await Swal.fire({
    title: 'Operation failed',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    buttonsStyling: false,
    customClass: alertClasses,
  })
}

export async function showDuplicate(entityName, value) {
  const entity = sentenceCase(entityName)
  await showError(`${entity} '${value}' already exists.`)
}

export function successMessage(action, entityName = 'Record') {
  const entity = sentenceCase(entityName)
  if (action === 'delete') return `${entity} deleted successfully.`
  if (action === 'update' || action === 'status') return 'Changes saved successfully.'
  if (action === 'draft') return `${entity} saved as draft.`
  return `${entity} saved successfully.`
}

export async function runConfirmedAction(
  { action = 'update', entityName = 'Record', successText } = {},
  operation,
) {
  const confirmed = await confirmAction({ action, entityName })
  if (!confirmed) return false

  const token = beginAction({ action, entityName })
  try {
    const operationResult = await operation()
    const result = finishAction(token)
    if (operationResult === false || result?.failed) {
      await showError(result?.message)
      return false
    }
    await showSuccess(successText || successMessage(action, entityName))
    return true
  } catch (error) {
    cancelAction(token)
    await showError(error?.message)
    return false
  }
}

const nextPaint = () => new Promise((resolve) => requestAnimationFrame(resolve))

export async function runConfirmedFormSubmit(
  event,
  { action = 'create', entityName = 'Record', successText } = {},
  submitHandler,
) {
  event.preventDefault()
  const form = event.currentTarget
  const forwardedEvent = {
    currentTarget: form,
    target: form,
    preventDefault() {},
  }

  // Required/min/max/pattern failures should reach the feature validator first,
  // so its existing red field message appears without an unnecessary alert.
  if (!form.checkValidity()) {
    await submitHandler(forwardedEvent)
    return false
  }

  const confirmed = await confirmAction({ action, entityName })
  if (!confirmed) return false

  const token = beginAction({ action, entityName })
  try {
    await submitHandler(forwardedEvent)
    await nextPaint()

    // Existing feature validators render their field errors with aria-invalid.
    if (form.isConnected && form.querySelector('[aria-invalid="true"]')) {
      cancelAction(token)
      return false
    }

    const result = finishAction(token)
    if (result?.failed) {
      await showError(result.message)
      return false
    }
    if (result) await showSuccess(successText || successMessage(action, entityName))
    return Boolean(result)
  } catch (error) {
    cancelAction(token)
    await showError(error?.message)
    return false
  }
}
