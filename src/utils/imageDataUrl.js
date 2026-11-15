import { API_BASE_URL } from '../api/client'

/**
 * Shared helpers for image fields backed by JSON string columns.
 * New files are sent as data URLs; existing API strings pass through unchanged.
 * Employee photos are different: they are uploaded and stored as a relative
 * /uploads/... URL, which getImageSource resolves against the API server.
 */
export const IMAGE_FILE_ACCEPT =
  '.jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml'

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
]

export function fileToDataUrl(value) {
  if (!(value instanceof File)) return Promise.resolve(value || '')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.readAsDataURL(value)
  })
}

/**
 * Accept full data URLs, web/blob URLs, or raw Base64 returned by an API.
 * Plain filenames cannot be displayed without a backend file-serving URL.
 */
export function getImageSource(value) {
  const source = String(value || '').trim()
  if (!source) return ''

  if (/^(data:image\/|https?:\/\/|blob:)/i.test(source)) return source

  // Uploaded files are served by the backend, not by the frontend host.
  if (source.startsWith('/uploads/')) {
    try {
      return `${new URL(API_BASE_URL).origin}${source}`
    } catch {
      return source
    }
  }

  const compactSource = source.replace(/\s/g, '')
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(compactSource) && compactSource.length >= 32) {
    return `data:image/png;base64,${compactSource}`
  }

  return ''
}

export function validateOptionalImage(value, label = 'Image') {
  if (!(value instanceof File)) return ''
  if (!SUPPORTED_IMAGE_TYPES.includes(value.type)) {
    return `${label} must be a JPG, JPEG, PNG, or SVG image.`
  }
  if (value.size > IMAGE_MAX_BYTES) return `${label} must not exceed 2 MB.`
  return ''
}
