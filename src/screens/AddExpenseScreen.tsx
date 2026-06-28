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
import {insertExpense, updateExpense, getExpenseById} from '../db/expenseRepository';
import type {RootStackParamList} from '../navigation/types';
import {
  createEmptyDraft,
  expenseToDraft,
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
  formatLocationLabel,
  mapLocationError,
  reverseGeocodeLocation,
  type LocationErrorCode,
} from '../services/locationService';
import {
  extractReceiptData,
  hasExtractedValues,
  usesOpenAiForOcr,
} from '../services/ocrService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen = ({navigation, route}: Props) => {
  const expenseId = route.params?.expenseId;
  const isEditing = Boolean(expenseId);

  const [draft, setDraft] = useState<ExpenseDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [locationStatus, setLocationStatus] =
    useState<LocationBannerStatus>('loading');
  const [locationLabel, setLocationLabel] = useState<string>();
  const [locationError, setLocationError] = useState<LocationErrorCode>();
  const [ocrStatus, setOcrStatus] = useState<OcrBannerStatus>('idle');
  const [ocrSummary, setOcrSummary] = useState<string>();
  const [ocrAiResponse, setOcrAiResponse] = useState<string>();
  const [ocrAiMessage, setOcrAiMessage] = useState<string>();
  const [ocrUsedAi, setOcrUsedAi] = useState(false);

  const applyLocation = useCallback(
    async (latitude: number, longitude: number) => {
      const coords = {latitude, longitude};
      let locationCity: string | undefined;
      let locationCountry: string | undefined;

      try {
        const place = await reverseGeocodeLocation(coords);
        locationCity = place.city;
        locationCountry = place.country;
      } catch {
        // Keep coordinates even if reverse geocoding fails offline.
      }

      setDraft(prev => ({
        ...prev,
        latitude,
        longitude,
        locationCity,
        locationCountry,
      }));
      setLocationLabel(
        formatLocationLabel({city: locationCity, country: locationCountry}, coords),
      );
      setLocationStatus('success');
    },
    [],
  );

  const tagLocation = useCallback(async () => {
    setLocationStatus('loading');
    setLocationError(undefined);
    setLocationLabel(undefined);
    try {
      const coords = await captureExpenseLocation();
      await applyLocation(coords.latitude, coords.longitude);
    } catch (error) {
      const code = mapLocationError(error);
      setLocationError(code);
      setLocationStatus(code === 'denied' ? 'denied' : 'error');
    }
  }, [applyLocation]);

  useEffect(() => {
    if (!expenseId) {
      tagLocation();
      return;
    }

    const expense = getExpenseById(expenseId);
    if (!expense) {
      navigation.goBack();
      return;
    }

    setDraft(expenseToDraft(expense));
    if (expense.latitude != null && expense.longitude != null) {
      if (expense.locationCity || expense.locationCountry) {
        setLocationLabel(
          formatLocationLabel(
            {
              city: expense.locationCity,
              country: expense.locationCountry,
            },
            {latitude: expense.latitude, longitude: expense.longitude},
          ),
        );
        setLocationStatus('success');
      } else {
        setLocationStatus('loading');
        applyLocation(expense.latitude, expense.longitude).catch(() => {
          setLocationLabel(
            formatCoordinates(expense.latitude!, expense.longitude!),
          );
          setLocationStatus('success');
        });
      }
    } else {
      tagLocation();
    }
  }, [expenseId, navigation, tagLocation, applyLocation]);

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
    setOcrAiResponse(undefined);
    setOcrAiMessage(undefined);
    setOcrUsedAi(false);

    try {
      const extracted = await extractReceiptData(uri);
      setOcrUsedAi(extracted.usedAi);
      setOcrAiResponse(extracted.aiRawResponse);
      setOcrAiMessage(extracted.aiMessage);
      setDraft(prev => ({
        ...prev,
        imageUri: uri,
        vendor: extracted.vendor ?? prev.vendor,
        amount: extracted.amount ?? prev.amount,
        date: extracted.date ?? prev.date,
        category: extracted.category ?? prev.category,
      }));

      if (hasExtractedValues(extracted)) {
        const parts = [
          extracted.vendor ? `Vendor: ${extracted.vendor}` : null,
          extracted.amount ? `Amount: ${extracted.amount}` : null,
          extracted.date ? `Date: ${extracted.date}` : null,
          extracted.category ? `Category: ${extracted.category}` : null,
          extracted.usedAi ? 'AI-assisted' : null,
        ].filter(Boolean);
        setOcrSummary(parts.join(' · '));
        setOcrStatus('success');
      } else {
        setOcrSummary(
          usesOpenAiForOcr()
            ? 'OCR ran but no fields could be extracted. Enter details manually.'
            : 'No readable fields found on this receipt.',
        );
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
    setOcrAiResponse(undefined);
    setOcrAiMessage(undefined);
    setOcrUsedAi(false);
  };

  const handleSave = () => {
    const validationErrors = validateExpenseDraft(draft);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEditing && expenseId) {
        updateExpense(expenseId, draft);
      } else {
        insertExpense(draft);
      }
      navigation.goBack();
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        isEditing ? 'Update failed' : 'Save failed',
        `Could not save expense. ${detail}`,
      );
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
          error={errors.imageUri}
          onImageSelected={handleReceiptSelected}
          onImageRemoved={handleReceiptRemoved}
        />
        <OcrStatusBanner
          status={ocrStatus}
          summary={ocrSummary}
          aiEnabled={usesOpenAiForOcr()}
          usedAi={ocrUsedAi}
          aiMessage={ocrAiMessage}
          aiRawResponse={ocrAiResponse}
        />
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
          label={isEditing ? 'Update Expense' : 'Save Expense'}
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
