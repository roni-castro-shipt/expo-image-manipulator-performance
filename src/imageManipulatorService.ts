import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import FileService from "./fileService";

const compressMultipleToMaxSize = (assets, options) =>
  Promise.all(assets.map((asset) => compressToMaxSize(asset, options)));

const compressToMaxSize = async (
  savedImage,
  { compressImageMaxWidth = 1024, compressImageMaxHeight = 1024, quality }
) => {
  const { uri, height, width } = savedImage;

  try {
    const aspectRatio = width / height;
    const maxWidth = Math.min(width, compressImageMaxWidth);
    const maxHeight = Math.min(height, compressImageMaxHeight);

    const newWidth = aspectRatio > 1 ? maxWidth : maxHeight * aspectRatio;
    const newHeight = aspectRatio > 1 ? maxWidth / aspectRatio : maxHeight;

    const startTime = performance.now();
    const resizedImage = await manipulateAsync(
      uri,
      [{ resize: { height: newHeight, width: newWidth } }],
      {
        compress: quality,
        base64: true,
        format: SaveFormat.JPEG,
      }
    );
    const endTime = performance.now();

    FileService.deleteFileOrDirectory(uri);

    const executionTime = ((endTime - startTime) / 1000).toFixed(2);
    return {
      totalCompressionTime: executionTime,
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
