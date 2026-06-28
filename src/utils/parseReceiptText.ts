export type ParsedReceipt = {
  vendor?: string;
  amount?: string;
  date?: string;
  category?: string;
};

const TOTAL_PATTERN =
  /(?:total|amount due|grand total|balance due|subtotal)[^\d]{0,12}(\d+[.,]\d{2})/i;
const CURRENCY_PATTERN = /[$€£]\s*(\d+[.,]\d{2})/g;
const DATE_PATTERNS = [
  /(\d{4}-\d{2}-\d{2})/,
  /(\d{2}\/\d{2}\/\d{4})/,
  /(\d{2}-\d{2}-\d{4})/,
];

const normalizeAmount = (value: string): string =>
  value.replace(',', '.').trim();

const normalizeDate = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split('-');
    return `${year}-${month}-${day}`;
  }
  return value;
};

const extractAmount = (text: string): string | undefined => {
  const totalMatch = text.match(TOTAL_PATTERN);
  if (totalMatch?.[1]) {
    return normalizeAmount(totalMatch[1]);
  }

  const amounts = [...text.matchAll(CURRENCY_PATTERN)].map(match =>
    normalizeAmount(match[1]),
  );
  if (amounts.length === 0) {
    return undefined;
  }

  return amounts
    .map(value => parseFloat(value))
    .filter(value => !Number.isNaN(value))
    .sort((a, b) => b - a)[0]
    .toFixed(2);
};

const extractDate = (text: string): string | undefined => {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return normalizeDate(match[1]);
    }
  }
  return undefined;
};

const extractVendor = (lines: string[]): string | undefined => {
  const candidate = lines.find(line => {
    const trimmed = line.trim();
    return (
      trimmed.length >= 2 &&
      trimmed.length <= 40 &&
      !/^\d+[.,]?\d*$/.test(trimmed) &&
      !/(total|subtotal|tax|change|cash|visa|mastercard|receipt)/i.test(trimmed)
    );
  });

  return candidate?.trim();
};

export const parseReceiptText = (text: string): ParsedReceipt => {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return {
    vendor: extractVendor(lines),
    amount: extractAmount(text),
    date: extractDate(text),
  };
};
