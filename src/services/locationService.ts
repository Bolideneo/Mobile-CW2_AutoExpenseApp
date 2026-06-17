import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

export type LocationErrorCode = 'denied' | 'unavailable' | 'timeout';

const ANDROID_LOCATION_MESSAGE =
  'Auto Expense uses your location to tag expenses for verification.';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: ANDROID_LOCATION_MESSAGE,
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const getCurrentLocation = (): Promise<LocationCoords> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        if (error.code === 1) {
          reject(new Error('denied'));
          return;
        }
        if (error.code === 3) {
          reject(new Error('timeout'));
          return;
        }
        reject(new Error('unavailable'));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });

export const captureExpenseLocation = async (): Promise<LocationCoords> => {
  const permitted = await requestLocationPermission();
  if (!permitted) {
    throw new Error('denied');
  }
  return getCurrentLocation();
};

export const formatCoordinates = (
  latitude: number,
  longitude: number,
): string => `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

export const mapLocationError = (error: unknown): LocationErrorCode => {
  const message = error instanceof Error ? error.message : 'unavailable';
  if (message === 'denied') {
    return 'denied';
  }
  if (message === 'timeout') {
    return 'timeout';
  }
  return 'unavailable';
};
