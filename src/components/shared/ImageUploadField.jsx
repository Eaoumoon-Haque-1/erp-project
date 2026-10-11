/**
 * Reusable image picker for APIs that store images as strings in JSON.
 * It previews selected Files and valid image strings returned by the backend.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  getImageSource,
  IMAGE_FILE_ACCEPT,
} from '../../utils/imageDataUrl'

function ImagePreview({ source, alt, emptyLabel }) {
  const [failed, setFailed] = useState(false)

  if (source && !failed) {
    return <img src={source} alt={alt} onError={() => setFailed(true)} />
  }

  return (
    <div className={'erp-photo-placeholder'} aria-label={emptyLabel}>
      <svg viewBox={'0 0 64 64'} aria-hidden={'true'}>
        <rect x={'9'} y={'9'} width={'46'} height={'46'} rx={'4'} />
        <circle cx={'25'} cy={'25'} r={'6'} />
        <path d={'m14 48 12-12 8 8 6-6 10 10'} />
      </svg>
      <span>
        NO IMAGE
        <br />
        AVAILABLE
      </span>
    </div>
  )
}

function ImageUploadField({
  name,
  title,
  uploadLabel = 'Upload Image',
  value,
  error,
  onChange,
  inputRef,
}) {
  const objectUrl = useMemo(
    () => (value instanceof File ? URL.createObjectURL(value) : ''),
    [value],
  )
  const source = objectUrl || getImageSource(value)

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    },
    [objectUrl],
  )

  return (
    <div className={'erp-business-logo-field'}>
      <span className={'erp-field-label'}>{title}</span>
      <div className={'erp-business-logo-preview'}>
        <ImagePreview
          key={source}
          source={source}
          alt={`Selected ${title.toLowerCase()}`}
          emptyLabel={`No ${title.toLowerCase()} selected`}
        />
      </div>
      <label className={'erp-field-label'} htmlFor={name}>
        {uploadLabel}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={'file'}
        className={[
          'erp-form-control',
          'erp-file-control',
          error ? 'erp-form-control-invalid' : '',
        ].join(' ')}
        accept={IMAGE_FILE_ACCEPT}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : `${name}-help`}
        onChange={onChange}
      />
      <p id={`${name}-help`} className={'erp-field-help'}>
        JPG, JPEG, PNG, or SVG; maximum 2 MB. Recommended: 512 × 512 px.
      </p>
      {error && (
        <p id={`${name}-error`} className={'erp-field-error'}>
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUploadField
