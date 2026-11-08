/**
 * Normalizes request payload text without mutating React form state or caller-owned FormData.
 * Opaque token/CAPTCHA values are preserved; files and other non-string values are untouched.
 */
const OPAQUE_FIELD = /token|captcha/i;

function trimValue(value: unknown, fieldName?: string): unknown {
  if (typeof value === 'string') {
    return fieldName && OPAQUE_FIELD.test(fieldName) ? value : value.trim();
  }
  if (Array.isArray(value)) return value.map((item) => trimValue(item, fieldName));
  if (value !== null && typeof value === 'object' && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, trimValue(nested, key)]));
  }
  return value;
}

/** Returns a normalized copy of JSON-like request data. */
export function trimRequestData<T>(data: T): T {
  return trimValue(data) as T;
}

/** Copies FormData, trimming only text fields and preserving each file/blob unchanged. */
export function trimFormData(data: FormData): FormData {
  const normalized = new FormData();
  for (const [key, value] of data.entries()) {
    normalized.append(key, typeof value === 'string' && !OPAQUE_FIELD.test(key) ? value.trim() : value);
  }
  return normalized;
}
