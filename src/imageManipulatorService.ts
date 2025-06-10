import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import FileService from "./fileService";

export type CompressResult = {
  uri: string;
  compressionManipulateTime: number;
  compressionSaveSyncTime: number;
};

const compressMultipleToMaxSize = (
  assets,
  options
): Promise<CompressResult[]> =>
  Promise.all(assets.map((asset) => compressToMaxSize(asset, options)));

const compressToMaxSize = async (
  savedImage,
  { compressImageMaxWidth = 1024, compressImageMaxHeight = 1024, quality }
): Promise<CompressResult> => {
  const { uri, height, width } = savedImage;

  try {
    const aspectRatio = width / height;
    const maxWidth = Math.min(width, compressImageMaxWidth);
    const maxHeight = Math.min(height, compressImageMaxHeight);

    const newWidth = aspectRatio > 1 ? maxWidth : maxHeight * aspectRatio;
    const newHeight = aspectRatio > 1 ? maxWidth / aspectRatio : maxHeight;

    const startTimeManipulate = performance.now();
    const resizedImageRef = await ImageManipulator.manipulate(uri)
      .resize({ width: newWidth, height: newHeight })
      .renderAsync();
    const endTimeManipulate = performance.now();

    const startTimeSaveAsync = performance.now();
    const resizedImage = await resizedImageRef.saveAsync({
      compress: quality,
      base64: true,
      format: SaveFormat.JPEG,
    });
    const endTimeSaveAsync = performance.now();

    FileService.deleteFileOrDirectory(uri);

    const manipulateTime = endTimeManipulate - startTimeManipulate;
    const saveSyncTime = endTimeSaveAsync - startTimeSaveAsync;
    return {
      compressionManipulateTime: manipulateTime,
      compressionSaveSyncTime: saveSyncTime,
      ...resizedImage,
    };
  } catch {
    return { ...savedImage };
  }
};

export default {
  compressMultipleToMaxSize,
  compressToMaxSize,
};
