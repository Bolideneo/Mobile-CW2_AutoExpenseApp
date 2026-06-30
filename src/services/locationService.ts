import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

export type LocationPlace = {
  city?: string;
  country?: string;
};

export type LocationErrorCode = 'denied' | 'unavailable' | 'timeout';

type NominatimResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

type GeoOptions = {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
};

const ANDROID_LOCATION_MESSAGE =
  'Auto Expense uses your location to tag expenses for verification.';

if (Platform.OS === 'android') {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: true,
    locationProvider: 'playServices',
  });
}

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

  const hasFine = await PermissionsAndroid.check(fine);
  const hasCoarse = await PermissionsAndroid.check(coarse);
  if (hasFine || hasCoarse) {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
  return (
    result[fine] === PermissionsAndroid.RESULTS.GRANTED ||
    result[coarse] === PermissionsAndroid.RESULTS.GRANTED
  );
};

const getPosition = (options: GeoOptions): Promise<LocationCoords> =>
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
      options,
    );
  });

const LOCATION_ATTEMPTS: GeoOptions[] = [
  // Cached / network location — fastest on real phones (especially indoors).
  {enableHighAccuracy: false, timeout: 20000, maximumAge: 300000},
  // Fresh network location.
  {enableHighAccuracy: false, timeout: 30000, maximumAge: 0},
  // GPS fix — slower; use as last resort.
  {enableHighAccuracy: true, timeout: 45000, maximumAge: 60000},
];

export const getCurrentLocation = async (): Promise<LocationCoords> => {
  let lastError: unknown;

  for (const options of LOCATION_ATTEMPTS) {
    try {
      return await getPosition(options);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : '';
      if (message === 'denied') {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('timeout');
};

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

export const reverseGeocodeLocation = async (
  coords: LocationCoords,
): Promise<LocationPlace> => {
  const {latitude, longitude} = coords;
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}` +
    `&lon=${longitude}&zoom=10&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'AutoExpense/1.0 (Mobile Coursework)',
    },
  });

  if (!response.ok) {
    throw new Error('geocode_unavailable');
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address ?? {};
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state;

  return {
    city,
    country: address.country,
  };
};

export const formatLocationLabel = (
  place: LocationPlace,
  coords?: LocationCoords,
): string => {
  const parts = [place.city, place.country].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(', ');
  }
  if (coords) {
    return formatCoordinates(coords.latitude, coords.longitude);
  }
  return 'Unknown location';
};

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
