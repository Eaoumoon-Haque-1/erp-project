/** @file Shared dependent-field behavior for Shift create and edit pages. */
export const shiftFieldMap = {
  buId: 'BU_ID', shiftTitle: 'SHIFT_TITLE', shiftStartTime: 'SHIFT_START_TIME',
  shiftEndTime: 'SHIFT_END_TIME', applyLateIn: 'APPLY_LATE_IN', lateInDays: 'LATE_IN_DAYS',
  lateInDeduction: 'LATE_IN_DEDUCTION', applyEarlyOut: 'APPLY_EARLY_OUT',
  earlyOutDays: 'EARLY_OUT_DAYS', earlyOutDeduction: 'EARLY_OUT_DEDUCTION',
  weekendDays: 'WEEKEND', graceTimeMinutes: 'GRACE_TIME_MINUTES',
  allowLateInMsg: 'ALLOW_LATE_IN_MSG', allowEarlyOutMsg: 'ALLOW_EARLY_OUT_MSG',
  attnInOutPolicy: 'ATTN_IN_OUT_POLICY', startBefore: 'START_BEFORE', closeAfter: 'CLOSE_AFTER',
  notAllowAttn: 'NOT_ALLOW_ATTN', inTimeStart: 'IN_TIME_START', inTimeClose: 'IN_TIME_CLOSE',
  outTimeStart: 'OUT_TIME_START', outTimeClose: 'OUT_TIME_CLOSE',
  allowNextDayAttn: 'ALLOW_NEXT_DAY_ATTN', allowOvertime: 'ALLOW_OVERTIME',
  maxOtHour: 'MAX_OT_HOUR', extraOtHour: 'EXTRA_OT_HOUR', status: 'STATUS',
}

export function getShiftValuePatch(name, nextValue) {
  const patch = { [name]: nextValue }

  if (name === 'APPLY_LATE_IN' && nextValue === '0') {
    Object.assign(patch, {
      LATE_IN_DAYS: '',
      LATE_IN_DEDUCTION: '',
      ALLOW_LATE_IN_MSG: '0',
    })
  }

  if (name === 'APPLY_EARLY_OUT' && nextValue === '0') {
    Object.assign(patch, {
      EARLY_OUT_DAYS: '',
      EARLY_OUT_DEDUCTION: '',
      ALLOW_EARLY_OUT_MSG: '0',
    })
  }

  if (name === 'ATTN_IN_OUT_POLICY' && nextValue === '0') {
    Object.assign(patch, {
      START_BEFORE: '',
      CLOSE_AFTER: '',
      NOT_ALLOW_ATTN: '0',
      IN_TIME_START: '',
      IN_TIME_CLOSE: '',
      OUT_TIME_START: '',
      OUT_TIME_CLOSE: '',
    })
  }

  if (name === 'ALLOW_OVERTIME' && nextValue === '0') {
    Object.assign(patch, { MAX_OT_HOUR: '', EXTRA_OT_HOUR: '' })
  }

  return patch
}

export function clearShiftFieldErrors(errors, changedFields) {
  return changedFields.reduce(
    (nextErrors, field) => ({ ...nextErrors, [field]: undefined }),
    errors,
  )
}
