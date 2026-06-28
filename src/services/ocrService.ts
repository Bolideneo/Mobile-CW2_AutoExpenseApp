import TextRecognition from '@react-native-ml-kit/text-recognition';
import {isOpenAiConfigured} from '../config/openai';
import type {ParsedReceipt} from '../utils/parseReceiptText';
import {parseReceiptText} from '../utils/parseReceiptText';
import {analyzeReceiptWithOpenAi} from './openAiReceiptService';

export type OcrResult = ParsedReceipt & {
  rawText: string;
  usedAi: boolean;
  aiRawResponse?: string;
  aiMessage?: string;
};

const mergeParsedReceipt = (
  primary: ParsedReceipt,
  fallback: ParsedReceipt,
): ParsedReceipt => ({
  vendor: primary.vendor ?? fallback.vendor,
  amount: primary.amount ?? fallback.amount,
  date: primary.date ?? fallback.date,
  category: primary.category ?? fallback.category,
});

export const recognizeReceiptText = async (imageUri: string): Promise<string> => {
  const result = await TextRecognition.recognize(imageUri);
  return result.text.trim();
};

export const extractReceiptData = async (
  imageUri: string,
): Promise<OcrResult> => {
  const rawText = await recognizeReceiptText(imageUri);
  const localParsed = parseReceiptText(rawText);

  if (__DEV__) {
    console.log('[OCR] Raw text:', rawText);
  }

  if (!rawText) {
    return {
      rawText,
      usedAi: false,
      aiMessage: 'No text found on receipt image.',
      ...localParsed,
    };
  }

  if (isOpenAiConfigured()) {
    try {
      const aiResult = await analyzeReceiptWithOpenAi(rawText);
      const merged = mergeParsedReceipt(aiResult.parsed, localParsed);

      return {
        rawText,
        usedAi: true,
        aiRawResponse: aiResult.rawResponse,
        aiMessage: 'AI analysis succeeded.',
        ...merged,
      };
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'AI request failed';

      if (__DEV__) {
        console.warn('[OpenAI] Receipt analysis failed:', detail);
      }

      return {
        rawText,
        usedAi: false,
        aiMessage: `AI failed (${detail}). Used local OCR instead.`,
        ...localParsed,
      };
    }
  }

  return {
    rawText,
    usedAi: false,
    aiMessage: 'AI not configured. Used local OCR only.',
    ...localParsed,
  };
};

export const hasExtractedValues = (result: ParsedReceipt): boolean =>
  Boolean(result.vendor || result.amount || result.date || result.category);

export const usesOpenAiForOcr = (): boolean => isOpenAiConfigured();
