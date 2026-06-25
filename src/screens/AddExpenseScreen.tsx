import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CategoryPicker} from '../components/CategoryPicker';
import {FormInput} from '../components/FormInput';
import {LocationBanner} from '../components/LocationBanner';
import type {LocationBannerStatus} from '../components/LocationBanner';
import {OcrStatusBanner} from '../components/OcrStatusBanner';
import type {OcrBannerStatus} from '../components/OcrStatusBanner';
import {PrimaryButton} from '../components/PrimaryButton';
import {ReceiptCapture} from '../components/ReceiptCapture';
import {AudioNoteSection} from '../components/AudioNoteSection';
import {VoiceNoteButton} from '../components/VoiceNoteButton';
import {insertExpense} from '../db/expenseRepository';
import type {RootStackParamList} from '../navigation/types';
import {
  createEmptyDraft,
  type ExpenseCategory,
  type ExpenseDraft,
} from '../types/expense';
import {commonStyles, spacing} from '../theme/styles';
import {
  hasValidationErrors,
  validateExpenseDraft,
  type ValidationErrors,
} from '../utils/validateExpense';
import {
  captureExpenseLocation,
  formatCoordinates,
  mapLocationError,
  type LocationErrorCode,
} from '../services/locationService';
import {
  extractReceiptData,
  hasExtractedValues,
} from '../services/ocrService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen = ({navigation}: Props) => {
  const [draft, setDraft] = useState<ExpenseDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [locationStatus, setLocationStatus] =
    useState<LocationBannerStatus>('loading');
  const [locationLabel, setLocationLabel] = useState<string>();
  const [locationError, setLocationError] = useState<LocationErrorCode>();
  const [ocrStatus, setOcrStatus] = useState<OcrBannerStatus>('idle');
  const [ocrSummary, setOcrSummary] = useState<string>();

  const tagLocation = useCallback(async () => {
    setLocationStatus('loading');
    setLocationError(undefined);
    setLocationLabel(undefined);
    try {
      const coords = await captureExpenseLocation();
      setDraft(prev => ({...prev, ...coords}));
      setLocationLabel(formatCoordinates(coords.latitude, coords.longitude));
      setLocationStatus('success');
    } catch (error) {
      const code = mapLocationError(error);
      setLocationError(code);
      setLocationStatus(code === 'denied' ? 'denied' : 'error');
    }
  }, []);

  useEffect(() => {
    tagLocation();
  }, [tagLocation]);

  const updateField = <K extends keyof ExpenseDraft>(
    key: K,
    value: ExpenseDraft[K],
  ) => {
    setDraft(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[key];
        return next;
      });
    }
  };

  const handleReceiptSelected = async (uri: string) => {
    updateField('imageUri', uri);
    setOcrStatus('loading');
    setOcrSummary(undefined);

    try {
      const extracted = await extractReceiptData(uri);
      setDraft(prev => ({
        ...prev,
        imageUri: uri,
        vendor: extracted.vendor ?? prev.vendor,
        amount: extracted.amount ?? prev.amount,
        date: extracted.date ?? prev.date,
      }));

      if (hasExtractedValues(extracted)) {
        const parts = [
          extracted.vendor ? `Vendor: ${extracted.vendor}` : null,
          extracted.amount ? `Amount: ${extracted.amount}` : null,
          extracted.date ? `Date: ${extracted.date}` : null,
        ].filter(Boolean);
        setOcrSummary(parts.join(' · '));
        setOcrStatus('success');
      } else {
        setOcrSummary('No readable fields found on this receipt.');
        setOcrStatus('error');
      }
    } catch {
      setOcrSummary('Could not read text from the receipt image.');
      setOcrStatus('error');
    }
  };

  const handleReceiptRemoved = () => {
    updateField('imageUri', undefined);
    setOcrStatus('idle');
    setOcrSummary(undefined);
  };

  const handleSave = () => {
    const validationErrors = validateExpenseDraft(draft);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      insertExpense(draft);
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'Could not save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled">
        <LocationBanner
          status={locationStatus}
          coordinates={locationLabel}
          errorCode={locationError}
          onRetry={tagLocation}
        />
        <ReceiptCapture
          imageUri={draft.imageUri}
          onImageSelected={handleReceiptSelected}
          onImageRemoved={handleReceiptRemoved}
        />
        <OcrStatusBanner status={ocrStatus} summary={ocrSummary} />
        <FormInput
          label="Vendor"
          placeholder="e.g. Starbucks"
          value={draft.vendor}
          onChangeText={text => updateField('vendor', text)}
          error={errors.vendor}
        />
        <FormInput
          label="Amount"
          placeholder="0.00"
          value={draft.amount}
          onChangeText={text => updateField('amount', text)}
          keyboardType="decimal-pad"
          error={errors.amount}
        />
        <FormInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={draft.date}
          onChangeText={text => updateField('date', text)}
          error={errors.date}
        />
        <CategoryPicker
          value={draft.category}
          onChange={(category: ExpenseCategory) =>
            updateField('category', category)
          }
          error={errors.category}
        />
        <FormInput
          label="Notes"
          placeholder="Reason for expense (optional)"
          value={draft.notes}
          onChangeText={text => updateField('notes', text)}
          multiline
          numberOfLines={3}
          error={errors.notes}
        />
        <VoiceNoteButton
          onTranscript={text =>
            updateField(
              'notes',
              draft.notes.trim() ? `${draft.notes.trim()} ${text}` : text,
            )
          }
        />
        <AudioNoteSection
          audioUri={draft.audioUri}
          onAudioChange={uri => updateField('audioUri', uri)}
        />
        <PrimaryButton
          label="Save Expense"
          onPress={handleSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});
