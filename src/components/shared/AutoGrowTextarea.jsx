/**
 * @file Shared reusable UI/workflow component: AutoGrowTextarea.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { useLayoutEffect, useRef } from 'react'

const minimumHeight = 45
const maximumHeight = 93

function resizeTextarea(textarea) {
  if (!textarea) return

  textarea.style.height = `${minimumHeight}px`
  const nextHeight = Math.min(
    Math.max(textarea.scrollHeight, minimumHeight),
    maximumHeight,
  )

  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY =
    textarea.scrollHeight > maximumHeight ? 'auto' : 'hidden'
}

function AutoGrowTextarea({ value, onInput, rows = 1, autoGrow = true, ...props }) {
  const textareaRef = useRef(null)

  useLayoutEffect(() => {
  if (autoGrow) resizeTextarea(textareaRef.current)
}, [value, autoGrow])

const handleInput = (event) => {
  if (autoGrow) resizeTextarea(event.currentTarget)
  onInput?.(event)
}

  return (
    <textarea
      ref={textareaRef}
      rows={rows}
      value={value}
      onInput={handleInput}
      {...props}
    />
  )
}

export default AutoGrowTextarea
