import { useState } from "react";
import { Button, Image, Text, View } from "react-native";
import FileService from "./fileService";
import ImagePickerService from "./imageService";

export default function App() {
  const [imageData, setImageData] = useState(null);

  const handleTakePhoto = async () => {
    const result = await ImagePickerService.getFromCamera({
      compressImageMaxWidth: 1024,
      compressImageMaxHeight: 1024,
    });
    if (!result) return;
    const currentImageUri = imageData?.uri;
    if (currentImageUri) FileService.deleteFileOrDirectory(currentImageUri);
    setImageData(result);
  };

  const handleLoadPhotoFromGallery = async () => {
    const result = await ImagePickerService.getFromPhotoLibrary();
    if (!result) return;
    const currentImageUri = imageData?.uri;
    if (currentImageUri) FileService.deleteFileOrDirectory(currentImageUri);
    setImageData(result);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Button title="Take photo" onPress={handleTakePhoto} />
      <Button title="Load from gallery" onPress={handleLoadPhotoFromGallery} />
      {!!imageData && imageData.uri && (
        <Image
          style={{ width: 300, aspectRatio: 1 }}
          source={{ uri: imageData.uri }}
        />
      )}
      {!!imageData && imageData.totalCompressionTime && (
        <Text>Total compression time: {imageData.totalCompressionTime}s</Text>
      )}
    </View>
  );
}
