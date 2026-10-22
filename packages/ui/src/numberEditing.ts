/** Regroup the integer text without rounding fractions or completing a partial number. */
export function createNumberEditing(locale?: string, format?: Intl.NumberFormatOptions) {
  const parts = new Intl.NumberFormat(locale, {
    ...format,
    minimumFractionDigits: 1,
    maximumFractionDigits: Math.max(1, format?.maximumFractionDigits ?? 3),
  }).formatToParts(123456789.1);
  const group = parts.find((part) => part.type === 'group')?.value ?? '';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '';
  const integerFormat = new Intl.NumberFormat(locale, {
    useGrouping: format?.useGrouping ?? true,
    maximumFractionDigits: 0,
  });

  function formatInput(input: HTMLInputElement) {
    if (group.length === 0) return;
    const text = input.value;
    const { start, end } = findIntegerRange(text, decimal, group);
    const digits = text.slice(start, end).split(group).join('');
    if (!digits) return;
    // Preserve leading zeros as editing text; the committed value is canonicalized on blur.
    const integer = /^0[0-9]/.test(digits) ? digits : integerFormat.format(BigInt(digits));
    const next = text.slice(0, start) + integer + text.slice(end);
    if (next === text) return;
    const selectionStart = input.selectionStart ?? text.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    const mapPosition = createCaretMapper(text, integer, start, end, group);
    input.value = next;
    input.setSelectionRange(mapPosition(selectionStart), mapPosition(selectionEnd));
  }

  function prepareDeletion(input: HTMLInputElement, key: string) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (group.length === 0 || start === null || start !== end) return;
    // Treat a thousands separator as decoration: delete the adjacent digit as well,
    // otherwise formatting would immediately put the separator back and trap the caret.
    if (key === 'Backspace' && input.value[start - 1] === group) {
      input.setSelectionRange(start - 1, start - 1);
    } else if (key === 'Delete' && input.value[start] === group) {
      input.setSelectionRange(start + 1, start + 1);
    }
  }

  return { formatInput, prepareDeletion };
}

/** Locate the integer independently of currency symbols and the fractional part. */
function findIntegerRange(text: string, decimal: string, group: string) {
  const integerText = decimal.length === 0 ? text : (text.split(decimal, 1)[0] ?? '');
  const start = integerText.search(/[0-9]/);
  if (start < 0) return { start: 0, end: 0 };
  let end = start;
  while (end < integerText.length && (/[0-9]/.test(text[end] ?? '') || text[end] === group)) end++;
  return { start, end };
}

/** Keep selections attached to digits when separators move around them. */
function createCaretMapper(
  text: string,
  integer: string,
  start: number,
  end: number,
  group: string,
) {
  return (position: number) => {
    if (position <= start) return position;
    if (position >= end) return position + integer.length - (end - start);
    const digitCount = text.slice(start, position).split(group).join('').length;
    let seen = 0;
    let index = 0;
    while (index < integer.length && seen < digitCount) {
      if (integer[index] !== group) seen++;
      index++;
    }
    return start + index;
  };
}
