/** @file Converts Shift API records to and from form field names. */
const text = (value) => value == null ? '' : String(value)
const numberOrNull = (value) => value === '' || value == null ? null : Number(value)
const time = (value) => text(value).slice(0, 5)

export function mapShiftFromApi(record = {}, businessUnitNames = new Map()) {
  return {
    ID: text(record.id),
    BU_ID: text(record.buId),
    BUSINESS_UNIT_NAME: businessUnitNames.get(text(record.buId)) || '',
    SHIFT_TITLE: record.shiftTitle ?? '',
    SHIFT_START_TIME: time(record.shiftStartTime),
    SHIFT_END_TIME: time(record.shiftEndTime),
    APPLY_LATE_IN: text(record.applyLateIn ?? 0),
    LATE_IN_DAYS: text(record.lateInDays),
    LATE_IN_DEDUCTION: text(record.lateInDeduction),
    APPLY_EARLY_OUT: text(record.applyEarlyOut ?? 0),
    EARLY_OUT_DAYS: text(record.earlyOutDays),
    EARLY_OUT_DEDUCTION: text(record.earlyOutDeduction),
    WEEKEND: record.weekendDays ?? '',
    GRACE_TIME_MINUTES: text(record.graceTimeMinutes),
    ALLOW_LATE_IN_MSG: text(record.allowLateInMsg ?? 0),
    ALLOW_EARLY_OUT_MSG: text(record.allowEarlyOutMsg ?? 0),
    ATTN_IN_OUT_POLICY: text(record.attnInOutPolicy ?? 0),
    START_BEFORE: text(record.startBefore),
    CLOSE_AFTER: text(record.closeAfter),
    NOT_ALLOW_ATTN: text(record.notAllowAttn ?? 0),
    IN_TIME_START: time(record.inTimeStart),
    IN_TIME_CLOSE: time(record.inTimeClose),
    OUT_TIME_START: time(record.outTimeStart),
    OUT_TIME_CLOSE: time(record.outTimeClose),
    ALLOW_NEXT_DAY_ATTN: text(record.allowNextDayAttn ?? 0),
    ALLOW_OVERTIME: text(record.allowOvertime ?? 0),
    MAX_OT_HOUR: text(record.maxOtHour),
    EXTRA_OT_HOUR: text(record.extraOtHour),
    STATUS: text(record.status ?? 1),
  }
}

export function mapShiftToApi(values) {
  const appliesLateIn = values.APPLY_LATE_IN === '1'
  const appliesEarlyOut = values.APPLY_EARLY_OUT === '1'
  const hasAttendancePolicy = values.ATTN_IN_OUT_POLICY === '1'
  const allowsOvertime = values.ALLOW_OVERTIME === '1'
  const allowsLateMessage = appliesLateIn && values.ALLOW_LATE_IN_MSG === '1'
  const allowsEarlyMessage = appliesEarlyOut && values.ALLOW_EARLY_OUT_MSG === '1'

  return {
    buId: Number(values.BU_ID),
    shiftTitle: values.SHIFT_TITLE,
    shiftStartTime: values.SHIFT_START_TIME,
    shiftEndTime: values.SHIFT_END_TIME,
    applyLateIn: Number(values.APPLY_LATE_IN),
    lateInDays: appliesLateIn ? numberOrNull(values.LATE_IN_DAYS) : null,
    lateInDeduction: appliesLateIn ? numberOrNull(values.LATE_IN_DEDUCTION) : null,
    applyEarlyOut: Number(values.APPLY_EARLY_OUT),
    earlyOutDays: appliesEarlyOut ? numberOrNull(values.EARLY_OUT_DAYS) : null,
    earlyOutDeduction: appliesEarlyOut ? numberOrNull(values.EARLY_OUT_DEDUCTION) : null,
    weekendDays: values.WEEKEND,
    graceTimeMinutes: numberOrNull(values.GRACE_TIME_MINUTES),
    lateInMessage: null,
    earlyOutMessage: null,
    allowLateInMsg: allowsLateMessage ? 1 : 0,
    allowEarlyOutMsg: allowsEarlyMessage ? 1 : 0,
    attnInOutPolicy: Number(values.ATTN_IN_OUT_POLICY),
    startBefore: hasAttendancePolicy ? numberOrNull(values.START_BEFORE) : null,
    closeAfter: hasAttendancePolicy ? numberOrNull(values.CLOSE_AFTER) : null,
    notAllowAttn: hasAttendancePolicy ? Number(values.NOT_ALLOW_ATTN) : 0,
    inTimeStart: hasAttendancePolicy ? values.IN_TIME_START || null : null,
    inTimeClose: hasAttendancePolicy ? values.IN_TIME_CLOSE || null : null,
    outTimeStart: hasAttendancePolicy ? values.OUT_TIME_START || null : null,
    outTimeClose: hasAttendancePolicy ? values.OUT_TIME_CLOSE || null : null,
    allowNextDayAttn: Number(values.ALLOW_NEXT_DAY_ATTN),
    allowOvertime: Number(values.ALLOW_OVERTIME),
    maxOtHour: allowsOvertime ? numberOrNull(values.MAX_OT_HOUR) : null,
    extraOtHour: allowsOvertime ? numberOrNull(values.EXTRA_OT_HOUR) : null,
    status: Number(values.STATUS),
  }
}
