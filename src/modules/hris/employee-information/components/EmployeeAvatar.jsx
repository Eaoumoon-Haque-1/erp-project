/**
 * @file Small round employee photo for list rows. When there is no photo, or the
 * image cannot be loaded, it shows the employee's initials instead of a broken image.
 */
import { useState } from 'react'
import { getImageSource } from '../../../../utils/imageDataUrl'

function getInitials(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('')
}

function EmployeeAvatar({ name, photo }) {
  const source = getImageSource(photo)
  const [failedSource, setFailedSource] = useState('')

  if (source && failedSource !== source) {
    return (
      <img
        className={'erp-employee-avatar'}
        src={source}
        alt={`${name || 'Employee'} photo`}
        loading={'lazy'}
        onError={() => setFailedSource(source)}
      />
    )
  }

  return (
    <span
      className={'erp-employee-avatar erp-employee-avatar-fallback'}
      role={'img'}
      aria-label={`${name || 'Employee'} has no photo`}
    >
      {getInitials(name)}
    </span>
  )
}

export default EmployeeAvatar
