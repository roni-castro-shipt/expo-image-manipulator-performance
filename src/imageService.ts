import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { RESULTS } from "react-native-permissions";
import ImageManipulatorService, {
  CompressResult,
} from "./imageManipulatorService";
import PermissionService from "./permissionService";

/**
 * These values come from the expo-image-picker MediaType type.
 */
const MediaTypeOptions = Object.freeze({
  Images: "images",
});

const PHOTO_ORIGIN = {
  LIBRARY: "library",
  CAMERA: "camera",
};
type PhotoOrigin = (typeof PHOTO_ORIGIN)[keyof typeof PHOTO_ORIGIN];

const imagePickerOptions = {
  allowsMultipleSelection: false,
  base64: true,
  exif: true,
  quality: 0.2,
  selectionLimit: 1,
};

export type ImageResult = CompressResult & {
  uri: string;
  photoOrigin: PhotoOrigin;
  imageProcessingTime: number;
};

const transformOptions = (options = {}) => {
  return {
    allowsMultipleSelection:
      options.multiple ?? imagePickerOptions.allowsMultipleSelection,
    selectionLimit: options.maxFiles ?? imagePickerOptions.selectionLimit,
    base64: options.includeBase64 ?? imagePickerOptions.base64,
    exif: options.includeExif ?? imagePickerOptions.exif,
    quality: options.compressImageQuality ?? imagePickerOptions.quality,
    mediaTypes: MediaTypeOptions.Images,
  };
};

const handleCompression = (assets, options) => {
  const hasCompressionValues =
    options.compressImageMaxHeight || options.compressImageMaxWidth;
  if (hasCompressionValues)
    return ImageManipulatorService.compressMultipleToMaxSize(assets, options);

  const compressImageMaxSize = 1024;
  const defaultOptions = {
    quality: options.compressImageQuality || imagePickerOptions.quality,
    compressImageMaxHeight: compressImageMaxSize,
    compressImageMaxWidth: compressImageMaxSize,
  };

  return ImageManipulatorService.compressMultipleToMaxSize(
    assets,
    defaultOptions
  );
};

const getFromPhotoLibrary = async (options = {}): Promise<ImageResult> => {
  try {
    await PermissionService.verifyPhotoLibPermission();
    const transformedOptions = transformOptions(options);
    const startTime = performance.now();
    const response = await launchImageLibraryAsync(transformedOptions);
    const endTime = performance.now();
    const imageProcessingTime = endTime - startTime;

    let { assets } = response;
    if (!assets) {
      console.log("No assets from photo library");
      return {};
    }
    const assetsCompressed = await handleCompression(assets, options);

    return {
      ...assetsCompressed[0],
      photoOrigin: PHOTO_ORIGIN.LIBRARY,
      imageProcessingTime,
    };
  } catch (error) {
    if (error === RESULTS.BLOCKED || error === RESULTS.DENIED) {
      Alert.alert(
        "Photo access denied",
        "Please enable photo access in the settings app to continue.",
        [
          { text: "OK" },
          {
            text: "SETTINGS",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    } else {
      console.log(error);
    }
    return {};
  }
};

const getFromCamera = async (options = {}): Promise<ImageResult> => {
  const transformedOptions = transformOptions(options);
  try {
    await PermissionService.verifyCameraPermission();
    const startTime = performance.now();
    const response = await launchCameraAsync(transformedOptions);
    const endTime = performance.now();
    const imageProcessingTime = endTime - startTime;

    let { assets } = response;
    if (!assets) {
      return {};
    }

    const assetsCompressed = await handleCompression(assets, options);

    return {
      ...assetsCompressed[0],
      photoOrigin: PHOTO_ORIGIN.CAMERA,
      imageProcessingTime,
    };
  } catch (error) {
    if (error === RESULTS.BLOCKED || error === RESULTS.DENIED) {
      Alert.alert(
        "Camera access denied",
        "Please enable camera access in the settings app to continue.",
        [
          { text: "OK" },
          {
            text: "SETTINGS",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
    return {};
  }
};

export default { getFromCamera, getFromPhotoLibrary };
