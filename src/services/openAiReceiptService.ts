import OpenAI from 'openai';
import {isOpenAiConfigured, openAiConfig} from '../config/openai';
import {EXPENSE_CATEGORIES, type ExpenseCategory} from '../types/expense';
import type {ParsedReceipt} from '../utils/parseReceiptText';

type AiReceiptResponse = {
  vendor?: string | null;
  amount?: string | null;
  date?: string | null;
  category?: string | null;
};

let client: OpenAI | null = null;

const getOpenAiClient = (): OpenAI => {
  if (!client) {
    client = new OpenAI({
      apiKey: openAiConfig.apiKey,
      baseURL: openAiConfig.baseURL,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
};

const normalizeCategory = (value: string | null | undefined): ExpenseCategory | undefined => {
  if (!value) {
    return undefined;
  }

  const match = EXPENSE_CATEGORIES.find(
    category => category.toLowerCase() === value.trim().toLowerCase(),
  );
  return match;
};

const normalizeAmount = (value: string | null | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed.toFixed(2);
};

const normalizeDate = (value: string | null | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return `${year}-${month}-${day}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('-');
    return `${year}-${month}-${day}`;
  }

  return undefined;
};

const parseAiJson = (content: string): AiReceiptResponse => {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('OpenAI response did not contain JSON.');
  }

  return JSON.parse(jsonMatch[0]) as AiReceiptResponse;
};

const buildPrompt = (ocrText: string): string =>
  `You are parsing OCR text from a receipt for an expense tracking app.

Extract these fields if possible:
- vendor: store or merchant name
- amount: total paid (numeric string with 2 decimals, no currency symbol)
- date: purchase date in YYYY-MM-DD format
- category: exactly one of ${EXPENSE_CATEGORIES.join(', ')}

Return ONLY valid JSON with keys vendor, amount, date, category.
Use null for any field you cannot determine confidently.

OCR text:
${ocrText}`;

export type AiReceiptAnalysis = {
  parsed: ParsedReceipt;
  rawResponse: string;
};

export const analyzeReceiptWithOpenAi = async (
  ocrText: string,
): Promise<AiReceiptAnalysis> => {
  if (!isOpenAiConfigured()) {
    throw new Error('OpenAI API key is not configured.');
  }

  if (!ocrText.trim()) {
    throw new Error('OCR text is empty.');
  }

  const openai = getOpenAiClient();
  const chatCompletion = await openai.chat.completions.create({
    model: openAiConfig.model,
    response_format: {type: 'json_object'},
    messages: [
      {
        role: 'user',
        content: buildPrompt(ocrText),
      },
    ],
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  const parsed = parseAiJson(content);

  if (__DEV__) {
    console.log('[OpenAI] Receipt analysis response:', content);
  }

  return {
    rawResponse: content,
    parsed: {
      vendor: parsed.vendor?.trim() || undefined,
      amount: normalizeAmount(parsed.amount),
      date: normalizeDate(parsed.date),
      category: normalizeCategory(parsed.category),
    },
  };
};
