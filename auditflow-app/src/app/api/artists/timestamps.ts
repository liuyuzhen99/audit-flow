function hasExplicitTimezone(value: string) {
  return /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value);
}

export function normalizeBackendTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const normalized = hasExplicitTimezone(trimmed) ? trimmed : `${trimmed}Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}
