import TextRecognition from '@react-native-ml-kit/text-recognition';
import type {ParsedReceipt} from '../utils/parseReceiptText';
import {parseReceiptText} from '../utils/parseReceiptText';

export type OcrResult = ParsedReceipt & {
  rawText: string;
};

export const recognizeReceiptText = async (imageUri: string): Promise<string> => {
  const result = await TextRecognition.recognize(imageUri);
  return result.text.trim();
};

export const extractReceiptData = async (
  imageUri: string,
): Promise<OcrResult> => {
  const rawText = await recognizeReceiptText(imageUri);
  const parsed = parseReceiptText(rawText);

  return {
    rawText,
    vendor: parsed.vendor,
    amount: parsed.amount,
    date: parsed.date,
  };
};

export const hasExtractedValues = (result: ParsedReceipt): boolean =>
  Boolean(result.vendor || result.amount || result.date);
