import { Platform } from "react-native";
import {
  check,
  request,
  RESULTS,
  PERMISSIONS as RN_PERMISSIONS,
} from "react-native-permissions";

const verifyCameraPermission = async () => {
  const permission =
    Platform.OS === "ios"
      ? RN_PERMISSIONS.IOS.CAMERA
      : RN_PERMISSIONS.ANDROID.CAMERA;
  return await verifyPermission(permission);
};

const verifyPhotoLibPermission = async () => {
  let permission;
  if (Platform.OS === "ios") permission = RN_PERMISSIONS.IOS.PHOTO_LIBRARY;
  if (Platform.OS === "android" && Platform.Version < 33)
    permission = RN_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  if (Platform.OS === "android" && Platform.Version >= 33) return;
  return await verifyPermission(permission);
};

const verifyPermission = async (permission) => {
  let status;
  try {
    status = await check(permission);
    if (status === RESULTS.DENIED) {
      try {
        status = await request(permission);
      } catch {}
    }

    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) return status;
    return Promise.reject(status);
  } catch (e) {
    console.log(e);
  }
};

export default {
  verifyCameraPermission,
  verifyPhotoLibPermission,
};
