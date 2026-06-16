import { DataFrame } from '@grafana/data';

function tryPrettyPrint(s: string): string {
  const trimmed = s.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return s;
    }
  }
  return s;
}

function toString(v: unknown): string {
  if (v == null) {return '';}
  if (typeof v === 'string') {return tryPrettyPrint(v);}
  if (typeof v === 'object') {return JSON.stringify(v, null, 2);}
  return String(v);
}

/**
 * Extract two text values from the first row of a DataFrame pair of columns.
 * If field names are provided they are matched by name; otherwise positional
 * order is used (first field = previous, second field = current).
 */
export function pickTexts(
  frames: DataFrame[],
  previousField?: string,
  currentField?: string,
): { previous: string; current: string } | undefined {
  for (const frame of frames) {
    if (frame.fields.length < 2 || frame.length < 1) {continue;}

    const prevF = previousField
      ? frame.fields.find((f) => f.name === previousField)
      : frame.fields[0];
    const currF = currentField
      ? frame.fields.find((f) => f.name === currentField)
      : frame.fields[1];

    if (!prevF || !currF) {continue;}

    return {
      previous: toString(prevF.values[0]),
      current: toString(currF.values[0]),
    };
  }
  return undefined;
}
