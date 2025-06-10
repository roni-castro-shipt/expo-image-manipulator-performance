import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
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
    const resizedImageRef = await ImageManipulator.manipulate(uri)
      .resize({ width: newWidth, height: newHeight })
      .renderAsync();

    const resizedImage = await resizedImageRef.saveAsync({
      compress: quality,
      base64: true,
      format: SaveFormat.JPEG,
    });
    const endTime = performance.now();

    FileService.deleteFileOrDirectory(uri);

    const executionTime = endTime - startTime;
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
