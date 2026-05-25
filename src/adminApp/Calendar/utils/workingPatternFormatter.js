// The 7x5 editor stores its state as { mon: number[], tue: number[], ... } where
// each value is the list of week-of-month occurrences (1..5) ticked.
// On save we simplify each row: full set -> "all", empty -> "none", else array.
export function simplifyOccurrences(occurrences) {
  const unique = Array.from(new Set(occurrences)).sort((a, b) => a - b);
  if (unique.length === 0) return "none";
  if (unique.length === 5 && unique.every((v, i) => v === i + 1)) return "all";
  return unique;
}

export function expandPatternValue(value) {
  if (value === "all") return [1, 2, 3, 4, 5];
  if (value === "none" || value == null) return [];
  if (Array.isArray(value)) return value.slice().sort((a, b) => a - b);
  return [];
}

export const DAY_KEYS_MON_FIRST = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
