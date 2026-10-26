/**
 * @file Feature UI component for Employee Information: EmployeePhotoField.
 * Sections: local display/interaction helpers and the exported controlled component.
 * Keep page navigation and API persistence in the owning page unless this component is the workflow boundary.
 */
function EmployeePhotoField({ previewUrl, error, inputRef, onChange, readOnly = false }) {
  return (
    <div className={'erp-employee-photo-field'}>
      <span className={'erp-field-label'}>Employee's Photo</span>
      <div className={'erp-employee-photo-preview'}>
        {previewUrl ? <img src={previewUrl} alt={'Selected employee'} /> : (
          <div className={'erp-photo-placeholder'} aria-label={'No employee photo selected'}>
            <svg viewBox={'0 0 64 64'} aria-hidden={'true'}>
              <rect x={'11'} y={'9'} width={'42'} height={'46'} rx={'4'} />
              <circle cx={'32'} cy={'26'} r={'8'} />
              <path d={'M18 48c3-9 9-13 14-13s11 4 14 13'} />
            </svg>
            <span>NO IMAGE<br />AVAILABLE</span>
          </div>
        )}
      </div>
      {!readOnly && <>
        <label className={'erp-field-label'} htmlFor={'PHOTO'}>Upload Image</label>
        <input
          ref={inputRef}
          id={'PHOTO'}
          name={'PHOTO'}
          type={'file'}
          className={['erp-form-control erp-file-control', error ? 'erp-form-control-invalid' : ''].join(' ')}
          accept={'.jpg,.jpeg,.png,image/jpeg,image/png'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'PHOTO-error' : 'PHOTO-help'}
          onChange={onChange}
        />
        <p id={'PHOTO-help'} className={'erp-field-help'}>JPG, JPEG, or PNG; maximum 2 MB.</p>
      </>}
      {error && <p id={'PHOTO-error'} className={'erp-field-error'}>{error}</p>}
    </div>
  )
}

export default EmployeePhotoField
