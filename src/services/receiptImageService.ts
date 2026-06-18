import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';

export type ReceiptPickSource = 'camera' | 'gallery';

export type ReceiptImageResult = {
  uri: string;
  fileName?: string;
};

const CAMERA_MESSAGE =
  'Auto Expense needs camera access to scan receipt photos.';

const sharedOptions: CameraOptions & ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
  includeBase64: false,
};

const mapAsset = (asset: Asset): ReceiptImageResult | null => {
  if (!asset.uri) {
    return null;
  }
  return {
    uri: asset.uri,
    fileName: asset.fileName,
  };
};

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  if (granted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera permission',
      message: CAMERA_MESSAGE,
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const captureReceiptPhoto = async (): Promise<ReceiptImageResult | null> => {
  const permitted = await requestCameraPermission();
  if (!permitted) {
    Alert.alert(
      'Camera denied',
      'Enable camera access in settings to scan receipts.',
    );
    return null;
  }

  const response = await launchCamera({...sharedOptions, saveToPhotos: false});
  if (response.didCancel || response.errorCode) {
    return null;
  }

  const asset = response.assets?.[0];
  return asset ? mapAsset(asset) : null;
};

export const pickReceiptFromGallery =
  async (): Promise<ReceiptImageResult | null> => {
    const response = await launchImageLibrary(sharedOptions);
    if (response.didCancel || response.errorCode) {
      return null;
    }

    const asset = response.assets?.[0];
    return asset ? mapAsset(asset) : null;
  };

export const pickReceiptImage = async (
  source: ReceiptPickSource,
): Promise<ReceiptImageResult | null> =>
  source === 'camera' ? captureReceiptPhoto() : pickReceiptFromGallery();
