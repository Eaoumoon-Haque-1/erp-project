/**
 * @file Converts Axios/backend failures into user-facing messages.
 * Feature pages provide a contextual fallback while this helper handles the
 * common response shapes returned by Spring applications.
 */
export function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  return (
    responseData?.message ||
    responseData?.error ||
    (error?.response?.status === 403
      ? 'You do not have permission to perform this action.'
      : fallbackMessage)
  )
}
