/**
 * @file Shared ISO-date parsing, storage formatting, and DD/MM/YYYY display utilities.
 * Sections: strict ISO parsing, Date-to-ISO conversion, and user-facing formatting.
 * Keep stored values ISO and change display formatting only through these helpers.
 */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}

export function formatIsoDate(date) {
  if (!date) return "";
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatDateForDisplay(value) {
  // State/API values stay ISO; only the displayed value becomes DD/MM/YYYY.
  const date = parseIsoDate(value);
  if (!date) return value || "";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getFullYear()).padStart(4, "0"),
  ].join("/");
}


