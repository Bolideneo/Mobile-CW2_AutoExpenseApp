import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Expense} from '../types/expense';
import {
  formatCoordinates,
  formatLocationLabel,
  reverseGeocodeLocation,
} from '../services/locationService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type LocationDetailRowProps = {
  expense: Expense;
};

export const LocationDetailRow = ({expense}: LocationDetailRowProps) => {
  const [label, setLabel] = useState(() => {
    if (expense.locationCity || expense.locationCountry) {
      return formatLocationLabel(
        {
          city: expense.locationCity,
          country: expense.locationCountry,
        },
        {
          latitude: expense.latitude!,
          longitude: expense.longitude!,
        },
      );
    }

    if (expense.latitude != null && expense.longitude != null) {
      return formatCoordinates(expense.latitude, expense.longitude);
    }

    return '';
  });

  useEffect(() => {
    if (expense.locationCity || expense.locationCountry) {
      return;
    }
    if (expense.latitude == null || expense.longitude == null) {
      return;
    }

    let cancelled = false;
    reverseGeocodeLocation({
      latitude: expense.latitude,
      longitude: expense.longitude,
    })
      .then(place => {
        if (cancelled) {
          return;
        }
        setLabel(
          formatLocationLabel(place, {
            latitude: expense.latitude!,
            longitude: expense.longitude!,
          }),
        );
      })
      .catch(() => {
        // Keep coordinate fallback.
      });

    return () => {
      cancelled = true;
    };
  }, [
    expense.latitude,
    expense.longitude,
    expense.locationCity,
    expense.locationCountry,
  ]);

  if (!label) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
  },
});
