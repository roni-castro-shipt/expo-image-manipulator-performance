import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { RESULTS } from "react-native-permissions";
import ImageManipulatorService from "./imageManipulatorService";
import PermissionService from "./permissionService";

const PHOTO_ORIGIN = {
  LIBRARY: "library",
  CAMERA: "camera",
};

const imagePickerOptions = {
  allowsMultipleSelection: false,
  base64: true,
  exif: true,
  quality: 0.2,
  selectionLimit: 1,
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

const getFromPhotoLibrary = async (options = {}) => {
  try {
    await PermissionService.verifyPhotoLibPermission();
    const transformedOptions = transformOptions(options);
    const response = await launchImageLibraryAsync(transformedOptions);

    let { assets } = response;
    if (!assets) {
      console.log("No assets from photo library");
      return {};
    }
    assets = await handleCompression(assets, options);

    return { ...assets[0], photoOrigin: PHOTO_ORIGIN.LIBRARY };
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

const getFromCamera = async (options = {}) => {
  const transformedOptions = transformOptions(options);
  try {
    await PermissionService.verifyCameraPermission();
    const response = await launchCameraAsync(transformedOptions);

    let { assets } = response;
    if (!assets) {
      return {};
    }

    assets = await handleCompression(assets, options);

    return { ...assets[0], photoOrigin: PHOTO_ORIGIN.CAMERA };
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
